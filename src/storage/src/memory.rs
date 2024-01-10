use std::cell::RefCell;

use candid::{candid_method, Nat};
use ic_cdk::{init, update, pre_upgrade};
use ic_stable_memory::{stable_memory_init, stable_memory_pre_upgrade};

use crate::types::State;

thread_local! {
    pub static STATE: RefCell<State> = RefCell::default();
}

#[init]
#[candid_method(init)]
pub fn init() {
    stable_memory_init();
}

#[update]
#[candid_method(update)]
pub async fn is_full() -> bool{
    let arg = ic_cdk::api::management_canister::main::CanisterIdRecord{
        canister_id: ic_cdk::id()
    };
    let (info,) = ic_cdk::api::management_canister::main::canister_status(arg).await.unwrap();
    ic_cdk::println!("{:?}", info);
    let fourty_gb: u64 = 40 * 1024 * 1024 * 1024;
    let max_size = Nat::from(fourty_gb);
    if info.memory_size >= max_size{
        true
    }else{
        false
    }
}

// #[pre_upgrade]
// pub fn pre_upgrade(){
//     stable_memory_pre_upgrade().expect("failed to pre upgrade");
// }