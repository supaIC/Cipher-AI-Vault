import { Principal } from "@dfinity/principal";
import { HttpAgent, Actor, Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
//@ts-ignore
import { StoicIdentity } from "ic-stoic-identity";

// Declaration of UserObject to be returned to the parent frontend

export type UserObject = {
    principal: string,
    agent: HttpAgent | Actor | undefined,
    provider: string
}

// Individual login handlers for each provider

// Plug

export const plugLogin = async(whitelist: string[]) : Promise<UserObject> => {
    await (window as any).ic.plug.requestConnect({whitelist});
    const agent = (window as any).ic.plug.agent;
    const principal = Principal.from(await (window as any).ic.plug.getPrincipal()).toText();
    const returnObject : UserObject = {
        principal: principal,
        agent: agent,
        provider: "Plug"
    }
    return returnObject;
}

// Stoic

export const stoicLogin = async(whitelist: string[]) : Promise<UserObject> => {
    let identity;
    //@ts-ignore
    identity = await StoicIdentity.load().then(async identity => {
        const userIdentity = await StoicIdentity.connect();
        return userIdentity;
    });
    const agent = new HttpAgent({identity, host: "https://ic0.app"});
    const principal = identity.getPrincipal().toText();
    const returnObject : UserObject = {
        principal: principal,
        agent: agent,
        provider: "Stoic"
    }
    return returnObject;
}

// NFID

export const nfidLogin = async(grabUserObject: any) : Promise<void> => {
    const appName = "The Asset App";
    const appLogo = "https://nfid.one/icons/favicon-96x96.png";
    const authPath = "/authenticate/?applicationName="+appName+"&applicationLogo="+appLogo+"#authorize";
    const authUrl = "https://nfid.one" + authPath;
    let identity: Identity;
    const handleUserObject = async(identity: Identity) => {
        const agent = new HttpAgent({identity, host: "https://ic0.app"});
        const principal = identity.getPrincipal().toText();
        const returnObject : UserObject = {
            principal: principal,
            agent: agent,
            provider: "NFID"
        }
        console.log(returnObject);
        grabUserObject(returnObject);
    }
    const authClient = await AuthClient.create();
    await authClient.login({
        identityProvider: authUrl,
        onSuccess: async() => {
            console.log("Logged In Successfully");
            identity = authClient.getIdentity();
            return await handleUserObject(identity);
        },
        onError: async(error: any) => {
            console.log("Error Logging In");
            return error;
        }
    });
}

// Internet Identity

export const identityLogin = async(grabUserObject: any) : Promise<void> => {
    let identity;
    const handleUserObject = async(identity: Identity) => {
        const agent = new HttpAgent({identity, host: "https://ic0.app"});
        const principal = identity.getPrincipal().toText();
        const returnObject : UserObject = {
            principal: principal,
            agent: agent,
            provider: "Identity"
        }
        console.log(returnObject);
        grabUserObject(returnObject);
    }
    const authClient = await AuthClient.create();
    await authClient.login({
        identityProvider: "https://identity.ic0.app",
        onSuccess: async() => {
            console.log("Logged In Successfully");
            identity = authClient.getIdentity();
            return await handleUserObject(identity);
        },
        onError: async(error: any) => {
            console.log("Error Logging In");
            return error;
        }
    });
}

// Actor creation functions for backend and frontend to be used interchangeably
// Tip: Run "dfx generate" when you go to build/deploy your backend canisters to generate the interface folder.
// Then, you can copy that folder somewhere into your frontend and reference it for this function
// By using "import * as backend from './backend'" and then calling "functions.getBackendActor(agent, backend.idlFactory)
// To receive the actor./

export const getBackendActor = async(agent: HttpAgent, canisterId: string, idl: any) => {
    const backendActor = Actor.createActor(idl, {agent, canisterId});
    return backendActor;
}