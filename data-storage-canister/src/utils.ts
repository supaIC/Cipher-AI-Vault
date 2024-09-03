import { Principal, ic } from "azle/experimental";
import {
  managementCanister,
  CanisterStatusResult,
} from "azle/experimental/canisters/management";

export async function getCanisterStatus(
  canisterId: Principal,
): Promise<typeof CanisterStatusResult> {
  const canisterStatus = await ic.call(managementCanister.canister_status, {
    args: [{ canister_id: canisterId }],
  });

  return canisterStatus;
}

export function bigIntToNumber(value: bigint): number {
  if (!value) return 0;

  return Number(value.toString());
}
