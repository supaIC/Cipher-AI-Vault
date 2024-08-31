import { Principal } from "@dfinity/principal";
import { HttpAgent, Actor, Identity } from "@dfinity/agent";

// > Todo: Convert this file into a general abstraction.

// Actor creation functions for backend and frontend to be used interchangeably
export const getBackendActor = async (
  agent: HttpAgent,
  canisterId: string,
  idl: any
) => {
  const backendActor = Actor.createActor(idl, { agent, canisterId });
  return backendActor;
};