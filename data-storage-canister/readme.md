# Datapond Storage

## Setup

1. Install DFINITY SDK using the following command:
```bash
  DFX_VERSION=0.15.2 sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
```

2. Add DFINITY to your PATH variables by appending the following line to your `.bashrc`:
```bash
  echo 'export PATH="$PATH:$HOME/bin"' >> "$HOME/.bashrc"
```

3. Start the DFINITY local environment in the background:
```bash
  dfx start --background
```

4. Install project dependencies:
```bash
  npm install
```

5. Make the deployment script executable:
```bash
  chmod +x ./deploy.sh
```

6. Run the deployment script to build, deploy, and initialize canisters:
```bash
  ./deploy.sh --service-id '<YOUR_PRINCIPLE_HERE>'
```
Note: This process may take some time.