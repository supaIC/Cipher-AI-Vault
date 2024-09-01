# 🔐 Cipher AI Vault Frontend Canister 🚀
## Version 2.2.2

*This demo is intended as a proof of concept and is not suitable for production use. It is supported by a [Developer Grant from the DFINITY Foundation](https://dfinity.org/grants).*

*The demo canister is available at: [https://qehbq-rqaaa-aaaan-ql2iq-cai.icp0.io/](https://qehbq-rqaaa-aaaan-ql2iq-cai.icp0.io/)*

### 👨‍💻 Developer Setup

You will need to have DFX and NodeJS set up to use this repo. This project uses the Azle development kit from Demergent Labs. If you need help getting setup, check out these links:

**DFX Setup:** https://internetcomputer.org/docs/current/developer-docs/getting-started/install
<br>
**NodeJS Setup:** https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
<br>
**Azle Docs:** https://github.com/demergent-labs/azle
<br>

To set up and run the current version, ensure you have the following installed:
- **NodeJS:** v20.11.1
- **DFX:** v0.21.0

Run these commands to get your environment up and running:

```bash
## Ensure that you are in the frontend directory

npm install
dfx start --background --clean
dfx deploy
dfx stop
```

**WARNING! THIS PROJECT IS NOT BUILT FOR PRODUCTION USE**: For Mainnet deployment, you will ned to update the `canister_ids.json` file with the canister ID of the canister you are deploying to. Then run the following command:
```bash
dfx deploy --network ic
```

### ⚙️ Configuration

Our [config.js](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/config.ts) can be set up to configure the canister and user whitelists:

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

### 🔑 Authentication

This demo leverages the `ic-auth` package to manage user authentication, offering a modular and user-friendly solution for integrating multiple wallet providers on the Internet Computer. Supported wallets include **Plug**, **Stoic**, **NFID**, and **Internet Identity**.

For comprehensive usage instructions and examples, please refer to the [ic-auth README](https://github.com/cp-daniel-mccoy/ic-auth#readme).

### 🗂️ Asset Management

The [`useAssetManager`](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/hooks/assetManager/assetManager.js) hook is the core utility for managing assets, offering robust functionality to efficiently load, upload, and delete assets.

**Features:**
- Load and display assets with support for various file types and use cases.
- Upload new assets and delete existing ones.
- Dynamically manage loading states and handle error messages.

**Usage:**
```typescript
const { assets, handleDeleteAsset, handleFileUpload, toggleUserFiles } = useAssetManager(currentUser, bucketName);
```

### 🧠 VectorDB + LLM Integration

- The code for the LLM can be found in [`llm.js`](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/hooks/modelManager/llm.js)
- The code for the VectorDB is located in [`DatabaseAdmin.tsx`](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/components/DatabaseAdmin.tsx)

This integration leverages the following packages:
- [`@Xenova/transformers`](https://www.npmjs.com/package/@xenova/transformers)
- A custom version of [`client-vector-search`](https://github.com/yusufhilmi/client-vector-search), our version is located [here](https://github.com/supaIC/Cipher-AI-Vault/tree/main/frontend/frontend/hooks/client-vector-search)

### Models Used:
- **For embeddings**: [`all-MiniLM-L6-v2`](https://huggingface.co/Xenova/all-MiniLM-L6-v2)
- **For LLM**: [`Phi-3-mini-4k-instruct-fp16`](https://huggingface.co/Xenova/Phi-3-mini-4k-instruct_fp16)

### 🔄 Cycles Top-Up

This feature facilitates the conversion of ICP into cycles, enabling seamless payments and transactions within the Internet Computer (IC) ecosystem.

We have developed an open source stand-alone module for Cycles Distro, which can be found [here](https://github.com/supaIC/cycles-distro).


### 🎭 Creating Actors for Backend Interactions

To interact with canisters on the Internet Computer, actors need to be created with specific roles:

- **Cycles Actor:** Manages cycle-related operations, ensuring efficient resource management.
- **Ledger Actor:** Handles ledger transactions and queries, facilitating secure and transparent financial operations.
- **Distribution Actor:** Distributes cycles across canisters, supporting balanced and scalable resource allocation.

### TODO:

- Configure Data URLs in a config file.
- Select data file from the Data Store for initialization of the VectorDB.
- Upload .txt and .pdf files and use LLM to generate a data file that can be used for the VectorDB.
- Cleanup unused or duplicate style entries in the index.css file.
- Create css files for the different components.