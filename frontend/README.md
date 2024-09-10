# Cipher AI Vault Frontend Canister

[![Developer Grant](https://img.shields.io/badge/DFINITY-Developer%20Grant-blue)](https://dfinity.org/grants)

This canister is the frontend for the Cipher AI Vault demo.

> **Note:** This demo is a proof of concept and not intended for production use. It was developed as part of a Developer Grant from the DFINITY Foundation.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Deployment](#local-deployment)
- [Mainnet Deployment](#mainnet-deployment)
- [Configuration](#configuration)
- [Features](#features)
  - [Authentication](#authentication)
  - [Asset Management](#asset-management)
  - [Stable Memory Data Storage](#stable-memory-data-storage)
  - [VectorDB + LLM Integration](#vectordb--llm-integration)
  - [Cycles Top-Up](#cycles-top-up)
- [Creating Actors for Backend Interactions](#creating-actors-for-backend-interactions)
- [Roadmap](#roadmap)

## Prerequisites

### WebGPU Support

For the best experience, use a [WebGPU](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) enabled browser. We recommend [Chrome Canary](https://www.google.com/chrome/canary/).

### Required Software

- **Node.js:** v20.11.1
- **DFX:** v0.21.0

This project leverages the Azle development kit from Demergent Labs. For setup assistance, refer to:
- [DFX Setup](https://internetcomputer.org/docs/current/developer-docs/getting-started/install)
- [Node.js Setup](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Azle Documentation](https://github.com/demergent-labs/azle)

### Required Wallets

You will need one of the following wallets:

- [Plug Wallet](https://plugwallet.ooo/)
- [Stoic Wallet](https://www.stoicwallet.com/)
- [NFID Wallet](https://nfid.one/)
- [Internet Identity](https://identity.raw.ic0.app/)

## Local Deployment

### Using `dfx`

```bash
# Ensure you are in the frontend directory
npm install
dfx start --background --clean
dfx deploy
dfx stop
```

### Using `npm`

```bash
# Ensure you are in the frontend directory
npm install
npm run dev
```

## Mainnet Deployment

> ⚠️ **WARNING: THIS PROJECT IS NOT BUILT FOR PRODUCTION USE**

1. Update the `canister_ids.json` file with your target canister ID.
2. Run the following command:

```bash
dfx deploy --network ic
```

## Configuration

Edit the [`config.js`](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/configs/config.ts) file to configure canister and user whitelists:

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

## Features

### Authentication

We use the `ic-auth` package for user authentication, supporting Plug, Stoic, NFID, and Internet Identity wallets.

Key files:
- [`ICWalletList.tsx`](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/components/auth/ICWalletList.tsx): Implements wallet selection and login.
- [`authFunctions.ts`](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/actors/AuthActor/AuthActor.tsx): Manages backend actor creation.

#### Integration

- **Authentication Functions:** The `ic-auth` package facilitates the login process for various wallet providers. The integration is implemented in the `ICWalletList.tsx` component.
- **Backend Actor Creation:** Actor creation for interacting with backend canisters is managed through the `AuthActor.tsx` file. This provides a general abstraction for creating backend actors using `HttpAgent` and `Actor` from `@dfinity/agent`.

For detailed usage, see the [ic-auth README](https://github.com/supaIC/ic-auth).

### Asset Management

The [`useAssetManager.js`](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/hooks/assetManager/assetManager.js) hook is the core utility for managing assets on the Internet Computer.

Features:
- Load and display assets with support for various file types and use cases.
- Upload new assets and delete existing ones.
- Dynamically manage loading states and handle error messages.

### Stable Memory Data Storage

The Stable Memory Data Storage feature allows users to store and retrieve data in a persistent and secure manner.

Implemented in:
- [`dataManager.ts`](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/hooks/dataManager/dataManager.ts) hook
- [`DataStore.tsx`](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/screens/DataStore/PrivateDataStore.tsx) screen
- [data-store-canister](https://github.com/supaIC/data-store-canister) repository

### VectorDB + LLM Integration

#### Key Files
- LLM Integration: [`llm.js`](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/hooks/modelManager/llm.js)
- VectorDB Integration: [`DatabaseAdmin.tsx`](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/screens/DatabaseAdmin/DatabaseAdmin.tsx)

#### Standalone Demos
- [WebGPU LLM demo](https://f45ub-wiaaa-aaaap-ahskq-cai.icp0.io/)

#### Related Repositories
- [WebGPU LLM](https://github.com/supaIC/ic-webgpu-ai-template)
- [VectorDB](https://github.com/supaIC/ic-vectordb-graph-template)
- [LLM with VectorDB](https://github.com/supaIC/ic-webgpu-ai-graph-demo)

#### Packages Used
- [@huggingface/transformers](https://www.npmjs.com/package/@huggingface/transformers)
- Custom fork of [client-vector-search](https://github.com/supaIC/Cipher-AI-Vault/tree/main/frontend/frontend/hooks/client-vector-search)

#### Models Used
- Embeddings: [all-MiniLM-L6-v2](https://huggingface.co/Xenova/all-MiniLM-L6-v2)
- LLM: [Phi-3-mini-4k-instruct-fp16](https://huggingface.co/Xenova/Phi-3-mini-4k-instruct_fp16)

#### Custom Data Integration
To initialize custom data into the VectorDB, upload a JSON file to the Data Store and select it in the Database Admin Panel. The JSON structure should be:

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

### Cycles Top-Up

The Cycles Top-Up feature streamlines the conversion of ICP into cycles, enabling effortless top-ups for canisters used within the demo.

Implemented in [`useCyclesTopup.js`](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/frontend/hooks/distroManager/useCyclesTopup/useCyclesTopup.js) hook.

Related projects:
- [Demo's Cycles Distro canister](https://github.com/supaIC/Cipher-AI-Vault/tree/main/distro-canister)
- [Stand-alone Cycles Distro module](https://github.com/supaIC/cycles-distro)

## Creating Actors for Backend Interactions

To interact with canisters on the Internet Computer, actors need to be created with specific roles:

- **Cycles Actor:** Manages cycle-related operations, ensuring efficient resource management.
- **Ledger Actor:** Handles ledger transactions and queries, facilitating secure and transparent financial operations.
- **Distribution Actor:** Distributes cycles across canisters, supporting balanced and scalable resource allocation.
- **Data Actor:** Manages data storage and retrieval, ensuring data integrity and accessibility.

## Roadmap

- [ ] Upload .txt and .pdf files and use LLM to generate data for VectorDB
- [ ] Clean up unused or duplicate style entries in index.css
- [ ] Create CSS files for different components
- [ ] Implement choice of various LLMs for the chatbot