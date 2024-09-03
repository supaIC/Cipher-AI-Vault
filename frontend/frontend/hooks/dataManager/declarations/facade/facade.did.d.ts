import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface _SERVICE {
  'getFile' : ActorMethod<
    [string, string, string, bigint],
    {
        'Ok' : {
          'id' : string,
          'hasNext' : boolean,
          'chunk' : Uint8Array | number[],
          'name' : string,
        }
      } |
      {
        'Err' : { 'NotKnown' : string } |
          { 'InvalidPayload' : string } |
          { 'NotFound' : string } |
          { 'UploadError' : string } |
          { 'Unauthorized' : string } |
          { 'Conflict' : string }
      }
  >,
  'initializeCanister' : ActorMethod<
    [Principal],
    { 'Ok' : boolean } |
      {
        'Err' : { 'NotKnown' : string } |
          { 'InvalidPayload' : string } |
          { 'NotFound' : string } |
          { 'UploadError' : string } |
          { 'Unauthorized' : string } |
          { 'Conflict' : string }
      }
  >,
  'loadCanisterCode' : ActorMethod<
    [Uint8Array | number[]],
    { 'Ok' : boolean } |
      {
        'Err' : { 'NotKnown' : string } |
          { 'InvalidPayload' : string } |
          { 'NotFound' : string } |
          { 'UploadError' : string } |
          { 'Unauthorized' : string } |
          { 'Conflict' : string }
      }
  >,
  'uploadFile' : ActorMethod<
    [
      {
        'id' : string,
        'content' : Uint8Array | number[],
        'name' : string,
        'size' : bigint,
      },
      string,
      boolean,
    ],
    { 'Ok' : { 'id' : string, 'name' : string, 'canisterId' : string } } |
      {
        'Err' : { 'NotKnown' : string } |
          { 'InvalidPayload' : string } |
          { 'NotFound' : string } |
          { 'UploadError' : string } |
          { 'Unauthorized' : string } |
          { 'Conflict' : string }
      }
  >,
}
