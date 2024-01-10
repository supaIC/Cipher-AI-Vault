use crate::{memory::STATE, utils::get_asset_id, types::*};
use candid::{Func, candid_method};
use ic_cdk_macros::query;

#[query]
#[candid_method(query)]
pub fn http_request(request: HttpRequest) -> HttpResponse {
    let not_found = b"Asset Not Found".iter().map(|b| b.clone()).collect();
    let asset_id = get_asset_id(request.url);
    STATE.with(|state| {
        let state = state.borrow();
        match state.assets.get(&asset_id) {
            None => HttpResponse {
                body: not_found,
                status_code: 404,
                headers: vec![],
                streaming_strategy: None,
            },
            Some(asset) => {
                let filename = format!("attachment; filename={}", asset.file_name.clone());
                HttpResponse {
                    body: asset
                        .content
                        .get(&0)
                        .unwrap()
                        .iter()
                        .map(|b| b.clone())
                        .collect(),
                    status_code: 200,
                    headers: vec![
                        HeaderField("Content-Type".to_string(), asset.content_type.clone()),
                        HeaderField("accept-ranges".to_string(), "bytes".to_string()),
                        HeaderField("Content-Disposition".to_string(), filename),
                        HeaderField(
                            "cache-control".to_string(),
                            "private, max-age=0".to_string(),
                        ),
                    ],
                    streaming_strategy: create_strategy(CreateStrategyArgs {
                        asset_id: asset_id.clone(),
                        chunk_index: 0,
                        chunk_size: asset.chunk_size,
                    }),
                }
            }
        }
    })
}

fn create_strategy(arg: CreateStrategyArgs) -> Option<StreamingStrategy> {
    match create_token(arg) {
        None => None,
        Some(token) => {
            let id = ic_cdk::id();
            Some(StreamingStrategy::Callback {
                token,
                callback: Func {
                    principal: id,
                    method: "http_request_streaming_callback".to_string(),
                },
            })
        }
    }
}

fn create_token(arg: CreateStrategyArgs) -> Option<StreamingCallbackToken> {
    let v = arg.chunk_index.clone() + 1;
    if v >= arg.chunk_size {
        return None;
    }
    Some(StreamingCallbackToken {
        asset_id: arg.asset_id,
        chunk_index: arg.chunk_index.clone() + 1,
        content_encoding: "gzip".to_string(),
        chunk_size: arg.chunk_size,
    })
}

#[query]
#[candid_method(query)]
pub fn http_request_streaming_callback(
    token_arg: StreamingCallbackToken,
) -> StreamingCallbackHttpResponse {
    STATE.with(|state| {
        let state = state.borrow();
        match state.assets.get(&token_arg.asset_id) {
            None => panic!("asset id not found"),
            Some(asset) => {
                let arg = CreateStrategyArgs {
                    asset_id: token_arg.asset_id.clone(),
                    chunk_index: token_arg.chunk_index,
                    chunk_size: token_arg.chunk_size,
                };
                let token = create_token(arg);
                StreamingCallbackHttpResponse {
                    token,
                    body: asset.content.get(&token_arg.chunk_index).unwrap().iter().map(|b| b.clone()).collect(),
                }
            }
        }
    })
}
