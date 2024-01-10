# file_storage
cp .dfx/local/canisters/storage/service.did.js .dfx/local/canisters/storage/storage.did.test.cjs
sed -i '' 's/export//g' .dfx/local/canisters/storage/storage.did.test.cjs
echo "module.exports = { idlFactory };" >> .dfx/local/canisters/storage/storage.did.test.cjs