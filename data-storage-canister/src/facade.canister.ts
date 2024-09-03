import {
  blob,
  bool,
  Canister,
  Err,
  ic,
  int,
  nat,
  None,
  Ok,
  Principal,
  query,
  Result,
  Some,
  StableBTreeMap,
  text,
  update,
} from "azle";
import { managementCanister } from "azle/canisters/management";

import {
  Error,
  User,
  Service,
  FilePayload,
  FileResponse,
  FileChunkResponse,
} from "./types";
import { bigIntToNumber, getCanisterStatus } from "./utils";

import StorageCanister from "./storage.canister";

const codeStorage = StableBTreeMap(int, blob, 0);
const userStorage = StableBTreeMap(text, User, 1);
const serviceStorage = StableBTreeMap(Principal, Service, 2);

export default Canister({
  /**
   * Initializes the canister by adding a new user during deployment.
   * @param serviceId - The Principal ID of the service with access.
   * @returns Result indicating success or an error.
   */
  initializeCanister: update([Principal], Result(bool, Error), (serviceId) => {
    if (!ic.caller().compareTo(ic.id())) {
      return Err({ Unauthorized: "Unauthorized access!" });
    }

    if (serviceStorage.keys().length > 0) {
      return Err({
        Unauthorized: "Canister already has an authorized service ID!",
      });
    }

    if (serviceStorage.containsKey(serviceId)) {
      return Err({ Conflict: "Service already exists!" });
    }

    const newService: typeof Service = {
      id: serviceId,
      createdAt: ic.time(),
    };

    serviceStorage.insert(serviceId, newService);

    return Ok(true);
  }),

  /**
   * Loads child canister's wasm output code and stores it.
   *
   * @param blob - The Blob containing the wasm code.
   * @returns Result indicating success or an error.
   */
  loadCanisterCode: update([blob], Result(bool, Error), (blob) => {
    if (
      serviceStorage.keys().length > 0 &&
      !serviceStorage.containsKey(ic.caller())
    ) {
      return Err({ Unauthorized: "Unauthorized access!" });
    }

    if (!ic.caller().compareTo(ic.id())) {
      return Err({ Unauthorized: "Unauthorized access!" });
    }

    if (!blob || !blob.byteLength) {
      let errorMessage = "Invalid payload for canister code!";

      if (!blob) {
        errorMessage += " Blob is null or undefined.";
      } else {
        errorMessage += ` Blob size: ${blob.byteLength} bytes.`;
      }

      return Err({
        InvalidPayload: errorMessage,
      });
    }

    codeStorage.insert(0, blob);

    return Ok(true);
  }),

  /**
   * Function to handle file uploads and dynamically create user canisters.
   *
   * @param file - The file data.
   * @param userId - The Mongoose ID of the user.
   * @param isChunked - A boolean indicating if the file upload is chunked.
   * @returns Result indicating success or an error.
   */
  uploadFile: update(
    [FilePayload, text, bool],
    Result(FileResponse, Error),
    async (file, userId, isChunked) => {
      if (!serviceStorage.containsKey(ic.caller())) {
        return Err({ Unauthorized: "Unauthorized access!" });
      }

      const targetCanisterId = await findOrCreateCanister(userId, file.size);

      if (!targetCanisterId) {
        return Err({ NotKnown: "Failed to find or create canister." });
      }

      ic.print(
        `Using canister '${targetCanisterId}' now uploading the file...`,
      );

      const storageCanister = StorageCanister(targetCanisterId);

      const uploadResult = await ic.call(storageCanister.uploadFile, {
        args: [file, isChunked],
      });

      if (uploadResult.Err) {
        return Err({
          UploadError: `Failed to upload file. Error: ${JSON.stringify(
            uploadResult.Err,
          )}`,
        });
      }

      ic.print("Upload was successful.");

      return Ok({
        id: file.id,
        name: file.name,
        canisterId: targetCanisterId.toText(),
      });
    },
  ),

  /**
   * Function to handle retrieving files.
   *
   * @param userId - The Principal ID of the user.
   * @param fileId - The MongoDB ID of the file.
   * @param canisterId - The Principal ID of the storage canister where the file is stored.
   * @param chunkNumber - The chunk number to retrieve (optional for chunked files).
   * @returns Result indicating success or an error.
   */
  getFile: query(
    [text, text, text, nat],
    Result(FileChunkResponse, Error),
    async (userId, fileId, canisterId, chunkNumber) => {
      if (!serviceStorage.containsKey(ic.caller())) {
        return Err({ Unauthorized: "Unauthorized access!" });
      }

      const user = userStorage.get(userId);

      if (!user || user.None || !user.Some || !user.Some.canisters.length) {
        return Err({
          NotFound: `Could not find user with given id=${userId}!`,
        });
      }

      let targetCanisterId = user.Some.canisters.find(
        (x: string) => x === canisterId,
      );

      if (!targetCanisterId) {
        return Err({
          NotFound: `Could not find canister with given id=${canisterId}`,
        });
      }

      targetCanisterId = Principal.fromText(targetCanisterId);

      const storageCanister = StorageCanister(targetCanisterId);

      const fileResult = await ic.call(storageCanister.getFile, {
        args: [fileId, chunkNumber],
      });

      if (fileResult.Err) {
        return Err({
          NotKnown: `Failed to get file. Error: ${JSON.stringify(
            fileResult.Err,
          )}`,
        });
      }

      return Ok(fileResult.Ok);
    },
  ),
});

