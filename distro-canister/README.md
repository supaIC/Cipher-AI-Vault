# Cipher AI Vault Cycles Distro Canister

[![Developer Grant](https://img.shields.io/badge/DFINITY-Developer%20Grant-blue)](https://dfinity.org/grants)

This is the Cycles Distro canister for the Cipher AI Vault demo, responsible for automatically topping up the demo canisters.

> **Note:** This demo is a proof of concept and not intended for production use. It was developed as part of a Developer Grant from the DFINITY Foundation.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Roadmap](#roadmap)

## Overview

The Cycles Distro canister manages the automatic top-up of cycles for other canisters in the Cipher AI Vault demo. This ensures that all components of the demo have sufficient cycles to continue operating.

You can find the open-source Cycles Distro code [here](https://github.com/supaIC/cycles-distro).

> **Important:** This demo uses a private Cycles Distro canister. To top up the canisters in this demo, you must be a controller of the Cycles Distro canister.

## Prerequisites

Ensure you have the following installed:

- Node.js
- Rust
- DFX

For setup assistance, refer to:
- [DFX Setup](https://internetcomputer.org/docs/current/developer-docs/getting-started/install)
- [Node.js Setup](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Rust Setup](https://www.rust-lang.org/tools/install)

## Getting Started

1. Clone the Cipher AI Vault repository if you haven't already:
   ```bash
   git clone https://github.com/supaIC/Cipher-AI-Vault.git
   cd Cipher-AI-Vault/cycles-distro
   ```

2. Run the setup script:
   ```bash
   npm run setup
   ```

   This command will take care of all necessary setup steps, assuming you have Node, Rust, and DFX properly installed and configured.

## Usage

[Provide instructions on how to use the Cycles Distro canister, including any available commands or interfaces]

## Roadmap

The following features are planned for future development:

- [ ] Allow the canister to receive a JSON list of all canisters in need of cycles
- [ ] Implement permissions for the canister to only top up canisters from the provided list
- [ ] Create autonomous mode and manual mode for cycle distribution