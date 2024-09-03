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
} from "azle/experimental";

export const User = Record({
  userId: text,
  canisters: Vec(text),
  canistersMarkedFull: Vec(text),
});
export type User = typeof User.tsType;

export const File = Record({
  id: text,
  name: text,
  size: nat,
  content: blob,
  createdAt: nat64, // nat64 here since we're using the new pattern
});
export type File = typeof File.tsType;

export const FileChunkResponse = Record({
  id: text,
  name: text,
  chunk: blob,
  hasNext: bool,
});
export type FileChunkResponse = typeof FileChunkResponse.tsType;

export const FilePayload = Record({
  id: text,
  name: text,
  size: nat,
  content: blob,
});
export type FilePayload = typeof FilePayload.tsType;

export const FileResponse = Record({
  id: text,
  name: text,
  canisterId: text,
});
export type FileResponse = typeof FileResponse.tsType;

export const Service = Record({
  id: Principal, // use Principal directly
  createdAt: nat64, // nat64 here since we're using the new pattern
});
export type Service = typeof Service.tsType;

export const Error = Variant({
  Conflict: text,
  NotKnown: text,
  NotFound: text,
  UploadError: text,
  Unauthorized: text,
  InvalidPayload: text,
});
export type Error = typeof Error.tsType;
