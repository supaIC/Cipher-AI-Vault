# IC Storage Module
## Version 1.1.0

Welcome to the IC Storage Module repository, a comprehensive solution for auth, storage, and cycles top-up integrations on the Internet Computer (IC) platform. This module is designed to simplify interactions with the IC, offering seamless integration for asset management, user authentication, and cycles management.

### Prerequisites
- DFX 0.15.1
- Dfinity package versions 0.19.3
- Rust and Node.js (versions 16-18)

### Setup Instructions

**Clone and Set Up:**
```bash
git clone https://github.com/upstreetai/ic-supabase.git
cd ic-supabase
npm run setup
```
*Note: Enter your DFX identity password if prompted during setup.*

**Developer Mode:**
```bash
npm run dev
```

### Module Components

The IC Storage Module is divided into several key components, each handling a specific aspect of interaction with the Internet Computer:

1. **Authentication (Auth):** Manages user authentication using various identity providers (Plug, Stoic, NFID, and Internet Identity).
2. **Asset Management:** Facilitates the uploading, listing, and deletion of assets stored on the IC.
3. **Cycles Top-Up:** Handles the conversion of ICP to cycles and distributes them across canisters for resource management.

### Authentication

The module supports authentication via multiple providers, offering flexibility in user management and integration:

- **Plug:** Simplifies DApp interactions and transactions on the IC.
- **Stoic:** Allows users to manage IC tokens and NFTs securely.
- **NFID:** A decentralized identity verification solution.
- **Internet Identity:** Provides anonymous, secure authentication for DApps.

**Usage:**
```typescript
// Example: Logging in with Plug
const userObject = await plugLogin(whitelist);
```

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

### Cycles Top-Up

This feature enables the conversion of ICP to cycles, facilitating payments and transactions within the IC ecosystem.

**Key Functions:**
- **createActors:** Initializes actors for interacting with cycles, ledger, and distribution canisters.
- **cyclesTopUp:** Manages the conversion of ICP to cycles and distributes them across canisters.

**Usage:**
```typescript
await cyclesTopUp(currentUser);
```

### Creating Actors for Backend Interactions

To interact with canisters, actors must be created with specific roles:

- **Cycles Actor:** Manages cycle-related operations.
- **Ledger Actor:** Handles ledger transactions and queries.
- **Distribution Actor:** Distributes cycles across canisters.

**Example:**
```typescript
const { cycles, ledger, distro } = await createActors(currentUser);
```

### Parent Component

The Parent component serves as the central UI for the module, integrating authentication, asset management, and settings for cycles top-up.

**Features:**
- User authentication and logout functionality.
- Asset upload, listing, and deletion.
- Cycles donation and settings management.

### Conclusion

The IC Storage Module offers a robust solution for developers looking to integrate authentication, asset management, and cycles top-up functionality within their DApps on the Internet Computer platform. By leveraging this module, developers can streamline user interactions, manage digital assets efficiently, and handle resource allocation seamlessly.



### TO DO

- Add an Azle HTPP outcall canister as its own canister, similar to how we brought in the distro canister. we need to adapt it so that it no longer requires its own frontend, but instead just exposes the /chat canister api endpoint. we then will call this from our frontend/ canister.

- We should then make a seperate UI page for talking to the /chat endpoint thats within our frontend/ code 

- We should add the ability to upload and display documents into the storage

- We need to add the Vectra package so that we can vectorize the docs 

- from there, we need to feed the memory into the openai api calls so the AI can have memory