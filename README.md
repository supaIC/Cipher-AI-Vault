# 🔐 CipherVault IC 🚀
## Version 2.2.2

Welcome to the **CipherVault IC** demo repository—a fully in-browser, in-memory showcase of the Internet Computer's (IC) cutting-edge capabilities. This demo seamlessly integrates `ic-auth` for secure authentication, asset storage, an in-memory VectorDB with LLM, and cycles-distro top-up functionality. With zero server-side components, CipherVault IC highlights the power and versatility of the Internet Computer's decentralized architecture, demonstrating its potential to run sophisticated applications entirely within a sandboxed environment.

*The demo is a proof of concept and is not intended for production use. This project is part of a [Developer Grant from the DFINITY Foundation](https://dfinity.org/grants).*

*The demo canister is currently running on the following canister url: https://qehbq-rqaaa-aaaan-ql2iq-cai.icp0.io/*

### ⚙️ Prerequisites

- **DFX 0.20.1**: Ensure you have the correct version of DFX installed to support the demo's functionality.
- **Node.js (version 20+)**: Use the recommended version of Node.js to ensure compatibility and optimal performance.

### 🛠️ Setup Instructions

**Clone and Set Up:**
```bash
git clone https://github.com/supaIC/ic-storage-module.git
cd ic-storage-module
npm run setup
```
*Note: You may be prompted to enter your DFX identity password during setup.*

**👨‍💻 Developer Mode:**
```bash
npm run dev
```

or

```bash
dfx start --background --clean
dfx deploy
dfx stop
```

### 🔑 Authentication

This demo leverages the `ic-auth` package to manage user authentication, offering a modular and user-friendly solution for integrating multiple wallet providers on the Internet Computer. Supported wallets include **Plug**, **Stoic**, **NFID**, and **Internet Identity**.

For comprehensive usage instructions and examples, please refer to the [ic-auth README](https://github.com/cp-daniel-mccoy/ic-auth#readme).

### 🗂️ Asset Management

The [`useAssetManager`](#) hook (add the GitHub code link [here](#)) is the core utility for managing assets, offering robust functionality to efficiently load, upload, and delete assets.

**Features:**
- Load and display assets with support for various file types and use cases.
- Upload new assets and delete existing ones.
- Dynamically manage loading states and handle error messages.

**Usage:**
```typescript
const { assets, handleDeleteAsset, handleFileUpload, toggleUserFiles } = useAssetManager(currentUser, bucketName);
```

### 🧠 VectorDB + LLM Integration

- The code for the LLM can be found in the [`llm.js`](#) file (link the file from GitHub [here](#)).
- The code for the VectorDB is located in the [`DatabaseAdmin.tsx`](#) file (link the file from GitHub [here](#)).

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