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
} from "azle/experimental";
import { managementCanister } from "azle/experimental/canisters/management";

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

// Create StableBTreeMaps with the correct type parameters
const codeStorage = StableBTreeMap<int, Uint8Array>(0);
const userStorage = StableBTreeMap<string, User>(1);
const serviceStorage = StableBTreeMap<Principal, Service>(2);

export default Canister({
  initializeCanister: update([Principal], Result(bool, Error), (serviceId) => {
    if (!ic.caller().compareTo(ic.id())) {
      return Err({ Unauthorized: "Unauthorized access!" });
    }

    if (serviceStorage.len() > 0n) { // Use `len()` method for length check
      return Err({
        Unauthorized: "Canister already has an authorized service ID!",
      });
    }

    if (serviceStorage.containsKey(serviceId)) {
      return Err({ Conflict: "Service already exists!" });
    }

    const newService: Service = {
      id: serviceId,
      createdAt: ic.time() as nat, // Cast `ic.time()` to `nat`
    };

    serviceStorage.insert(serviceId, newService);

    return Ok(true);
  }),

  loadCanisterCode: update([blob], Result(bool, Error), (blob) => {
    if (
      serviceStorage.len() > 0n &&
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

    codeStorage.insert(0n, blob);

    return Ok(true);
  }),
  
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

  getFile: query(
    [text, text, text, nat],
    Result(FileChunkResponse, Error),
    async (userId, fileId, canisterId, chunkNumber) => {
      if (!serviceStorage.containsKey(ic.caller())) {
        return Err({ Unauthorized: "Unauthorized access!" });
      }

      const user = userStorage.get(userId);

      if (!user) {
        return Err({
          NotFound: `Could not find user with given id=${userId}!`,
        });
      }

      let targetCanisterId = user.canisters.find(
        (x: string) => x === canisterId,
      );

      if (!targetCanisterId) {
        return Err({
          NotFound: `Could not find canister with given id=${canisterId}`,
        });
      }

      const targetCanisterPrincipal = Principal.fromText(targetCanisterId);

      const storageCanister = StorageCanister(targetCanisterPrincipal);

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
    },  ),
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
            reserved_cycles_limit: None,
          }),
          sender_canister_version: None
        },
      ],
      cycles: 100_000_000_000_000n,
    },
  );

  const canisterId = createCanisterResult.canister_id;

  const hasCode = codeStorage.get(0n);

  if (!hasCode) return null;

  const wasmModuleArray = Array.from(hasCode);

  await ic.call(managementCanister.install_code, {
    args: [
      {
        mode: { install: null },
        canister_id: canisterId,
        wasm_module: Uint8Array.from(wasmModuleArray),
        arg: Uint8Array.from([]),
        sender_canister_version: None
      },
    ],
    cycles: 100_000_000_000n,
  });

  ic.print("Successfully created/deployed canister! " + canisterId);

  return canisterId;
}
async function findOrCreateCanister(  userId: string,
  fileSize: bigint,
): Promise<Principal | null> {
  const user = userStorage.get(userId);

  if (!user) {
    const canisterId = await deployCanister();

    if (!canisterId) {
      return null;
    }

    const newUser: User = {
      userId: userId,
      canistersMarkedFull: [],
      canisters: [canisterId.toText()],
    };

    userStorage.insert(userId, newUser);

    return canisterId;
  } else {
    return findCanisterWithFreeSpace(user, fileSize);
  }
}

async function findCanisterWithFreeSpace(
  user: User,
  fileSize: nat,
): Promise<Principal | null> {
  const availableCanisters = user.canisters.filter(
    (canisterId) => !user.canistersMarkedFull?.includes(canisterId),
  );

  for (const canisterId of availableCanisters) {
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
