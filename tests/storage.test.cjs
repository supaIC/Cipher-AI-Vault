const test = require("tape");
const { Ed25519KeyIdentity } = require("@dfinity/identity");
const fs = require("fs");
const path = require("path");
const mime = require("mime");
const { updateChecksum } = require("./utils.cjs");

// Actor Interface
const {
  idlFactory: storage_interface,
} = require("../.dfx/local/canisters/storage/storage.did.test.cjs");

// Canister Ids
const canister_ids = require("../.dfx/local/canister_ids.json");
const storage_canister_id = canister_ids.storage.local;

// Identities
let identityA = Ed25519KeyIdentity.generate();
let identityB = Ed25519KeyIdentity.generate();

const { getActor } = require("./actor.cjs");

let storage_actors = {};

let chunk_ids = [];
let checksum = 0;

test("Setup Actors", async function (t) {
  console.log("=========== File Storage ===========");

  storage_actors.identityA = await getActor(
    storage_canister_id,
    storage_interface,
    identityA
  );

  storage_actors.identityB = await getActor(
    storage_canister_id,
    storage_interface,
    identityB
  );
});

// test("Uploading PDF's chunks using IdentityA", async function (t) {
//   const uploadChunk = async ({ content, order }) => {
//     return storage_actors.identityA.upload_chunk({ content, order });
//   };
//   const file_path = "tests/files/rust.pdf";
//   const asset_buffer = fs.readFileSync(file_path);
//   const asset_unit8Array = new Uint8Array(asset_buffer);
//   const promises = [];
//   const chunkSize = 2000000;
//   for (
//     let start = 0, index = 0;
//     start < asset_unit8Array.length;
//     start += chunkSize, index++
//   ) {
//     const chunk = asset_unit8Array.slice(start, start + chunkSize);

//     checksum = updateChecksum(chunk, checksum);

//     promises.push(
//       uploadChunk({
//         content: chunk,
//         order: index,
//       })
//     );
//   }

//   chunk_ids = await Promise.all(promises);

//   const hasChunkIds = chunk_ids.length > 2;

//   t.equal(hasChunkIds, true);

//   let response = await storage_actors.identityA.chunk_availability_check(
//     chunk_ids
//   );
//   t.equal(response, true);
// });

// test("Should start formation of PDF file", async function (t) {
//   const file_path = "tests/files/rust.pdf";
//   const asset_filename = path.basename(file_path);
//   const asset_content_type = mime.getType(file_path);

//   const ids_sorted = chunk_ids.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

//   let id = await storage_actors.identityA.commit_batch({
//     content_type: asset_content_type,
//     file_name: asset_filename,
//     chunk_ids: ids_sorted,
//     checksum: checksum,
//     content_encoding: { Identity: null },
//   });

//   checksum = 0;

//   const asset = await storage_actors.identityA.get_asset(id);
//   t.equal(asset.file_name, asset_filename);
//   t.equal(asset.content_type, asset_content_type);
// });

test("Upload picture", async function (t) {
  const uploadChunk = async ({ content, order }) => {
    return storage_actors.identityA.upload_chunk({ content, order });
  };
  let file_path = "tests/files/video2.mp4";
  const asset_buffer = fs.readFileSync(file_path);
  const asset_unit8Array = new Uint8Array(asset_buffer);
  const promises = [];
  const chunkSize = 2000000;

  for (
    let start = 0, index = 0;
    start < asset_unit8Array.length;
    start += chunkSize, index++
  ) {
    const chunk = asset_unit8Array.slice(start, start + chunkSize);

    checksum = updateChecksum(chunk, checksum);

    console.log("checksum: ", checksum);

    promises.push(
      uploadChunk({
        content: chunk,
        order: index,
      })
    );
  }
  chunk_ids = await Promise.all(promises);

  let response = await storage_actors.identityA.chunk_availability_check(
    chunk_ids
  );
  t.equal(response, true);
});

test("Should start formation of picture", async function (t) {
  const file_path = "test/files/video2.mp4";
  const asset_filename = path.basename(file_path);
  const asset_content_type = mime.getType(file_path);

  console.log("checksum: ", checksum);

  const ids_sorted = chunk_ids.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  let id = await storage_actors.identityA.commit_batch({
    content_type: asset_content_type,
    file_name: asset_filename,
    chunk_ids: ids_sorted,
    checksum: checksum,
    content_encoding: { Identity: null },
  });

  console.log("id: ", id);

  checksum = 0;

  const asset = await storage_actors.identityA.get_asset(id);
  t.equal(asset.file_name, asset_filename);
  t.equal(asset.content_type, asset_content_type);
  console.log(asset);
});
