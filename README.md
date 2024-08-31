# 🔐 CipherVault IC 🚀
## Version 2.2.2

Welcome to the **CipherVault IC** demo repository—a fully in-browser, in-memory showcase of the Internet Computer's (IC) cutting-edge capabilities. This demo seamlessly integrates `ic-auth` for secure authentication, asset storage, an in-memory VectorDB with LLM, and cycles-distro top-up functionality. With zero server-side components, CipherVault IC highlights the power and versatility of the Internet Computer's decentralized architecture, demonstrating its potential to run sophisticated applications entirely within a sandboxed environment.

*The demo is a proof of concept and is not intended for production use. This project is part of a [Developer Grant from the DFINITY Foundation](https://dfinity.org/grants).*

*The demo canister is currently running on the following canister url: https://qehbq-rqaaa-aaaan-ql2iq-cai.icp0.io/*

### ⚙️ Prerequisites

You will need to have DFX and NodeJS set up to use this repo. This project uses the Azle development kit from Demergent Labs. If you need help getting setup, check out these links:

**DFX Setup:** https://internetcomputer.org/docs/current/developer-docs/getting-started/install
<br>
**NodeJS Setup:** https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
<br>
**Azle Docs:** https://github.com/demergent-labs/azle
<br>

### 🛠️ Setup Instructions

#### Clone The Repo:
```bash
git clone https://github.com/supaIC/ic-storage-module.git
cd ic-storage-module
```

#### Project Setup:

As long as you have already installed and configured Node and DFX, the easy setup command should take care of everything for you:

```
npm run setup
```

If for some reason the automatic command doesn't work, you can use the manual commands:

```
npm install && npm audit fix
dfx start --clean --background
dfx canister create --all
dfx build
dfx deploy
dfx stop
```
*Note: You may be prompted to enter your DFX identity password during setup.*

**👨‍💻 Developer Mode:**
```bash
npm run dev
```

or

```bash
cd frontend
dfx start --background --clean
dfx deploy
dfx stop
```

### 🔑 Authentication

This demo leverages the `ic-auth` package to manage user authentication, offering a modular and user-friendly solution for integrating multiple wallet providers on the Internet Computer. Supported wallets include **Plug**, **Stoic**, **NFID**, and **Internet Identity**.

For comprehensive usage instructions and examples, please refer to the [ic-auth README](https://github.com/cp-daniel-mccoy/ic-auth#readme).

### 🗂️ Asset Management

The [`useAssetManager`](https://github.com/supaIC/ic-storage-module/blob/main/frontend/frontend/hooks/assetManager/assetManager.js) hook is the core utility for managing assets, offering robust functionality to efficiently load, upload, and delete assets.

**Features:**
- Load and display assets with support for various file types and use cases.
- Upload new assets and delete existing ones.
- Dynamically manage loading states and handle error messages.

**Usage:**
```typescript
const { assets, handleDeleteAsset, handleFileUpload, toggleUserFiles } = useAssetManager(currentUser, bucketName);
```

### 🧠 VectorDB + LLM Integration

- The code for the LLM can be found in [`llm.js`](https://github.com/supaIC/ic-storage-module/blob/main/frontend/frontend/components/llm.js)
- The code for the VectorDB is located in [`DatabaseAdmin.tsx`](https://github.com/supaIC/ic-storage-module/blob/main/frontend/frontend/components/DatabaseAdmin.tsx)

This integration leverages the following packages:
- [`@Xenova/transformers`](https://www.npmjs.com/package/@xenova/transformers)
- A custom version of [`client-vector-search`](https://github.com/yusufhilmi/client-vector-search)

### Models Used:
- **For embeddings**: [`all-MiniLM-L6-v2`](https://huggingface.co/Xenova/all-MiniLM-L6-v2)
- **For LLM**: [`Phi-3-mini-4k-instruct-fp16`](https://huggingface.co/Xenova/Phi-3-mini-4k-instruct_fp16)

### 🔄 Cycles Top-Up

This feature facilitates the conversion of ICP into cycles, enabling seamless payments and transactions within the Internet Computer (IC) ecosystem.

We have developed an open source stand-alone module for Cycles Distro, which can be found [here](https://github.com/supaIC/cycles-distro).

**Usage:**
```typescript
await cyclesTopUp(currentUser);
```

### 🎭 Creating Actors for Backend Interactions

To interact with canisters on the Internet Computer, actors need to be created with specific roles:

- **Cycles Actor:** Manages cycle-related operations, ensuring efficient resource management.
- **Ledger Actor:** Handles ledger transactions and queries, facilitating secure and transparent financial operations.
- **Distribution Actor:** Distributes cycles across canisters, supporting balanced and scalable resource allocation.

### Future Plans:

- List of planned features and improvements.