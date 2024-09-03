// This function is run by queue
export async function handleFileUpload(job) {
  try {
    const { userId, id, name, size, path, mimetype, organizationId } =
      job.data.data;

    if (!path) {
      throw new Error('Missing path in file data');
    }

    const isExistsLocally = await checkFileExists(path);
    if (!isExistsLocally) {
      throw new Error(`File not found locally: ${path}`);
    }

    const file = await fs.promises.readFile(path);
    const fileBlob = new Blob(file, { type: mimetype });
    const fileUintArray = new Uint8Array(file);

    if (!fileBlob || !fileUintArray) {
      throw new Error(`Could not read the file: ${path}`);
    }

    // Check if the file size is larger than 1.5MB
    const maxChunkSize = 1.5 * 1024 * 1024; // 1.5MB

    const filePayload = {
      id,
      name,
      size,
      content: fileUintArray,
    };

    let result;

    if (fileBlob.size > maxChunkSize) {
      // File needs to be chunked
      let offset = 0;
      while (offset < size) {
        const chunk = fileUintArray.slice(offset, offset + maxChunkSize);
        filePayload.content = chunk;

        // eslint-disable-next-line no-await-in-loop
        result = await facade.uploadFile(filePayload, userId, true);

        // Update offset for the next chunk
        offset += maxChunkSize;
      }
    } else {
      // File is small, upload as a single chunk
      result = await facade.uploadFile(filePayload, userId, false);
    }

    console.log(
      `[STORAGE_CANISTER_UPLOAD_RESULT]: ${JSON.stringify(result, null, 4)}`
    );

    if (result.Ok) {
      await File.updateOne(
        { organization: organizationId, fileName: name, fileLocation: path },
        {
          canisterLocation: JSON.stringify(result.Ok),
        }
      );

      const logResult = await tracing.addLog(userId, 'uploaded', id, name);

      const serializedLogResult = JSON.stringify(
        logResult,
        (key, value) => {
          if (typeof value === 'bigint') {
            return value.toString();
          }
          return value;
        },
        4
      );

      console.log(`[TRACING_CANISTER_ADD_LOG_RESULT]: ${serializedLogResult}`);

      console.log(`File upload successful for user ${userId}, fileId: ${id}`);
    }
  } catch (error) {
    console.error(`File upload failed: ${error.message}`);
  }
}

// This function should be run when there is need to read the file
export async function getAndConcatenateFile(userId, fileId, canisterId) {
  let chunkNumber = 0;
  let concatenatedFile = new Uint8Array();

  let fileData = {};

  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const fileResponse = await facade.getFile(
      userId,
      fileId,
      canisterId,
      chunkNumber
    );

    console.log('[FILE_RESPONSE]', fileResponse);

    if (!fileResponse.Ok) {
      console.error('Failed to retrieve file chunk.');
      return;
    }

    // Append the current chunk to the concatenated file
    concatenatedFile = new Uint8Array([
      ...concatenatedFile,
      ...fileResponse.Ok.chunk,
    ]);

    if (!fileResponse.Ok.hasNext) {
      // No more chunks, exit the loop
      fileData = {
        id: fileResponse.Ok.id,
        name: fileResponse.Ok.name,
      };
      break;
    }

    // Increment the chunk number for the next iteration
    chunkNumber++;
  }

  // For testing purposes
  // try {
  //   await fs.promises.writeFile(`./${fileData.name}`, concatenatedFile);

  //   console.log('Concatenated File saved successfully:');
  // } catch (error) {
  //   console.error('Error saving concatenated file:', error);
  // }

  return uint8ToBase64(concatenatedFile);
}


// =============================================================================

// Tracing canister usage:

// await tracing.addLog(userId, 'consumed', fileId, fileName);
