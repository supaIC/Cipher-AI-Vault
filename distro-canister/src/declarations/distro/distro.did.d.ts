import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type ManualReply = { 'Ok' : boolean } |
  { 'Err' : string };
export interface _SERVICE {
  'cyclesBalance' : ActorMethod<[], bigint>,
  'topUp' : ActorMethod<[Principal, bigint], ManualReply>,
}
