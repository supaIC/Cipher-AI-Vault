import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface _SERVICE {
  'getFile' : ActorMethod<
    [string, bigint],
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
  'uploadFile' : ActorMethod<
    [
      {
        'id' : string,
        'content' : Uint8Array | number[],
        'name' : string,
        'size' : bigint,
      },
      boolean,
    ],
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
}
