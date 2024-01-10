rm -rf wasm_files
mkdir wasm_files

cargo build --release --target wasm32-unknown-unknown --package storage
ic-wasm target/wasm32-unknown-unknown/release/storage.wasm -o wasm_files/storage.wasm shrink
gzip wasm_files/storage.wasm