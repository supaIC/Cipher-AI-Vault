# Cipher AI Vault Frontend Canister

This canister is the frontend for the Cipher AI Vault demo.

*This demo is intended as a proof of concept and is not suitable for production use. It is supported by a [**Developer Grant from the DFINITY Foundation**](https://dfinity.org/grants).*

### Cipher AI Vault Demo Canisters

The demo canister is currently running [**here**](https://qehbq-rqaaa-aaaan-ql2iq-cai.icp0.io/)

## Developer Setup

To set up and run the current version, ensure you have the following installed:

- **NodeJS:** v20.11.1
- **DFX:** v0.21.0

For assistance with setup, refer to the following links:

- [**DFX Setup**](https://internetcomputer.org/docs/current/developer-docs/getting-started/install)
- [**NodeJS Setup**](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [**Azle Docs**](https://github.com/demergent-labs/azle)

You will need one of the following wallets to  run the demo:

- [**Plug Wallet**](https://plugwallet.ooo/)
- [**Stoic Wallet**](https://www.stoicwallet.com/)
- [**NFID Wallet**](https://nfid.one/)
- [**Internet Identity**](https://identity.raw.ic0.app/)

Run these commands to get your environment up and running:

```bash
## Ensure that you are in the frontend directory
cd frontend

npm install
dfx start --background --clean
dfx deploy
dfx stop
```

> ⚠️ **WARNING: THIS PROJECT IS NOT BUILT FOR PRODUCTION USE**  
> For Mainnet deployment, you will need to update the `canister_ids.json` file with the canister ID of the canister you are deploying to.
> Then run the following command:

```bash
dfx deploy --network ic
```

## Configuration

Our [**config.js**](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/config.ts) can be set up to configure the canister and user whitelists:

```typescript
// Existing canister ID
export const canisterId: string = "canister-id";

// Add the wallet address for cycles top-up payments
export const walletAddress: string = "principal";

export const whitelist: string[] = [
    "canister-id",
    "canister-id",
  ];
```

## Authentication

This demo leverages the **`ic-auth`** package to manage user authentication, offering a modular and user-friendly solution for integrating multiple wallet providers on the Internet Computer. Supported wallets include **Plug**, **Stoic**, **NFID**, and **Internet Identity**.

The code for integrating the **`ic-auth`** package can be found in the [**`authFunctions.ts`**](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/hooks/authFunctions/authFunctions.ts) hook and the [**`ICWalletList.tsx`**](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/components/ICWalletList.tsx) component.

For comprehensive usage instructions and examples, please refer to the [**ic-auth README**](https://github.com/supaIC/ic-auth).

## Asset Management

The [**`useAssetManager`**](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/hooks/assetManager/assetManager.js) hook is the core utility for managing assets on the Internet Computer, offering robust functionality to efficiently load, upload, and delete assets.

### Features:
- Load and display assets with support for various file types and use cases.
- Upload new assets and delete existing ones.
- Dynamically manage loading states and handle error messages.

### Usage:
```typescript
const { assets, handleDeleteAsset, handleFileUpload, toggleUserFiles } = useAssetManager(currentUser, bucketName);
```

## VectorDB + LLM Integration

- The code for the LLM can be found in [**`llm.js`**](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/hooks/modelManager/llm.js)
- The code for the VectorDB is located in [**`DatabaseAdmin.tsx`**](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/components/DatabaseAdmin.tsx)

### Standalone Repos:

If you are interested in testing the LLM or the VectorDB by themselves, you can check out these demo repositories:
- [**WebGPU LLM**](https://github.com/supaIC/ic-webgpu-ai-template)
- [**VectorDB**](https://github.com/supaIC/ic-vectordb-graph-template)
- [**LLM with VectorDB**](https://github.com/supaIC/ic-webgpu-ai-graph-demo)

### Packages Used:

This integration leverages the following packages:
- [**`@huggingface/transformers`**](https://www.npmjs.com/package/@huggingface/transformers)
- A custom version of [**`client-vector-search`**](https://github.com/yusufhilmi/client-vector-search), our version is located [**here**](https://github.com/supaIC/Cipher-AI-Vault/tree/main/frontend/frontend/hooks/client-vector-search)

### Models Used:

- **For embeddings**: [**`all-MiniLM-L6-v2`**](https://huggingface.co/Xenova/all-MiniLM-L6-v2)
- **For LLM**: [**`Phi-3-mini-4k-instruct-fp16`**](https://huggingface.co/Xenova/Phi-3-mini-4k-instruct_fp16)

### Using Custom Data:

Data can be initialized into the VectorDB by uploading a JSON file into the Data Store and selecting it within the Database Admin Panel. The JSON file should be structured as follows:

```json
[
  {
    "id": 1,
    "name": "name here",
    "description": "description here"
  },
  {
    "id": 2,
    "name": "name here",
    "description": "description here"
  }
]
```

## Cycles Top-Up

This feature facilitates the conversion of ICP into cycles, enabling seamless payments and transactions within the Internet Computer (IC) ecosystem.

The code for integrating Cycles Top-Up into the frontend can be found in [**`useCyclesTopup`**](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/hooks/useCyclesTopup/useCyclesTopup.js)

View the code for this demos Cycles Distro canister [**here**](https://github.com/supaIC/Cipher-AI-Vault/tree/main/distro-canister).

We have developed an open source stand-alone module for Cycles Distro, which can be found [**here**](https://github.com/supaIC/cycles-distro).


## Creating Actors for Backend Interactions

To interact with canisters on the Internet Computer, actors need to be created with specific roles:

- **Cycles Actor:** Manages cycle-related operations, ensuring efficient resource management.
- **Ledger Actor:** Handles ledger transactions and queries, facilitating secure and transparent financial operations.
- **Distribution Actor:** Distributes cycles across canisters, supporting balanced and scalable resource allocation.

## Roadmap

- Upload .txt and .pdf files and use LLM to generate a data file that can be used for the VectorDB.
- Cleanup unused or duplicate style entries in the index.css file.
- Create css files for the different components.
- Chose from a variety of LLMs to use for the chatbot.