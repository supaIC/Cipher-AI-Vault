const test = require("tape");
const { Ed25519KeyIdentity } = require("@dfinity/identity");
const fs = require("fs");
const path = require("path");
const mime = require("mime");
const { updateChecksum } = require("./utils.cjs");

// Actor Interface
const {
  idlFactory: file_storage_interface,
} = require("../.dfx/local/canisters/file_storage/file_storage.did.test.cjs");

// Canister Ids
const canister_ids = require("../.dfx/local/canister_ids.json");
const file_storage_canister_id = canister_ids.file_storage.local;

// Identities
let motoko_identity = Ed25519KeyIdentity.generate();
let dom_identity = Ed25519KeyIdentity.generate();

const { getActor } = require("./actor.cjs");

let file_storage_actors = {};

let chunk_ids = [];
let checksum = 0;

test("Setup Actors", async function (t) {
  console.log("=========== File Storage ===========");

  file_storage_actors.motoko = await getActor(
    file_storage_canister_id,
    file_storage_interface,
    motoko_identity
  );

  file_storage_actors.dom = await getActor(
    file_storage_canister_id,
    file_storage_interface,
    dom_identity
  );
});

test("pdf upload", async function(t){
  const uploadChunk = async({chunk, order}) => {
    return file_storage_actors.motoko.create_chunk(chunk, order);
  };
  const file_path = "tests/data/file.pdf";
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

    promises.push(
      uploadChunk({
        chunk,
        order: index,
      })
    );
  }

  chunk_ids = await Promise.all(promises);

  const hasChunkIds = chunk_ids.length > 2;

  t.equal(hasChunkIds, true);
});

test("FileStorage[motoko].commit_batch(): should start formation of asset to be stored", async function (t) {
  const file_path = "tests/data/file.pdf";

  const asset_filename = path.basename(file_path);
  const asset_content_type = mime.getType(file_path);
  const { Ok: asset_id, Err: error } =
    await file_storage_actors.motoko.commit_batch(chunk_ids, {
      filename: asset_filename,
      checksum: checksum,
      content_encoding: { Identity: null },
      content_type: asset_content_type,
    });
    const { Ok: asset } = await file_storage_actors.motoko.get(asset_id);
    // console.log(asset);
    t.equal(asset.filename, "file.pdf");
    t.equal(asset.content_type, asset_content_type);
    // t.equal(asset.checksum, checksum);
    checksum = 0
});

test("FileStorage[motoko].version(): should return version number", async function (t) {
  const response = await file_storage_actors.motoko.version();

  t.equal(response, 1n);
});

test("FileStorage[motoko].create_chunk(): should store chunk data of video file to canister", async function (t) {


  const uploadChunk = async ({ chunk, order }) => {
    return file_storage_actors.motoko.create_chunk(chunk, order);
  };

  const file_path = "tests/data/bots.mp4";

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

    promises.push(
      uploadChunk({
        chunk,
        order: index,
      })
    );
  }

  chunk_ids = await Promise.all(promises);

  const hasChunkIds = chunk_ids.length > 2;
  // for (let i = 0; i < chunk_ids.length; i++){
  //   let chunk_check = await file_storage_actors.motoko.get_chunk_detail(chunk_ids[i]);
  //   t.equal(chunk_check, true)
  // }
  t.equal(hasChunkIds, true);
});

test("FileStorage[dom].commit_batch(): should return error not authorized since not owner of chunks", async function (t) {
  const file_path = "tests/data/bots.mp4";

  const asset_filename = path.basename(file_path);
  const asset_content_type = mime.getType(file_path);

  const { Err: error } = await file_storage_actors.dom.commit_batch(

    chunk_ids,
    {
      filename: asset_filename,
      checksum: checksum,
      content_encoding: { Identity: null },
      content_type: asset_content_type,
    }
  );

  t.equal(error, "Caller does not own the chunk.");
});

