import {
  Canister,
  Err,
  Ok,
  Result,
  StableBTreeMap,
  bool,
  ic,
  nat,
  query,
  text,
  update,
} from "azle";

import { Error, File, FileChunkResponse, FilePayload } from "./types";
import { bigIntToNumber } from "./utils";

const fileStorage = StableBTreeMap(text, File, 0);

export default Canister({
  /**
   * Function to handle file uploads to the user's canister.
   * @param file - The file data.
   * @param isChunked - Boolean indicating whether the file upload is chunked.
   * @returns Result indicating success or an error.
   */
  uploadFile: update(
    [FilePayload, bool],
    Result(bool, Error),
    (file, isChunked) => {
      if (!ic.isController(ic.caller())) {
        return Err({ Unauthorized: "Unauthorized access!" });
      }

      const existingFile = fileStorage.get(file.id).Some;

      if (isChunked && existingFile) {
        const updatedContent = new Uint8Array(
          existingFile.content.length + file.content.length,
        );
        updatedContent.set(existingFile.content, 0);
        updatedContent.set(file.content, existingFile.content.length);

        const updateFile: typeof File = {
          ...existingFile,
          content: updatedContent,
        };

        fileStorage.insert(file.id, updateFile);
      } else {
        const newFile: typeof File = {
          ...file,
          createdAt: ic.time(),
        };

        fileStorage.insert(file.id, newFile);
      }

      return Ok(true);
    },
  ),

  /**
   * Function to handle getting files.
   * @param fileId - The file ID.
   * @param chunkNumber - The number of the requested chunk.
   * @returns Result file or an error.
   */
  getFile: query(
    [text, nat],
    Result(FileChunkResponse, Error),
    (fileId, chunkNumber) => {
      if (!ic.isController(ic.caller())) {
        return Err({ Unauthorized: "Unauthorized access!" });
      }

      const file = fileStorage.get(fileId).Some;

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

      const offset = bigIntToNumber(chunkNumber) * maxChunkSize;
      const chunk = fileContent.slice(offset, offset + maxChunkSize);

      const hasNext = offset + maxChunkSize < fileContent.length;

      return Ok({
        id: file.id,
        name: file.name,
        chunk: chunk,
        hasNext: hasNext,
      });
    },
  ),
});
