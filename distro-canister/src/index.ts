import { ok } from 'assert';
import { blob, nat, int, Principal, $query, $update, $init, ic, Variant, Record, Result, match } from 'azle';
import { CanisterStatus, managementCanister } from 'azle/canisters/management';

const canisterList: Array<string> = ["zks6t-giaaa-aaaap-qb7fa-cai", "qehbq-rqaaa-aaaan-ql2iq-cai"];

$update;
export async function addCycles(amount: bigint): Promise<Result<boolean, string>> {
    const callResult = await managementCanister
        .deposit_cycles({
            canister_id: Principal.from("zks6t-giaaa-aaaap-qb7fa-cai"),
        })
        .cycles(amount)
        .call();

    return match(callResult, {
        Ok: () => ({ Ok: true }),
        Err: (err) => ({ Err: err })
    });
}

$update;
export async function addCyclesToAll(amount: bigint): Promise<Balances> {
    const canisterCount = canisterList.length;
    const topUpAmount = amount / BigInt(canisterCount);
    for (const canisterId of canisterList) {
        const callResult = await managementCanister
            .deposit_cycles({
                canister_id: Principal.from(canisterId),
            })
            .cycles(topUpAmount)
            .call();
    }
    try {
        const balances = await getBalances();
        return {assets: balances.Ok?.assets!, frontend: balances.Ok?.frontend!};
    } catch (error) {
        return {assets: BigInt(0), frontend: BigInt(0)};
    }
}

// Expose self cycles balance publicly.

$update;
export async function getCanisterStatus(): Promise<Result<string, string>> {
    const canisterStatusResultCallResult = await managementCanister
        .canister_status({
            canister_id: Principal.from("jeb4e-myaaa-aaaak-aflga-cai")
        })
        .call();

    return match(canisterStatusResultCallResult, {
        Ok: (canisterStatusResult) => ({ Ok: canisterStatusResult.cycles.toString() }),
        Err: (err) => ({ Err: err })
    });
}

export type Balances = Record<{
    assets: bigint;
    frontend: bigint;
}>;

// Due to the nature of cycles balances being private outside of the controllers, all canisters that are to be pumped up with cycles using this distro
// are to have this distro canister as a conrtoller. This is to enable the distro canister to be able to read the cycles balance of the canisters.
$update;
export async function getBalances() : Promise<Result<Balances, string>> {
    const balanceList: Array<bigint> = [];
    for (const canisterId of canisterList) {
        const canisterStatusResultCallResult = await managementCanister
            .canister_status({
                canister_id: Principal.from(canisterId)
            })
            .call();
        balanceList.push(canisterStatusResultCallResult.Ok?.cycles!);
    }
    const balances: Balances = {assets: balanceList[0], frontend: balanceList[1]};
    return {Ok: balances};
}