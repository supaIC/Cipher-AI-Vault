use std::collections::HashMap;

use candid::{candid_method, CandidType};
use ic_cdk_macros::{query, update};
use ic_stable_memory::collections::SHashMap;
// use ic_stable_structures::BoundedStorable;

use crate::{
    memory::STATE,
    types::{AssetQuery, ContentEncoding, StableAsset, StableString},
    utils::generate_url,
};

const MODULO_VALUE: u32 = 400_000_000;

#[derive(CandidType, serde::Deserialize)]
pub struct AssetArg {
    pub checksum: u32,
    pub chunk_ids: Vec<u128>,
    pub content_type: String,
    pub file_name: String,
    pub content_encoding: ContentEncoding,
}

#[update]
#[candid_method(update)]
pub fn commit_batch(args: AssetArg) -> u128 {
    let caller = ic_cdk::caller();
    STATE.with(|state| {
        let mut state = state.borrow_mut();
        let mut chunks_to_commit = vec![];
        let mut chunks_not_found = vec![];
        let mut chunks_not_owned = vec![];

        args.chunk_ids
            .iter()
            .for_each(|id| match state.chunks.get(id) {
                None => chunks_not_found.push(id.clone()),
                Some(chunk) if chunk.owner != caller => chunks_not_owned.push(id.clone()),
                Some(chunk) => chunks_to_commit.push((id.clone(), chunk.order)),
            });

        if chunks_to_commit.len() == 0 {
            ic_cdk::trap("No chunks found")
        }
        if chunks_not_found.len() > 0 {
            let error_msg = format!("Chunks not found: {:?}", chunks_not_found);
            ic_cdk::trap(&error_msg)
        }
        if chunks_not_owned.len() > 0 {
            let error_msg = format!("Chunks not owned: {:?}", chunks_not_owned);
            ic_cdk::trap(&error_msg)
        }

        let mut checksum: u32 = 0;
        let mut content =
            SHashMap::new_with_capacity(chunks_to_commit.len()).expect("Failed to allocate memory");
        let mut chunk_size = 0;

        chunks_to_commit.sort_by_key(|chunks| chunks.1);

        chunks_to_commit.iter().for_each(|(id, _)| {
            let chunk = state.chunks.remove(id).unwrap();

            content
                .insert(chunk.order, chunk.content)
                .expect("failed to insert");

            checksum = (checksum + chunk.checksum) % MODULO_VALUE;

            ic_cdk::print(chunk.order.to_string());
            ic_cdk::print(checksum.to_string());

            chunk_size += 1;
        });

        if args.checksum != checksum {
            let error_msg = format!("Checksum mismatch: {} != {}", args.checksum, checksum);
            ic_cdk::trap(&error_msg);
        }
        // if content.len() as u32 > <Asset as BoundedStorable>::MAX_SIZE {
        //     ic_cdk::trap("Exceeds allow file limit size")
        // }
        let id = state.get_asset_id();
        let url = generate_url(id);
        let asset = StableAsset {
            content,
            content_encoding: args.content_encoding,
            file_name: StableString::new(args.file_name).unwrap(),
            owner: caller,
            chunk_size,
            url,
            id,
            content_type: StableString::new(args.content_type).unwrap(),
        };
        state.assets.insert(id, asset).expect("failed to insert");
        id
    })
}

#[update]
#[candid_method(update)]
pub fn delete_asset(id: u128) -> bool {
    let caller = ic_cdk::caller();
    STATE.with(|state| {
        let mut state = state.borrow_mut();
        match state.assets.get(&id) {
            None => ic_cdk::trap("Asset not found"),
            Some(asset) if asset.owner != caller => ic_cdk::trap("Asset not owned by caller"),
            Some(_) => {
                state.assets.remove(&id);
                true
            }
        }
    })
}

#[query]
#[candid_method(query)]
pub fn get_asset(id: u128) -> AssetQuery {
    STATE.with(|state| {
        let state = state.borrow();
        match state.assets.get(&id) {
            None => ic_cdk::trap("Asset not found"),
            Some(asset) => AssetQuery::from(&*asset),
        }
    })
}

#[query]
#[candid_method(query)]
pub fn asset_list() -> HashMap<u128, AssetQuery> {
    STATE.with(|state| {
        state
            .borrow()
            .assets
            .iter()
            .map(|(id, asset)| (*id, AssetQuery::from(&*asset)))
            .collect()
    })
}

// #[update]
// #[candid_method(update)]
// pub fn insert_chunk(){
//    STATE.with(|state|{
//         let mut state = state.borrow_mut();
//         for id in 0..100{
//             let chunk = StaChunk{
//                 content: [0; 2000].to_vec(),
//                 order: 1,
//                 owner: ic_cdk::id(),
//                 created_at: ic_cdk::api::time(),
//                 checksum: 200,
//                 id: 10
//            };
//             state.chunks.insert(id, chunk);
//         }
//    })
// }

// #[update]
// #[candid_method(update)]
// pub fn insert_asset(){
//     STATE.with(|state|{
//         let mut state = state.borrow_mut();
//         for id in 0..100{
//             let asset = Asset{
//                 content: [0; 4000].to_vec(),
//                 file_name: "".into(),
//                 owner: Principal::anonymous(),
//                 content_encoding: ContentEncoding::GZIP,
//                 url: "".to_string(),
//                 id: 100,
//                 content_type: "".into()
//             };
//             state.assets.insert(id, asset);
//         }
//    })
// }

// #[update]
// #[candid_method(update)]
// pub fn increase_pages(n: u64) -> bool{
//     match ic_cdk::api::stable::stable64_grow(n){
//         Ok(res) => {
//             ic_cdk::println!("{}", res);
//             true
//         },
//         Err(e) => {
//             ic_cdk::println!("{:?}", e);
//             false
//         }
//     }
// }
