# Cipher AI Vault Data Store Canister

[![Developer Grant](https://img.shields.io/badge/DFINITY-Developer%20Grant-blue)](https://dfinity.org/grants)

This is the Data Store canister for the Cipher AI Vault demo, responsible for securely storing and managing user data in stable memory.

> **Note:** This demo is a proof of concept and not intended for production use. It was developed as part of a Developer Grant from the DFINITY Foundation.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Building and Deployment](#building-and-deployment)
- [Useful Test Commands](#useful-test-commands)
  - [Authorization and Management](#authorization-and-management)
  - [Queries](#queries)
  - [Updates](#updates)
- [Example Mock Values](#example-mock-values)

## Prerequisites

Ensure you have the following installed:

- DFX
- Node.js
- Azle development kit

For setup assistance, refer to:
- [DFX Setup](https://internetcomputer.org/docs/current/developer-docs/getting-started/install)
- [Node.js Setup](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Azle Documentation](https://github.com/demergent-labs/azle)

## Getting Started

1. Clone the Cipher AI Vault repository if you haven't already:
   ```bash
   git clone https://github.com/supaIC/Cipher-AI-Vault.git
   cd Cipher-AI-Vault/data-store
   ```

2. Install packages:
   ```bash
   npm install
   ```

   Note: The default canister name is 'backend'. You can change it by modifying the `dfx.json` file's canister section. If you modify it and plan to deploy on the mainnet, make sure you also edit the `canister_ids.json` file.

## Building and Deployment

1. Build the canister:
   ```bash
   npm run build
   ```

   Note: If you're running Azle for the first time or have switched versions, it will install necessary components. This may take 5-15 minutes depending on your system.

2. Deploy the canister:
   ```bash
   dfx canister install backend --wasm target/wasm32-unknown-unknown/release/backend.wasm.gz --mode reinstall -y
   ```

   For mainnet deployment, add `--network ic` after `canister` in the command.

## Useful Test Commands

Replace `principal` with your actual principal ID in the following commands.

### Authorization and Management

1. Check Authorization:
   ```bash
   dfx canister --network ic call backend isAuthorized
   ```

2. Reset Canister Data:
   ```bash
   dfx canister --network ic call backend resetCanister
   ```

3. Delete User Data (authorized users only):
   ```bash
   dfx canister --network ic call backend deleteUserData '( "principal" )'
   ```

### Queries

4. Check if Data Map is Empty:
   ```bash
   dfx canister --network ic call backend isDataMapEmpty
   ```

5. Fetch All User Data:
   ```bash
   dfx canister --network ic call backend getAllUserData
   ```

6. Fetch Data for a Single User:
   ```bash
   dfx canister --network ic call backend getSingleUser '( "principal" )'
   ```

7. Fetch File Data for a User's File:
   ```bash
   dfx canister --network ic call backend getFileData '( "principal", "file-12345" )'
   ```

8. Check if a User Exists:
   ```bash
   dfx canister --network ic call backend doesUserExist '( "principal" )'
   ```

### Updates

9. Create a New User Entry:
   ```bash
   dfx canister --network ic call backend createUserEntry
   ```

10. Add a File to User:
    ```bash
    dfx canister --network ic call backend addFileToUser '( "principal", record { fileID = "file-12345"; fileName = "Project Plan"; fileData = vec { record { id = "1"; name = "First Entry"; description = "Details of first entry" } } } )'
    ```

11. Update File for User:
    ```bash
    dfx canister --network ic call backend updateFileForUser '( "principal", record { fileID = "file-12345"; fileName = "Updated Project Plan"; fileData = vec { record { id = "1"; name = "Updated Entry"; description = "Updated details" } } } )'
    ```

12. Remove a File from User:
    ```bash
    dfx canister --network ic call backend removeFileFromUser '( "principal", "file-12345" )'
    ```

13. Add Data to a File for a User:
    ```bash
    dfx canister --network ic call backend addDataToFile '( "principal", "file-12345", record { id = "2"; name = "Second Entry"; description = "Details of second entry" } )'
    ```

14. Update Data for a File for a User:
    ```bash
    dfx canister --network ic call backend updateDataForFile '( "principal", "file-12345", record { id = "1"; name = "Updated Entry"; description = "Updated details of first entry" } )'
    ```

## Example Mock Values

- User Principal: `"principal"`
- File ID: `"file-12345"`
- File Name: `"Project Plan"` / `"Updated Project Plan"`
- Data Entries:
  - `record { id = "1"; name = "First Entry"; description = "Details of first entry" }`
  - `record { id = "2"; name = "Second Entry"; description = "Details of second entry" }`

Replace these mock values with your specific testing data as needed.