# Cipher AI Vault

[![Developer Grant](https://img.shields.io/badge/DFINITY-Developer%20Grant-blue)](https://dfinity.org/grants)

**Cipher AI Vault** is an Azle-based proof of concept that seamlessly integrates:

- In-memory VectorDB
- In-memory LLM
- Secure asset storage
- Stable memory data storage
- Cycles-distro top-up
- ic-auth for authentication

This versatile platform showcases the Internet Computer's potential for secure, sandboxed AI development, offering adaptable tools for a wide range of AI-driven applications.

> **Note:** This demo is a proof of concept and not intended for production use. It was developed as part of a Developer Grant from the DFINITY Foundation.

## Table of Contents

- [Demo Canisters and Repositories](#demo-canisters-and-repositories)
- [Core Features](#core-features)
- [Prerequisites](#prerequisites)
- [Quick Setup Instructions](#quick-setup-instructions)
- [Detailed Setup and Deployment](#detailed-setup-and-deployment)
- [Roadmap](#cipher-ai-vault-roadmap)
- [License](#license)

## Demo Canisters and Repositories

### Main Demo
- [Cipher AI Vault Demo](https://qehbq-rqaaa-aaaan-ql2iq-cai.icp0.io/)

### Standalone Demo Canisters
- [WebGPU LLM Demo](https://f45ub-wiaaa-aaaap-ahskq-cai.icp0.io/)

### Grant Deliverables Repositories
- [ic-auth](https://github.com/supaIC/ic-auth)
- [Cycles Distro](https://github.com/supaIC/cycles-distro)
- [Data Store Canister](https://github.com/supaIC/data-store-canister)

## Core Features

1. **Frontend Canister**: Main entry point for user interactions
2. **In-memory VectorDB**: Stores and manages embeddings for efficient retrieval
3. **In-memory LLM**: Processes natural language queries and interacts with the VectorDB
4. **Secure Asset Storage**: Dedicated module for secure asset storage
5. **Secure Data Store**: Dedicated canister for storing data in stable memory
6. **Cycles Distro Canister**: Manages cycles and top-ups
7. **ic-auth**: Handles authentication with various wallets (Plug, Stoic, NFID, and Internet Identity)

## Prerequisites

### WebGPU Support
For the best experience, use a [WebGPU](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) enabled browser. We recommend [Chrome Canary](https://www.google.com/chrome/canary/).

### Required Software
- DFX
- Node.js
- Azle development kit

For setup assistance, refer to:
- [DFX Setup](https://internetcomputer.org/docs/current/developer-docs/getting-started/install)
- [Node.js Setup](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Azle Documentation](https://github.com/demergent-labs/azle)

### Required Wallets
You will need one of the following wallets:
- [Plug Wallet](https://plugwallet.ooo/)
- [Stoic Wallet](https://www.stoicwallet.com/)
- [NFID Wallet](https://nfid.one/)
- [Internet Identity](https://identity.raw.ic0.app/)

## Quick Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/supaIC/Cipher-AI-Vault.git
   cd Cipher-AI-Vault
   ```

2. Run the setup script:
   ```bash
   npm run setup
   ```
   
   **Note:** You may be prompted to enter your DFX identity password during setup.

## Detailed Setup and Deployment

For detailed instructions, refer to the following README files within this repository:

- [Frontend Canister Setup and Deployment](frontend/README.md)
- [Cycles Distro Canister Setup and Deployment](distro-canister/README.md)
- [Data Store Canister Setup and Deployment](data-store/README.md)

## Cipher AI Vault Roadmap

- [ ] Data Store backup canister
- [ ] Edit Data Store file entries
- [ ] Multiple in-memory LLM support
- [ ] Models stored in asset canisters
- [ ] Embeddings backed up in Stable Memory
- [ ] Generate a Data File from a document using in-memory LLM
- [ ] Generate images to be stored in the Image Store using in-memory Stable Diffusion

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.