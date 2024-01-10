use candid::{candid_method, CandidType};
use ic_cdk_macros::{query, update};

use crate::{memory::STATE, types::{StableChunk, ChunkQuery}};

#[derive(CandidType, serde::Deserialize)]
pub struct ChunkArg {
    pub order: u32,
    pub content: Vec<u8>,
}

#[update]
#[candid_method(update)]
pub fn upload_chunk(arg: ChunkArg) -> u128 {
    let caller = ic_cdk::caller();
    STATE.with(|state| {
        let mut state = state.borrow_mut();
        let id = state.get_chunk_id();
        let chunk = StableChunk::from((&caller, id, arg));
        state.chunks.insert(id, chunk).expect("failed to insert");
        id
    })
}

#[query]
#[candid_method(query)]
pub fn chunk_availability_check(ids: Vec<u128>) -> bool {
    STATE.with(|state| {
        let state = state.borrow();
        for id in ids.iter() {
            if let None = state.chunks.get(id){
                return false
            }
        }
        true
    })
}

/// delete chunks that is stored for more than 10 mins
#[update]
#[candid_method(update)]
pub fn clear_expired_chunks() {
    let time = ic_cdk::api::time() - 10 * 60 * 1000_000;
    STATE.with(|state| {
        let mut state = state.borrow_mut();
        let mut chunks_to_delete = vec![];
        state.chunks.iter().for_each(|(id, chunk)| {
            if chunk.created_at < time {
                chunks_to_delete.push(id.clone());
            }
        });
        let _ = chunks_to_delete.iter().map(|id| state.chunks.remove(id));
    });
}

#[query]
#[candid_method(query)]
pub fn get_chunk(id: u128) -> ChunkQuery{
    STATE.with(|state|{
        let state = state.borrow();
        match state.chunks.get(&id){
            None => ic_cdk::trap("Chunk not found"),
            Some(chunk) => ChunkQuery::from(&*chunk)
        }
    })
}