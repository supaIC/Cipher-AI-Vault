import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface DataRecord {
  'id' : string,
  'name' : string,
  'description' : string,
}
export interface UserData { 'data' : Array<DataRecord>, 'user' : string }
export interface _SERVICE {
  'addDataRecordToUser' : ActorMethod<[string, DataRecord], string>,
  'createUserEntry' : ActorMethod<[string], string>,
  'deleteUserData' : ActorMethod<[string], string>,
  'getAllUserData' : ActorMethod<[], Array<[string, UserData]>>,
  'getSingleRecordFromUser' : ActorMethod<[string, string], DataRecord>,
  'getSingleUser' : ActorMethod<[string], [] | [UserData]>,
  'isAuthorized' : ActorMethod<[], boolean>,
  'isDataMapEmpty' : ActorMethod<[], boolean>,
  'removeDataRecordFromUser' : ActorMethod<[string, string], string>,
  'updateDataRecordFromUser' : ActorMethod<[string, DataRecord], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
