import {
  blob,
  bool,
  nat,
  nat64,
  Principal,
  Record,
  text,
  Variant,
  Vec,
} from "azle";

export const User = Record({
  userId: text,
  canisters: Vec(text),
  canistersMarkedFull: Vec(text),
});

export const File = Record({
  id: text,
  name: text,
  size: nat,
  content: blob,
  createdAt: nat64,
});

export const FileChunkResponse = Record({
  id: text,
  name: text,
  chunk: blob,
  hasNext: bool,
});

export const FilePayload = Record({
  id: text,
  name: text,
  size: nat,
  content: blob,
});

export const FileResponse = Record({
  id: text,
  name: text,
  canisterId: text,
});

export const Service = Record({
  id: Principal,
  createdAt: nat64,
});

export const Error = Variant({
  Conflict: text,
  NotKnown: text,
  NotFound: text,
  UploadError: text,
  Unauthorized: text,
  InvalidPayload: text,
});
