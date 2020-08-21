use crate::*;

use near_sdk::json_types::Base58PublicKey;
use near_sdk::{near_bindgen, Promise};

const METHOD_NAMES: &[u8] = b"draw";

#[near_bindgen]
impl Place {
    pub fn add_access_key(&mut self, public_key: Base58PublicKey) -> Promise {
        Promise::new(env::current_account_id()).add_access_key(
            public_key.into(),
            0,
            env::current_account_id(),
            METHOD_NAMES.to_vec(),
        )
    }
}
