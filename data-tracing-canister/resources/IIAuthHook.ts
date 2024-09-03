import { useEffect, useState } from "react";
import {
  AuthClient,
  AuthClientCreateOptions,
  LocalStorage,
} from "@dfinity/auth-client";
import { Principal } from "@dfinity/principal";

export interface IIAuthClient {
  login: (success?: Function, error?: Function) => void;
  logout: () => void;

  isAuthenticated: boolean;

  authClient: AuthClient | null;
  principal: Principal | null;
}

const createOptions: AuthClientCreateOptions = {
  storage: new LocalStorage(),
  keyType: "Ed25519",
  idleOptions: {
    // Set to true if you do not want idle functionality
    disableIdle: true,
  },
};

const loginOptions = {
  identityProvider:
    process.env.NEXT_PUBLIC_DFX_NETWORK === "ic"
      ? "https://identity.ic0.app/#authorize"
      : `http://127.0.0.1:4943/?canisterId=${process.env.NEXT_PUBLIC_CANISTER_ID}#authorize`,
};

export const useIIAuthClient = (
  options = { createOptions, loginOptions },
): IIAuthClient => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [principal, setPrincipal] = useState<Principal | null>(null);

  useEffect(() => {
    // Initialize AuthClient
    AuthClient.create(options.createOptions).then(async (client) => {
      updateClient(client);
    });
  }, []);

  const login = (success?: Function, error?: Function) => {
    authClient.login({
      ...options.loginOptions,
      onSuccess: () => updateClient(authClient, success),
      onError: async (err) => {
        await updateClient(authClient);

        console.log(`[II_LOGIN_ON_ERROR]: ${err}`);
      },
    });
  };

  async function logout() {
    await authClient?.logout();
    await updateClient(authClient);
  }

  async function updateClient(
    client: AuthClient,
    success?: Function,
  ): Promise<void> {
    const isAuthenticated = await client.isAuthenticated();
    setIsAuthenticated(isAuthenticated);

    const principal = client.getIdentity().getPrincipal();
    setPrincipal(principal);

    setAuthClient(client);

    if (typeof success === "function" && isAuthenticated) {
      await success(principal?.toHex());
    }
  }

  return {
    login,
    logout,

    isAuthenticated,

    authClient,
    principal,
  };
};
