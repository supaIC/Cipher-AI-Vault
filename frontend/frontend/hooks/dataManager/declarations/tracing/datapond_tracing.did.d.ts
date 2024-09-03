import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface _SERVICE {
  'addLog' : ActorMethod<
    [string, string, string, string],
    {
        'Ok' : {
          'id' : Principal,
          'action' : string,
          'dataId' : string,
          'userId' : string,
          'createdAt' : bigint,
          'dataName' : string,
          'serviceId' : Principal,
        }
      } |
      {
        'Err' : { 'InvalidPayload' : string } |
          { 'NotFound' : string } |
          { 'Unauthorized' : string } |
          { 'Conflict' : string }
      }
  >,
  'generateId' : ActorMethod<
    [],
    { 'Ok' : Principal } |
      {
        'Err' : { 'InvalidPayload' : string } |
          { 'NotFound' : string } |
          { 'Unauthorized' : string } |
          { 'Conflict' : string }
      }
  >,
  'getLogs' : ActorMethod<
    [],
    {
        'Ok' : Array<
          {
            'id' : Principal,
            'action' : string,
            'dataId' : string,
            'userId' : string,
            'createdAt' : bigint,
            'dataName' : string,
            'serviceId' : Principal,
          }
        >
      } |
      {
        'Err' : { 'InvalidPayload' : string } |
          { 'NotFound' : string } |
          { 'Unauthorized' : string } |
          { 'Conflict' : string }
      }
  >,
  'getLogsByAction' : ActorMethod<
    [string],
    {
        'Ok' : Array<
          {
            'id' : Principal,
            'action' : string,
            'dataId' : string,
            'userId' : string,
            'createdAt' : bigint,
            'dataName' : string,
            'serviceId' : Principal,
          }
        >
      } |
      {
        'Err' : { 'InvalidPayload' : string } |
          { 'NotFound' : string } |
          { 'Unauthorized' : string } |
          { 'Conflict' : string }
      }
  >,
  'getLogsByDataIdAndAction' : ActorMethod<
    [string, string],
    {
        'Ok' : Array<
          {
            'id' : Principal,
            'action' : string,
            'dataId' : string,
            'userId' : string,
            'createdAt' : bigint,
            'dataName' : string,
            'serviceId' : Principal,
          }
        >
      } |
      {
        'Err' : { 'InvalidPayload' : string } |
          { 'NotFound' : string } |
          { 'Unauthorized' : string } |
          { 'Conflict' : string }
      }
  >,
  'initializeCanister' : ActorMethod<
    [Principal],
    { 'Ok' : { 'id' : Principal, 'createdAt' : bigint } } |
      {
        'Err' : { 'InvalidPayload' : string } |
          { 'NotFound' : string } |
          { 'Unauthorized' : string } |
          { 'Conflict' : string }
      }
  >,
  'verifyDocument' : ActorMethod<
    [string],
    {
        'Ok' : Array<
          {
            'id' : Principal,
            'action' : string,
            'dataId' : string,
            'userId' : string,
            'createdAt' : bigint,
            'dataName' : string,
            'serviceId' : Principal,
          }
        >
      } |
      {
        'Err' : { 'InvalidPayload' : string } |
          { 'NotFound' : string } |
          { 'Unauthorized' : string } |
          { 'Conflict' : string }
      }
  >,
}
