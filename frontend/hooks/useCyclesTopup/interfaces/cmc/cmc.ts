// @ts-nocheck
export const idlFactory = ({ IDL }) => {
  const IcpXdrConversionRate = IDL.Record({
    'xdr_permyriad_per_icp' : IDL.Nat64,
    'timestamp_seconds' : IDL.Nat64,
  });
  const IcpXdrConversionRateResponse = IDL.Record({
    'certificate' : IDL.Vec(IDL.Nat8),
    'data' : IcpXdrConversionRate,
    'hash_tree' : IDL.Vec(IDL.Nat8),
  });
  const SubnetTypesToSubnetsResponse = IDL.Record({
    'data' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(IDL.Principal))),
  });
  const BlockIndex = IDL.Nat64;
  const NotifyCreateCanisterArg = IDL.Record({
    'controller' : IDL.Principal,
    'block_index' : BlockIndex,
    'subnet_type' : IDL.Opt(IDL.Text),
  });
  const NotifyError = IDL.Variant({
    'Refunded' : IDL.Record({
      'block_index' : IDL.Opt(BlockIndex),
      'reason' : IDL.Text,
    }),
    'InvalidTransaction' : IDL.Text,
    'Other' : IDL.Record({
      'error_message' : IDL.Text,
      'error_code' : IDL.Nat64,
    }),
    'Processing' : IDL.Null,
    'TransactionTooOld' : BlockIndex,
  });
  const NotifyCreateCanisterResult = IDL.Variant({
    'Ok' : IDL.Principal,
    'Err' : NotifyError,
  });
  const NotifyTopUpArg = IDL.Record({
    'block_index' : BlockIndex,
    'canister_id' : IDL.Principal,
  });
  const Cycles = IDL.Nat;
  const NotifyTopUpResult = IDL.Variant({ 'Ok' : Cycles, 'Err' : NotifyError });
  return IDL.Service({
    'get_icp_xdr_conversion_rate' : IDL.Func(
        [],
        [IcpXdrConversionRateResponse],
        ['query'],
      ),
    'get_subnet_types_to_subnets' : IDL.Func(
        [],
        [SubnetTypesToSubnetsResponse],
        ['query'],
      ),
    'notify_create_canister' : IDL.Func(
        [NotifyCreateCanisterArg],
        [NotifyCreateCanisterResult],
        [],
      ),
    'notify_top_up' : IDL.Func([NotifyTopUpArg], [NotifyTopUpResult], []),
  });
};
export const init = ({ IDL }) => { return []; };
import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type BlockIndex = bigint;
export type Cycles = bigint;
export interface IcpXdrConversionRate {
  'xdr_permyriad_per_icp' : bigint,
  'timestamp_seconds' : bigint,
}
export interface IcpXdrConversionRateResponse {
  'certificate' : Array<number>,
  'data' : IcpXdrConversionRate,
  'hash_tree' : Array<number>,
}
export interface NotifyCreateCanisterArg {
  'controller' : Principal,
  'block_index' : BlockIndex,
  'subnet_type' : [] | [string],
}
export type NotifyCreateCanisterResult = { 'Ok' : Principal } |
  { 'Err' : NotifyError };
export type NotifyError = {
    'Refunded' : { 'block_index' : [] | [BlockIndex], 'reason' : string }
  } |
  { 'InvalidTransaction' : string } |
  { 'Other' : { 'error_message' : string, 'error_code' : bigint } } |
  { 'Processing' : null } |
  { 'TransactionTooOld' : BlockIndex };
export interface NotifyTopUpArg {
  'block_index' : BlockIndex,
  'canister_id' : Principal,
}
export type NotifyTopUpResult = { 'Ok' : Cycles } |
  { 'Err' : NotifyError };
export interface SubnetTypesToSubnetsResponse {
  'data' : Array<[string, Array<Principal>]>,
}
export interface _SERVICE {
  'get_icp_xdr_conversion_rate' : ActorMethod<[], IcpXdrConversionRateResponse>,
  'get_subnet_types_to_subnets' : ActorMethod<[], SubnetTypesToSubnetsResponse>,
  'notify_create_canister' : ActorMethod<
    [NotifyCreateCanisterArg],
    NotifyCreateCanisterResult,
  >,
  'notify_top_up' : ActorMethod<[NotifyTopUpArg], NotifyTopUpResult>,
}
