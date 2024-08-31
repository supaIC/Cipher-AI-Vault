# CipherVault IC
## Version 1.0.0

Welcome to the CipherVault IC demo repo, a comprehensive demo for ic-auth, asset storage, in-memory vectorDB + LLM, and cycles-distro top-up integrations for the Internet Computer (IC).

### Prerequisites
- DFX 0.20.1
- Dfinity package versions 0.19.3
- Recommended Node.js version (versions 20+)

### Setup Instructions

**Clone and Set Up:**
```bash
git clone https://github.com/supaIC/ic-storage-module.git
cd ic-storage-module
npm run setup
```
*Note: Enter your DFX identity password if prompted during setup.*

**Developer Mode:**
```bash
npm run dev
```

### Authentication

The demo uses the `ic-auth` package for managing user authentication. `ic-auth` provides a modular and easy-to-use solution for integrating various wallet providers on the Internet Computer.

For detailed usage instructions and examples, please refer to the [ic-auth README](https://github.com/cp-daniel-mccoy/ic-auth#readme).

### Asset Management

The `useAssetManager` hook is central to managing assets, providing functionality to load, upload, and delete assets efficiently.

**Features:**
- Load and display assets with support for user-specific and global views.
- Upload new assets and delete existing ones.
- Manage loading states and error messages dynamically.

**Usage:**
```typescript
const { assets, handleDeleteAsset, handleFileUpload, toggleUserFiles } = useAssetManager(currentUser, bucketName);
```

### VectorDB + LLM Integration

The code for the LLM can be found in the llm.js file (link the file form github here).

The code for the VectorDB can be found in the DatabaseAdmin.tsx file (link the file form github here).

We use the following packages:
 - [@Xenova/transformers](https://www.npmjs.com/package/@xenova/transformers)
 - A custom version of ["client-vector-search"](https://github.com/yusufhilmi/client-vector-search). The code forthe custom implementation is here (link custom github link here).

The models used are:
 - For embeddings -  [all-MiniLM-L6-v2](https://huggingface.co/Xenova/all-MiniLM-L6-v2)
 - For LLM - [Phi-3-mini-4k-instruct-fp16](https://huggingface.co/Xenova/Phi-3-mini-4k-instruct_fp16)

### Cycles Top-Up

This feature enables the conversion of ICP to cycles, facilitating payments and transactions within the IC ecosystem.

Update this section to detail the newly used "cycles-distro" package.

### Creating Actors for Backend Interactions

To interact with canisters, actors must be created with specific roles:

- **Cycles Actor:** Manages cycle-related operations.
- **Ledger Actor:** Handles ledger transactions and queries.
- **Distribution Actor:** Distributes cycles across canisters.