async function deployCanister(): Promise<Principal | null> {
  const createCanisterResult = await ic.call(
    managementCanister.create_canister,
    {
      args: [
        {
          settings: Some({
            controllers: Some([ic.id()]),
            compute_allocation: None,
            memory_allocation: None,
            freezing_threshold: None,
          }),
        },
      ],
      cycles: 100_000_000_000_000n,
    },
  );

  const canisterId = createCanisterResult.canister_id;

  const hasCode = codeStorage.get(0).Some;

  if (!hasCode) return null;

  const binaryBuffer = Buffer.from(hasCode, "binary");
  const wasmModuleArray: number[] = Array.from(binaryBuffer);

  await ic.call(managementCanister.install_code, {
    args: [
      {
        mode: { install: null },
        canister_id: canisterId,
        wasm_module: Uint8Array.from(wasmModuleArray) as any,
        arg: Uint8Array.from([]),
      },
    ],
    cycles: 100_000_000_000n,
  });

  ic.print("Successfully created/deployed canister! " + canisterId);

  return canisterId;
}

async function findOrCreateCanister(
  userId: text,
  fileSize: bigint,
): Promise<Principal | null> {
  const user = userStorage.get(userId);

  // ic.print("userData" + JSON.stringify(user.Some, null, 4));

  if (!user || !user.Some) {
    // ic.print(`User "${userId}" is not found. Creating record for it now..`);

    const canisterId = await deployCanister();

    if (!canisterId) {
      return null;
    }

    const newUser: typeof User = {
      userId: userId,
      canistersMarkedFull: [],
      canisters: [canisterId.toString()],
    };

    userStorage.insert(userId, newUser);

    return canisterId;
  } else {
    return findCanisterWithFreeSpace(user.Some, fileSize);
  }
}

async function findCanisterWithFreeSpace(
  user: typeof User,
  fileSize: nat,
): Promise<Principal | null> {
  // Filter out canisters marked as full
  const availableCanisters = user.canisters.filter(
    (canisterId) => !user.canistersMarkedFull?.includes(canisterId),
  );

  for (const canisterId of availableCanisters) {
    // ic.print("Searching for a canister with free space...");

    const canisterPrincipal = Principal.fromText(canisterId);

    const canisterStatus = await getCanisterStatus(canisterPrincipal);
    const storageLimit = 50 * 1024 * 1024 * 1024;
    const threshold = 0.95;

    const availableStorage =
      storageLimit - bigIntToNumber(canisterStatus.memory_size);

    if (availableStorage >= fileSize) {
      return canisterPrincipal;
    } else if (
      availableStorage >= storageLimit * threshold &&
      !user.canistersMarkedFull?.includes(canisterId)
    ) {
      user.canistersMarkedFull = user.canistersMarkedFull || [];
      user.canistersMarkedFull.push(canisterId);
    }
  }

  const canisterId = await deployCanister();

  if (!canisterId) {
    return null;
  }

  user.canisters.push(canisterId.toString());

  return canisterId;
}
