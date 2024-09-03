#!/usr/bin/env bash

set -euo pipefail

# Default values (can be overridden by command-line options)
declare facade_canister_id='facade'
declare storage_canister_id='storage'
declare wasm='.azle/storage/storage.wasm'
declare optimized_wasm="./.azle/storage/storage.wasm.gz"
declare service_id=''
declare network='local'
declare ic_sdk_installed=false
declare build_archive_folder='build-archives'

# Function to display script usage
function usage() {
  echo "Usage: $0 [OPTIONS]"
  echo "Options:"
  echo "  -f, --facade-canister-id  Specify the facade canister ID (default: 'facade')"
  echo "  -w, --wasm-file           Specify the path to the compressed wasm file"
  echo "  -s, --service-id          Specify the service principal ID"
  echo "  -n, --network             Specify the DFINITY network (default: 'local' for empty or 'ic')"
  echo "  -h, --help                Display this help message"
}

# Check if dfx is installed
if command -v dfx &> /dev/null; then
  ic_sdk_installed=true
fi

# Install IC SDK if not installed
if [ "$ic_sdk_installed" = false ]; then
  echo "Error: IC SDK not installed. Please install IC SDK before running this script."
  exit 1
fi

# Parse command-line options
while [[ $# -gt 0 ]]; do
  case "$1" in
    -f|--facade-canister-id)
      facade_canister_id="$2"
      shift 2
      ;;
    -w|--wasm-file)
      wasm="$2"
      shift 2
      ;;
    -s|--service-id)
      service_id="$2"
      shift 2
      ;;
    -n|--network)
      network="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Invalid option: $1"
      usage
      exit 1
      ;;
  esac
done

# Check if service ID is provided
if [ -z "$service_id" ]; then
  echo "Error: Service ID is required. Please provide the service ID using the -s or --service-id option."
  usage
  exit 1
fi

# Check if DFX is running
if ! pgrep -x "dfx" > /dev/null; then
  echo "Error: DFX is not running. Please start DFX."
  exit 1
fi

# Check if there are old build wasm outputs; if yes, rename and move them to a new folder build-archives
# mkdir -p "$build_archive_folder"

# for old_wasm in "${old_wasm_files[@]}"; do
#   if [ -e "$old_wasm" ]; then
#     echo "Renaming: $old_wasm"
#     base_name=$(basename "$old_wasm")
#     extension="${base_name##*.}"
#     file_name="${base_name%.*}"
#     new_name="$build_archive_folder/$file_name-$(date +'%Y-%m-%d_%Hh-%Mm').$extension"
#     echo "New Name: $new_name"
#     mv "$old_wasm" "$new_name"
#   else
#     echo "File not found: $old_wasm"
#   fi
# done

# Build storage canister
echo "Building Storage canister..."
dfx canister create "$storage_canister_id" --network="$network"
dfx build --network="$network" "$storage_canister_id"

# Run optimization command to optimize storage canister's wasm output
echo "Optimizing storage wasm output..."
gzip -f -1 "$wasm" -c > "$optimized_wasm"

# Build and deploy facade canisters
echo "Building/deploying Facade canister..."
dfx deploy --network="$network" "$facade_canister_id"

# Load wasm output to Facade canister
echo "Loading optimized wasm output to facade..."
dfx canister --network="$network" call "$facade_canister_id" loadCanisterCode --argument-file <(echo "(blob \"$(hexdump -ve '1/1 "%.2x"' "$optimized_wasm" | sed 's/../\\&/g')\")")

# Run initializeCanister method of Facade and pass the given Principle parameter
echo "Adding provided principal to the list of authorized services..."
dfx canister --network="$network" call "$facade_canister_id" initializeCanister "(principal \"$service_id\")"

echo 'Data Storage canisters are deployed and set successfully!'
