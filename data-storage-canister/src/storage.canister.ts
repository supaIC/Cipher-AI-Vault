import {
  Canister,
  Err,
  Ok,
  Result,
  StableBTreeMap,
  bool,
  ic,
  nat,
  nat64,
  Principal,
  query,
  text,
  update,
} from "azle/experimental";
import { Error, File, FileChunkResponse, FilePayload, Service } from "./types";

const fileStorage = StableBTreeMap<string, File>(0);
const serviceStorage = StableBTreeMap<Principal, Service>(1);

export default Canister({
  uploadFile: update(
    [FilePayload, bool],
    Result(bool, Error),
    (file, isChunked) => {
      if (!ic.isController(ic.caller())) {
        return Err({ Unauthorized: "Unauthorized access!" });
      }

      const existingFile = fileStorage.get(file.id);

      if (isChunked && existingFile) {
        const updatedContent = new Uint8Array(
          existingFile.content.length + file.content.length,
        );
        updatedContent.set(existingFile.content, 0);
        updatedContent.set(file.content, existingFile.content.length);

        const updatedFile: File = {
          ...existingFile,
          content: updatedContent,
        };

        fileStorage.insert(file.id, updatedFile);
      } else {
        const newFile: File = {
          ...file,
          createdAt: ic.time() as nat64, // nat64 conversion
        };

        fileStorage.insert(file.id, newFile);
      }

      return Ok(true);
    }
  ),
  
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

    const newService: Service = {
      id: serviceId,
      createdAt: ic.time() as nat64, // nat64 conversion
    };

    serviceStorage.insert(serviceId, newService);

    return Ok(true);
  }),

  getFile: query([text, nat], Result(FileChunkResponse, Error), (fileId, chunkNumber) => {
    if (!ic.isController(ic.caller())) {
      return Err({ Unauthorized: "Unauthorized access!" });
    }

    const file = fileStorage.get(fileId);

    if (!file) {
      return Err({ NotFound: `Could not find file with given id=${fileId}` });
    }

    const fileContent = file.content;

    const maxChunkSize = 1.8 * 1024 * 1024; // 2MB

    if (fileContent.length < maxChunkSize) {
      return Ok({
        id: file.id,
        name: file.name,
        chunk: fileContent,
        hasNext: false,
      });
    }

    const offset = Number(chunkNumber) * maxChunkSize;
    const chunk = fileContent.slice(offset, offset + maxChunkSize);

    const hasNext = offset + maxChunkSize < fileContent.length;

    return Ok({
      id: file.id,
      name: file.name,
      chunk,
      hasNext,
    });
  })
});
