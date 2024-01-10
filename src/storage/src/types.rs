use candid::{CandidType, Func, Principal};
use ic_stable_memory::{
    collections::{SHashMap, SVec},
    derive::{AsFixedSizeBytes, StableType},
    SBox,
};
// use ic_stable_memory::{collections::SVec, derive::{StableType, AsFixedSizeBytes}};
// use ic_stable_structures::{BoundedStorable, StableBTreeMap, Storable};
use crate::chunk_handler::ChunkArg;
use serde::Deserialize;

pub type StableString = SBox<String>;

// #[derive(serde::Serialize, serde::Deserialize, CandidType)]
// pub struct Chunk {
//     pub content: Vec<u8>,
//     pub owner: Principal,
//     pub created_at: u64,
//     pub order: u32,
//     pub checksum: u32,
//     pub id: u128,
// }

#[derive(StableType, AsFixedSizeBytes, Debug)]
pub struct StableChunk {
    pub content: SVec<u8>,
    pub owner: Principal,
    pub created_at: u64,
    pub order: u32,
    pub checksum: u32,
    pub id: u128,
}

#[derive(CandidType)]
pub struct ChunkQuery {
    pub owner: Principal,
    pub created_at: u64,
    pub order: u32,
    pub checksum: u32,
    pub id: u128,
}

impl From<&StableChunk> for ChunkQuery {
    fn from(value: &StableChunk) -> Self {
        Self {
            owner: value.owner.clone(),
            created_at: value.created_at,
            order: value.order,
            checksum: value.checksum,
            id: value.id,
        }
    }
}

impl From<(&Principal, u128, ChunkArg)> for StableChunk {
    fn from((owner, id, args): (&Principal, u128, ChunkArg)) -> Self {
        let checksum = crc32fast::hash(&args.content);
        let content: SVec<u8> = {
            let mut list =
                SVec::new_with_capacity(args.content.len()).expect("failed to allocate memory");
            args.content.iter().for_each(|b| {
                list.push(b.clone()).unwrap();
            });
            list
        };
        Self {
            content,
            owner: owner.clone(),
            created_at: ic_cdk::api::time(),
            order: args.order,
            checksum,
            id,
        }
    }
}

// impl Storable for Chunk {
//     fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
//         // let mut bytes = vec![];
//         // ciborium::ser::into_writer(&self, &mut bytes).unwrap();
//         // std::borrow::Cow::Owned(bytes)
//         std::borrow::Cow::Owned(Encode!(self).unwrap())
//     }

//     fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
//         // ciborium::de::from_reader(bytes.as_ref()).unwrap()
//         Decode!(bytes.as_ref(), Self).unwrap()
//     }
// }

// impl BoundedStorable for Chunk {
//     const IS_FIXED_SIZE: bool = false;
//     const MAX_SIZE: u32 = 3 * 1024 * 1024;
// }

#[derive(
    CandidType, serde::Serialize, serde::Deserialize, Clone, StableType, AsFixedSizeBytes, Debug,
)]
pub enum ContentEncoding {
    Identity,
    GZIP,
}

// impl Storable for ContentEncoding {
//     fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
//         Decode!(bytes.as_ref(), Self).unwrap()
//     }
//     fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
//         std::borrow::Cow::Owned(Encode!(self).unwrap())
//     }
// }

// impl BoundedStorable for ContentEncoding {
//     const IS_FIXED_SIZE: bool = true;
//     const MAX_SIZE: u32 = 1;
// }

#[derive(StableType, AsFixedSizeBytes, Debug)]
pub struct StableAsset {
    pub content: SHashMap<u32, SVec<u8>>,
    pub file_name: StableString,
    pub owner: Principal,
    pub content_encoding: ContentEncoding,
    pub url: StableString,
    pub chunk_size: u32,
    pub id: u128,
    pub content_type: StableString,
}

// impl Storable for Asset {
//     fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
//         // let mut bytes = vec![];
//         // ciborium::ser::into_writer(&self, &mut bytes).unwrap();
//         // std::borrow::Cow::Owned(bytes)
//         std::borrow::Cow::Owned(Encode!(self).unwrap())
//     }

//     fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
//         // ciborium::de::from_reader(bytes.as_ref()).unwrap()
//         Decode!(bytes.as_ref(), Self).unwrap()
//     }
// }

// impl BoundedStorable for Asset {
//     const IS_FIXED_SIZE: bool = false;
//     const MAX_SIZE: u32 = 500 * 1024 * 1024;
// }

#[derive(CandidType)]
pub struct AssetQuery {
    pub file_name: String,
    pub owner: Principal,
    pub content_encoding: ContentEncoding,
    pub url: String,
    pub id: u128,
    pub content_type: String,
}

impl From<&StableAsset> for AssetQuery {
    fn from(value: &StableAsset) -> Self {
        Self {
            file_name: value.file_name.clone(),
            owner: value.owner.clone(),
            content_encoding: value.content_encoding.clone(),
            url: value.url.clone(),
            id: value.id,
            content_type: value.content_type.clone(),
        }
    }
}

#[derive(StableType, AsFixedSizeBytes)]
pub struct State {
    pub chunk_count: u128,
    // #[serde(skip, default = "init_chunk_stable_data")]
    // pub chunks: StableBTreeMap<u128, Chunk, StableMemory>,
    pub chunks: SHashMap<u128, StableChunk>,
    pub asset_count: u128,
    // #[serde(skip, default = "init_asset_stable_data")]
    // pub assets: StableBTreeMap<u128, Asset, StableMemory>,
    pub assets: SHashMap<u128, StableAsset>,
}

impl Default for State {
    fn default() -> Self {
        Self {
            chunk_count: 1,
            chunks: SHashMap::new(),
            asset_count: 1,
            assets: SHashMap::new(),
        }
    }
}

impl State {
    pub fn get_chunk_id(&mut self) -> u128 {
        let id = self.chunk_count;
        self.chunk_count += 1;
        id
    }

    pub fn get_asset_id(&mut self) -> u128 {
        let id = self.asset_count;
        self.asset_count += 1;
        id
    }
}

#[derive(CandidType, Deserialize, Clone)]
pub struct HeaderField(pub String, pub String);

#[derive(CandidType, Deserialize, Clone)]
pub struct HttpRequest {
    pub method: String,
    pub url: String,
    pub headers: Vec<HeaderField>,
    pub body: Vec<u8>,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct HttpResponse {
    pub status_code: u16,
    pub headers: Vec<HeaderField>,
    pub body: Vec<u8>,
    pub streaming_strategy: Option<StreamingStrategy>,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct CreateStrategyArgs {
    pub asset_id: u128,
    pub chunk_index: u32,
    pub chunk_size: u32,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct StreamingCallbackToken {
    pub asset_id: u128,
    pub chunk_index: u32,
    pub chunk_size: u32,
    pub content_encoding: String,
}

#[derive(CandidType, Deserialize, Clone)]
pub enum StreamingStrategy {
    Callback {
        token: StreamingCallbackToken,
        callback: Func,
    },
}

#[derive(CandidType, Deserialize, Clone)]
pub struct StreamingCallbackHttpResponse {
    pub body: Vec<u8>,
    pub token: Option<StreamingCallbackToken>,
}
