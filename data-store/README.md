## Azle Playground
### Basic Template - Version 0.17.1

This is a basic template for writing Internet Computer smart contracts with TypeScipt using the Azle framework. You can utilize this by cloning the repository and referencing the Azle book for instructions on creating your smart contracts, then use the commands in this document for instructions on compilation, testing, and deployment.

### Getting Started:

#### Dependencies:

To compile, use, or deploy this project you will need NodeJS, NPM, and DFX. Azle will install the rest of the necessary components and dependencies upon first build.

#### Install Packages:

```
npm install
```
Note: The default canister name is 'backend'. You can change that by modifying the dfx.json file's canister section. If you modify it and plan to deploy on the mainnet make sure you also edit the canister_ids.json file otherwise it will create another new canister for you.

#### Building With Azle:

Once you are done writing your TypeScript functions, just run:

```
npm run build
```

If you are running Azle for the first time or have just switched versions, Azle will go ahead and attempt to install all of the necessary rust and wasm components it needs to get the job done, this may take anywhere from 5-15 minutes depending on network speed and compute capability. This will only happen if you have never used this version of Azle yet. After it is done, it will build the canister as normal.

#### Installing Your Wasm To A Canister:

After creating a canister either locally or on the mainnet you can use the following command to deploy your canister smart contract. The default dfx deploy command will not work due to the default wasm payload being over 2MB. To avoid the error and install the wasm directly use:

```
dfx canister install backend --wasm target/wasm32-unknown-unknown/release/backend.wasm.gz --mode reinstall -y
```

If you have already created a mainnet canister and wish to deploy to the network just add `--network ic` after `canister` in the command.

#### To Use:

If you have deployed the canister locally you can use this command to test it. If you are trying to test it on the mainnet add `--network ic` after `canister` in the command and replace `backend` with your mainnet canister ID.

```
dfx canister call backend hello
```

Disclaimer: Azle is still in alpha and beta phases, this means it is subject to errors, inconsistent operation, and unexpected behaviors. Use at your own risk.