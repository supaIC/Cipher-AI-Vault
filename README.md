# Cipher AI Vault

**Cipher AI Vault** is an Azle-based proof of concept designed with a strong emphasis on abstraction, seamlessly integrating in-memory VectorDB, in-memory LLM, secure asset storage, cycles-distro top-up, and ic-auth for authentication. This adaptability makes it well-suited for a wide range of AI-driven use cases. The project showcases the Internet Computer's potential for secure, sandboxed AI development, offering versatile tools for diverse applications.

*Please note that this demo is a proof of concept and is not intended for production use. This project was developed as part of a [**Developer Grant from the DFINITY Foundation**](https://dfinity.org/grants).*

## Demo Canisters snd Repositories

The demo canister is live and can be accessed [**here**](https://qehbq-rqaaa-aaaan-ql2iq-cai.icp0.io/).

### Standalone Demo Canisters
- [**WebGPU LLM Demo**](https://f45ub-wiaaa-aaaap-ahskq-cai.icp0.io/)

### Grant Deliverables Repositories
- [**ic-auth**](https://github.com/supaIC/ic-auth)
- [**Cycles Distro**](https://github.com/supaIC/cycles-distro)

## Prerequisites

**WebGPU:** For the best experience, use a [**WebGPU**](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) enabled browser. We recommend [**Chrome Canary**](https://www.google.com/chrome/canary/).

To use this repository, ensure that DFX and Node.js are installed. This project leverages the Azle development kit from Demergent Labs. For setup assistance, refer to the following resources:

- [**DFX Setup**](https://internetcomputer.org/docs/current/developer-docs/getting-started/install)
- [**Node.js Setup**](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [**Azle Documentation**](https://github.com/demergent-labs/azle)

### Required Wallets

To run the demo, you will need one of the following wallets:

- [**Plug Wallet**](https://plugwallet.ooo/)
- [**Stoic Wallet**](https://www.stoicwallet.com/)
- [**NFID Wallet**](https://nfid.one/)
- [**Internet Identity**](https://identity.raw.ic0.app/)

## Initial Setup Instructions

### Clone The Repo:
```bash
git clone https://github.com/supaIC/Cipher-AI-Vault.git
cd Cipher-AI-Vault
```

### Project Setup:

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

## Running the Demo Locally

You can quickly test the demo locally using `npm`:

```bash
## Ensure that you are in the root directory

npm install
npm run dev
```

## Running the Demo Canisters

This project includes two primary canisters, each with its own `dfx.json` configuration:

- **Frontend Canister:** For setup and instructions, refer to the [**`README.md`**](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/README.md) in the `frontend` directory.
- **Cycles Distro Canister:** For deployment details, see the [**`README.md`**](https://github.com/supaIC/Cipher-AI-Vault/blob/main/distro-canister/README.md) in the `distro-canister` directory.

## Roadmap

- A list of upcoming features and improvements will be provided soon.