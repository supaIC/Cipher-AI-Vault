import { blob, nat, int, Principal, $query, $update, $init, ic, Variant, Record, Result, match } from 'azle';
import { CanisterStatus, managementCanister } from 'azle/canisters/management';
import {
    CanisterStatusArgs,
    CanisterStatusResult,
    CreateCanisterResult
} from 'azle/canisters/management';

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


// $update;
// export async function topUp(
//     amount: nat
// ): Promise<Result<boolean, string>> {
//     const callResult = await managementCanister
//         .provisional_top_up_canister({
//             canister_id: Principal.from("zks6t-giaaa-aaaap-qb7fa-cai"),
//             amount
//         })
//         .call();

//     return match(callResult, {
//         Ok: () => ({ Ok: true }),
//         Err: (err) => ({ Err: err })
//     });
// }

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

// $query
// export async function cyclesBalance(): Promise<string> {
//     const canisterId = Principal.from("jeb4e-myaaa-aaaak-aflga-cai");
//     const callResult = await managementCanister.canister_status({ canister_id: canisterId }).call();
//     return match(callResult, {
//         Ok: (cycles) => cycles.toString(),
//         Err: (err) => err
//     });
// }