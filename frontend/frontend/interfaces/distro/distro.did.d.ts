import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Balances { 'assets' : bigint, 'frontend' : bigint }
export type ManualReply = { 'Ok' : boolean } |
  { 'Err' : string };
export interface ManualReply_1 { 'assets' : bigint, 'frontend' : bigint }
export type ManualReply_2 = { 'Ok' : Balances } |
  { 'Err' : string };
export type ManualReply_3 = { 'Ok' : string } |
  { 'Err' : string };
export interface _SERVICE {
  'addCycles' : ActorMethod<[bigint], ManualReply>,
  'addCyclesToAll' : ActorMethod<[bigint], ManualReply_1>,
  'getBalances' : ActorMethod<[], ManualReply_2>,
  'getCanisterStatus' : ActorMethod<[], ManualReply_3>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
