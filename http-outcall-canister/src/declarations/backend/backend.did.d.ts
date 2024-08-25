import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface _SERVICE {
  'http_request' : ActorMethod<
    [
      {
        'url' : string,
        'method' : string,
        'body' : Uint8Array | number[],
        'headers' : Array<[string, string]>,
        'certificate_version' : [] | [number],
      },
    ],
    {
      'body' : Uint8Array | number[],
      'headers' : Array<[string, string]>,
      'upgrade' : [] | [boolean],
      'streaming_strategy' : [] | [
        {
            'Callback' : {
              'token' : Uint8Array | number[],
              'callback' : [Principal, string],
            }
          }
      ],
      'status_code' : number,
    }
  >,
  'http_request_update' : ActorMethod<
    [
      {
        'url' : string,
        'method' : string,
        'body' : Uint8Array | number[],
        'headers' : Array<[string, string]>,
      },
    ],
    {
      'body' : Uint8Array | number[],
      'headers' : Array<[string, string]>,
      'upgrade' : [] | [boolean],
      'streaming_strategy' : [] | [
        {
            'Callback' : {
              'token' : Uint8Array | number[],
              'callback' : [Principal, string],
            }
          }
      ],
      'status_code' : number,
    }
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
