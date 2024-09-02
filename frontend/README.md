# Cipher AI Vault Frontend Canister

This canister is the frontend for the Cipher AI Vault demo.

*This demo is intended as a proof of concept and is not suitable for production use. It is supported by a [**Developer Grant from the DFINITY Foundation**](https://dfinity.org/grants).*

## Cipher AI Vault Demo Canisters

The demo canister is currently live and can be accessed [**here**](https://qehbq-rqaaa-aaaan-ql2iq-cai.icp0.io/).

## Developer Setup

To set up and run the current version, ensure the following are installed:

- **Node.js:** v20.11.1
- **DFX:** v0.21.0

### Setup Assistance

For detailed setup instructions, refer to these resources:

- [**DFX Setup**](https://internetcomputer.org/docs/current/developer-docs/getting-started/install)
- [**Node.js Setup**](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [**Azle Documentation**](https://github.com/demergent-labs/azle)

### Required Wallets

To run the demo, you will need one of the following wallets:

- [**Plug Wallet**](https://plugwallet.ooo/)
- [**Stoic Wallet**](https://www.stoicwallet.com/)
- [**NFID Wallet**](https://nfid.one/)
- [**Internet Identity**](https://identity.raw.ic0.app/)

Run these commands to get your environment up and running:

### Local Deployment

To run the demo using local `dfx`, run the following commands:

```bash
## Ensure that you are in the frontend directory

npm install
dfx start --background --clean
dfx deploy
dfx stop
```

or to run the demo using `npm`:

```bash
## Ensure that you are in the root directory

npm install
npm run dev
```

### Mainnet Deployment

> ⚠️ **WARNING: THIS PROJECT IS NOT BUILT FOR PRODUCTION USE**  
> For Mainnet deployment, you will need to update the `canister_ids.json` file with the canister ID of the canister you are deploying to.
> Then run the following command:

```bash
dfx deploy --network ic
```

## Configuration

Our [**`config.js`**](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/config.ts) can be set up to configure the canister and user whitelists:

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

This demo utilizes the **`ic-auth`** package to manage user authentication, providing a modular and user-friendly solution for integrating multiple wallet providers on the Internet Computer. Supported wallets include **Plug**, **Stoic**, **NFID**, and **Internet Identity**.

### Integration

- **Authentication Functions:** The integration of the **`ic-auth`** package is implemented in the [**`authFunctions.ts`**](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/hooks/authFunctions/authFunctions.ts) hook.
- **Wallet List Component:** The wallet selection interface is managed by the [**`ICWalletList.tsx`**](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/components/ICWalletList.tsx) component.

### Documentation

For detailed usage instructions and additional examples, please refer to the [**ic-auth README**](https://github.com/supaIC/ic-auth).

## Asset Management

The [**`useAssetManager.js`**](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/hooks/assetManager/assetManager.js) hook is the core utility for managing assets on the Internet Computer, offering robust functionality to efficiently load, upload, and delete assets.

### Features:
- Load and display assets with support for various file types and use cases.
- Upload new assets and delete existing ones.
- Dynamically manage loading states and handle error messages.

## VectorDB + LLM Integration

### Codebase

- **LLM Integration:** The implementation can be found in [**`llm.js`**](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/hooks/modelManager/llm.js).
- **VectorDB Integration:** Explore the integration within [**`DatabaseAdmin.tsx`**](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/components/DatabaseAdmin.tsx).

### Other Standalone Demo Canisters:

For standalone testing of the WebGPU LLM within a canister, check out the following demo:

- [**WebGPU LLM demo**](https://f45ub-wiaaa-aaaap-ahskq-cai.icp0.io/)

### Standalone Repositories

For independent testing of the LLM or VectorDB, check out these dedicated demo repositories:
- [**WebGPU LLM**](https://github.com/supaIC/ic-webgpu-ai-template)
- [**VectorDB**](https://github.com/supaIC/ic-vectordb-graph-template)
- [**LLM with VectorDB**](https://github.com/supaIC/ic-webgpu-ai-graph-demo)

### Packages Utilized

This integration is powered by the following packages:
- [**`@huggingface/transformers`**](https://www.npmjs.com/package/@huggingface/transformers)
- A custom fork of [**`client-vector-search`**](https://github.com/yusufhilmi/client-vector-search). Our customized version is available [**here**](https://github.com/supaIC/Cipher-AI-Vault/tree/main/frontend/frontend/hooks/client-vector-search).

### Models Utilized

- **For Embeddings:** [**`all-MiniLM-L6-v2`**](https://huggingface.co/Xenova/all-MiniLM-L6-v2)
- **For LLM:** [**`Phi-3-mini-4k-instruct-fp16`**](https://huggingface.co/Xenova/Phi-3-mini-4k-instruct_fp16)

### Custom Data Integration

To initialize custom data into the VectorDB, upload a JSON file to the Data Store and select it in the Database Admin Panel. Ensure the JSON file is structured as follows:

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

The Cycles Top-Up feature streamlines the conversion of ICP into cycles, enabling effortless top-ups for canisters used within the demo.

### Integration

To see how Cycles Top-Up is integrated into the frontend, explore the [**`useCyclesTopup.js`**](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/hooks/useCyclesTopup/useCyclesTopup.js) hook.

### Cycles Distro Canister

For the demo’s Cycles Distro canister, you can view the implementation [**here**](https://github.com/supaIC/Cipher-AI-Vault/tree/main/distro-canister).

### Stand-Alone Module

We have also developed a stand-alone, open-source module for Cycles Distro, which is available [**here**](https://github.com/supaIC/cycles-distro).

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