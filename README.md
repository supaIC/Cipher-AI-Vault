# Cipher AI Vault

**Cipher AI Vault** is an Azle-based proof of concept designed with a strong emphasis on abstraction, seamlessly integrating in-memory VectorDB, in-memory LLM, secure asset storage, cycles-distro top-up, and ic-auth for authentication. This adaptability makes it well-suited for a wide range of AI-driven use cases. The project showcases the Internet Computer's potential for secure, sandboxed AI development, offering versatile tools for diverse applications.

*The demo is a proof of concept and is not intended for production use. This project is part of a [**Developer Grant from the DFINITY Foundation**](https://dfinity.org/grants).*

## Cipher AI Vault Demo Canisters

The demo canister is currently running [**here**](https://qehbq-rqaaa-aaaan-ql2iq-cai.icp0.io/)

**Other standalone demo canisters:**
- [**WebGPU LLM demo**](https://f45ub-wiaaa-aaaap-ahskq-cai.icp0.io/)

**Other repos that are part of the grant deliverables:**
- [**ic-auth**](https://github.com/supaIC/ic-auth)
- [**Cycles Distro**](https://github.com/supaIC/cycles-distro)

## Prerequisites

**WebGPU:** This project runs best in a [**WebGPU**](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) enabled browser. We suggest [**Chrome Canary**](https://www.google.com/chrome/canary/).

To use this repository, ensure that DFX and Node.js are installed. This project leverages the Azle development kit from Demergent Labs. For assistance with setup, refer to the following links:

- [**DFX Setup**](https://internetcomputer.org/docs/current/developer-docs/getting-started/install)
- [**NodeJS Setup**](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [**Azle Docs**](https://github.com/demergent-labs/azle)

You will need one of the following wallets to  run the demo:

- [**Plug Wallet**](https://plugwallet.ooo/)
- [**Stoic Wallet**](https://www.stoicwallet.com/)
- [**NFID Wallet**](https://nfid.one/)
- [**Internet Identity**](https://identity.raw.ic0.app/)

## Setup Instructions

#### Clone The Repo:
```bash
git clone https://github.com/supaIC/Cipher-AI-Vault.git
cd Cipher-AI-Vault
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

**Developer Mode:**
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

This Project has two main canisters, each provided with their own `dfx.json` file:
- **Frontend Canister:** Read the `README.md` in the frontend directory [**here**](https://github.com/supaIC/Cipher-AI-Vault/blob/main/frontend/README.md)
- **Cycles Distro Canister:** Read the `README.md` in the distro-canister directory [**here**](https://github.com/supaIC/Cipher-AI-Vault/blob/main/distro-canister/README.md)

## Future Plans:

- List of planned features and improvements.