test("FileStorage[motoko].commit_batch(): should start formation of asset to be stored", async function (t) {
  const file_path = "tests/data/bots.mp4";
  const asset_filename = path.basename(file_path);
  const asset_content_type = mime.getType(file_path);

  const { Ok: asset_id, Err: error } =
    await file_storage_actors.motoko.commit_batch(chunk_ids, {
      filename: asset_filename,
      checksum: checksum,
      content_encoding: { Identity: null },
      content_type: asset_content_type,
    });

  const { Ok: asset } = await file_storage_actors.motoko.get(asset_id);

  t.equal(asset.filename, "bots.mp4");
  t.equal(asset.content_type, "video/mp4");
});

test("FileStorage[motoko].commit_batch(): should err => Invalid Checksum: Chunk Missing", async function (t) {
  const file_path = "tests/data/bots.mp4";

  const asset_filename = path.basename(file_path);
  const asset_content_type = mime.getType(file_path);

  const { Ok: asset_id, Err: error } =
    await file_storage_actors.motoko.commit_batch([],{
      filename: asset_filename,
      checksum: checksum,
      content_encoding: { Identity: null },
      content_type: asset_content_type,
    });

  checksum = 0;

  t.equal(error, "Checksum mismatch.");
});

test("FileStorage[motoko].create_chunk(): should store chunk data of image file to canister", async function (t) {

  const uploadChunk = async ({ chunk, order }) => {
    return file_storage_actors.motoko.create_chunk(chunk, order);
  };

  const file_path = "tests/data/poked_3.jpeg";

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

    promises.push(
      uploadChunk({
        chunk,
        order: index,
      })
    );
  }

  chunk_ids = await Promise.all(promises);

  const hasChunkIds = chunk_ids.length > 2;

  t.equal(hasChunkIds, true);
});

test("FileStorage[motoko].commit_batch(): should start formation of asset to be stored", async function (t) {
  const file_path = "tests/data/poked_3.jpeg";

  const asset_filename = path.basename(file_path);
  const asset_content_type = mime.getType(file_path);

  const { Ok: asset_id } = await file_storage_actors.motoko.commit_batch(
    chunk_ids,
    {
      filename: asset_filename,
      checksum: checksum,
      content_encoding: { Identity: null },
      content_type: asset_content_type,
    }
  );

  checksum = 0;

  const { Ok: asset } = await file_storage_actors.motoko.get(asset_id);

  t.equal(asset.filename, "poked_3.jpeg");
  t.equal(asset.content_type, "image/jpeg");
});

test("FileStorage[motoko].assets_list(): should return all assets without file content data since it would be too large", async function (t) {
  const asset_list = await file_storage_actors.motoko.assets_list();

  const hasAssets = asset_list.length > 1;

  t.equal(hasAssets, true);
});

test("FileStorage[motoko].delete_asset(): should delete an asset", async function (t) {
  // Upload an asset
  const file_path = "tests/data/poked_1.jpeg";
  const asset_buffer = fs.readFileSync(file_path);
  const asset_unit8Array = new Uint8Array(asset_buffer);
  const asset_filename = path.basename(file_path);
  const asset_content_type = mime.getType(file_path);

  checksum = updateChecksum(asset_buffer, checksum);

  const chunk_id = await file_storage_actors.motoko.create_chunk(
    asset_unit8Array,
    0
  );
  const { Ok: asset_id } = await file_storage_actors.motoko.commit_batch(
    [chunk_id],
    {
      filename: asset_filename,
      checksum: checksum,
      content_encoding: { Identity: null },
      content_type: asset_content_type,
    }
  );

  // Delete the asset
  const { Ok: delete_result } = await file_storage_actors.motoko.delete_asset(
    asset_id
  );
  t.equal(delete_result, "Success");

  // Check if the asset is no longer in the assets list
  const asset_list = await file_storage_actors.motoko.assets_list();
  // console.log(asset_list);
  const deleted_asset = asset_list.find((asset) => asset.id === asset_id);
  t.equal(deleted_asset, undefined);
});

// test("FileStorage[motoko].start_clear_expired_chunks(): should start clearing chunks cron job", async function (t) {
//   const timer_id =
//     await file_storage_actors.motoko.start_clear_expired_chunks();

//   t.equal(timer_id, 1n);
// });

test("FileStorage[motoko].is_full(): should return false when memory usage is below threshold", async function (t) {
  const response = await file_storage_actors.motoko.is_full();

  t.equal(response, false);
});
