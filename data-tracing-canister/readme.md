# datapond-tracing-canister

> DataPond Tracing canister is a Internet Computer smart contract for seamless data transparency and accountability. Effortlessly store and trace every action, from data uploads to processing and consumption, providing methods for granular verification and retrieving logs for a specific data.

## Setup

1. Install dfx using `DFX_VERSION=0.15.2 sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"`
2. Add it to your PATH variables using `echo 'export PATH="$PATH:$HOME/bin"' >> "$HOME/.bashrc"`
3. Next, run `dfx start --background`
4. Then run `dfx deploy datapond_tracing` to deploy the Canister. It will take a while
5. Then run `dfx canister call datapond_tracing initializeCanister '(principal "<YOUR_PRINCIPLE_HERE>")'` to call the `initializeCanister` method to authorize back-end identity principle.

## Methods

#### `initializeCanister` - Initializes the canister by adding a new user during deployment. Returns the created service entry or an error.

#### `addLog` - Adds a log entry with provided details. Returns the created log entry or an error.

#### `getLogs` - Retrieves all logs stored in the canister. Returns a list of log entries or an error.

#### `getLogsByAction` - Retrieves logs filtered by a specific action. Returns a list of log entries or an error.

#### `verifyDocument` - Verifies a document by finding every log with the given dataId. Returns a list of log entries or an error.

#### `getLogsByDataIdAndAction` - Gets records by a given dataId and action. Returns a list of log entries or an error.

#### `generateId` - Generates an ID of type Principal using UUID. Returns a Principal ID or an error.