## Upstreet IC Login
### Version 1.1.0

This is an open sourced login menu for the Internet Computer. It supports Internet Identity, Plug, Stoic, and NFID. This module aims at providing an interoperable way of integrating all of your favorite IC wallets easily.

Currently uses DFX 0.15.1 and Dfinity package versions 0.19.3.
Must have DFX fully setup and Node 16-18 installed before proceeding.

### Setup:

Easy Setup:

This repo comes handy with a one step easy setup command to be run after cloning. As long as you have dfx and node configured properly, this should work.

```bash
git clone https://github.com/upstreetai/upstreet-ic-login.git
cd upstreet-ic-login
npm run setup
```

Note: If you have a password set on your DFX identity you will need to enter it once during the initial setup.

If for any reason the easy setup does not work please follow the steps below to manually setup the project.

```bash
npm install
dfx start --clean --background
dfx deploy
dfx stop
```

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