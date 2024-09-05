import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface FileData {
  'fileData' : Array<SingleFileData>,
  'fileName' : string,
  'fileID' : string,
}
export type FileDataQuery = { 'fileData' : FileData } |
  { 'error' : string };
export interface SingleFileData {
  'id' : string,
  'name' : string,
  'description' : string,
}
export interface UserData { 'user' : string, 'allFiles' : Array<FileData> }
export interface _SERVICE {
  'addDataToFile' : ActorMethod<[string, string, SingleFileData], string>,
  'addFileToUser' : ActorMethod<[string, FileData], string>,
  'createUserEntry' : ActorMethod<[], string>,
  'deleteUserData' : ActorMethod<[string], string>,
  'doesUserExist' : ActorMethod<[string], boolean>,
  'getAllUserData' : ActorMethod<[], Array<[string, UserData]>>,
  'getFileData' : ActorMethod<[string, string], FileDataQuery>,
  'getSingleUser' : ActorMethod<[string], [] | [UserData]>,
  'isAuthorized' : ActorMethod<[], boolean>,
  'isDataMapEmpty' : ActorMethod<[], boolean>,
  'removeFileFromUser' : ActorMethod<[string, string], string>,
  'resetCanister' : ActorMethod<[], string>,
  'updateDataForFile' : ActorMethod<[string, string, SingleFileData], string>,
  'updateFileForUser' : ActorMethod<[string, FileData], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
