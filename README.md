## Upstreet IC Testbed
### Version 1.1.0

This is a repository for testing Internet Computer integrations within Upstreet.

Currently uses DFX 0.15.1 and Dfinity package versions 0.19.3.
Must have DFX fully setup with Rust and Node 16-18 installed before proceeding.

### Setup:

Easy Setup:

This repo comes handy with a one step easy setup command to be run after cloning. As long as you have dfx and node configured properly, this should work.

```bash
git clone https://github.com/upstreetai/ic-supabase.git
cd ic-supabase
npm run setup
```

Note: If you have a password set on your DFX identity you will need to enter it during the initial setup.

### Developer Mode:

```bash
npm run dev
```

### Instructions For Integrations:

This module comes in 4 modular pieces:

- Parent
- Wallet List UI
- Main Functions File
- Dedicated Style Sheet

#### The Parent

The parent component that renders the ```ICWalletList.tsx``` component requires two props when calling to render.

Prop 1 - Canister whitelist made up of an array of canister IDs as strings. This should be populated with the canister
addresses of any canisters you wish to make calls to with the user's wallet.

```ts
const whitelist = Array<string>
```

Prop 2 - A function for the Wallet List UI to return the UserObject* back to the parent, which is a data object
containing the user's principal, their agent, and a provider name for conditionals.

```ts
const giveToParent = async(principal: string, agent: HttpAgent, provider: string) => {
    // Do something with this data.
    // Tip: Put it into react state as you'll need to pass the agent into the actor
    // creation function.
}
```

Then just render your component with the props:

```ts
<ICWalletList giveToParent={giveToParent} whitelist={whitelist} />
```

#### Functions

There is a dedicated backend functions file that is in charge of making sure each provider login returns
interoperable data in the correct formats.

Import the "getBackendActor" function wherever you need to create an actor on behalf of the user. Then you will need
to pass the user's agent in from the UserObject* alongside the canister ID and IDL for the respective canister you are
trying to call.

```ts
import { getBackendActor } from "./functions.ts

const actor = await getBackendActor(UserObject.agent, canisterId, idl)
```

Note: This documentation is dynamically expanding and will be expected to change.

### `useAssetManager` Hook

`useAssetManager` is a custom React hook designed for managing assets (loading, uploading, and deleting) on the Dfinity Internet Computer platform. It integrates with the @dfinity/assets package to handle asset-related operations efficiently.

#### Features

- Manage asset loading, uploading, and deletion.
- Toggle between user-specific and global asset views.
- Handle operation states and errors.

#### Usage

Import and initialize the hook with the current user object and bucket name:

```tsx
import { useAssetManager } from './useAssetManager';

const { assets, handleDeleteAsset, handleFileUpload, toggleUserFiles, globalLoading, loadingMessage, error } = useAssetManager(currentUser, bucketName);
```

#### API Overview

- `assets`: Array of assets.
- `handleDeleteAsset(asset: Asset)`: Deletes an asset.
- `handleFileUpload(file: File, principal: string)`: Uploads a new asset.
- `toggleUserFiles()`: Toggles asset visibility.
- `globalLoading`, `loadingMessage`, `error`: Operation state and error handling.

#### Example

```tsx
if (globalLoading) return <p>{loadingMessage}</p>;
if (error) return <p>Error: {error}</p>;

return (
  <div>
    <button onClick={toggleUserFiles}>Toggle Files</button>
    {assets.map((asset) => (
      <div key={asset.key}>
        <p>{asset.url}</p>
        <button onClick={() => handleDeleteAsset(asset)}>Delete</button>
      </div>
    ))}
    <input type="file" onChange={(e) => handleFileUpload(e.target.files[0], currentUser.principal)} />
  </div>
);
```

This simplified section provides a basic guide to using the `useAssetManager` hook for asset management in your project.

### Cycles Top-Up and Actor Interaction

The provided code snippets facilitate interaction with the Internet Computer (IC) platform, specifically for managing cycles top-up, creating actors for canisters, and verifying transactions on the ledger.

#### Overview

- **Actor Creation**: Simplifies the process of creating actors for interacting with specific canisters (cycles, ledger, and distribution).
- **Cycles Top-Up**: Demonstrates how to convert ICP to cycles, initiate payments, and verify transactions.
- **Transaction Verification**: Outlines steps to verify a transaction's legitimacy on the ledger.

#### Actors Overview

1. **Cycles Actor**: Manages operations related to cycles, such as converting ICP to cycles and querying conversion rates.
   
   Canister ID: `rkp4c-7iaaa-aaaaa-aaaca-cai`

2. **Ledger Actor**: Facilitates ledger operations, including querying transactions and verifying transaction details.
   
   Canister ID: `ryjl3-tyaaa-aaaaa-aaaba-cai`

3. **Distribution Actor**: Handles the distribution of cycles across different canisters, managing balances and top-up processes.
   
   Canister ID: `jeb4e-myaaa-aaaak-aflga-cai`

#### Usage

1. **Create Actors**: Utilize `createActors` to instantiate actors for cycles, ledger, and distribution canisters with the current user's agent.

```ts
const { cycles, ledger, distro } = await createActors(currentUser);
```

2. **Cycles Top-Up Process**:
   - Convert ICP to cycles using the conversion rate.
   - Initiate a payment (example shown uses Plug Wallet).
   - Verify the transaction on the ledger.
   - Top up cycles across all canisters.

```ts
await cyclesTopUp(currentUser);
```

3. **Verify Transaction**: Pass the transaction block height and the amount sent to `verifyTransaction` to ensure the transaction's accuracy.

```ts
const isVerified = await verifyTransaction(blockHeight, amountSent, ledgerActor);
```

#### Integration

These functions are designed for seamless integration into your application, enabling efficient management of cycles and secure interactions with the ledger and other canisters on the Internet Computer.


