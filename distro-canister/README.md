## Cipher AI Vault Cycles Distro Canister
### Azle Version 0.17.1

This canister is in charge of automatically topping up Cipher AI Vault demo canisters.

Findn the Cycles Distro open source code [here](https://github.com/supaIC/cycles-distro).

### Getting Setup:

As long as you have already installed and configured Node, Rust, and DFX, the easy setup command should take care of everything for you.

```
npm run setup
```

Todo:

- Let the canister receive a json list of all canisters in need of cycles.
- Permission canister to only be able to top up using that list.
- Create autonomous mode and manual mode.