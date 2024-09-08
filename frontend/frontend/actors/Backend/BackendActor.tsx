import React, { createContext, useContext } from 'react';
// Import Actor and HttpAgent from dfinity/agent
import { Actor, HttpAgent } from '@dfinity/agent';

// Define the shape of our context
interface BackendActorContextType {
  // Function to create a backend actor given an agent, canister ID, and IDL
  createBackendActor: (agent: HttpAgent, canisterId: string, idl: any) => Promise<any>;
}

// Create a new context with the defined type
const BackendActorContext = createContext<BackendActorContextType | undefined>(undefined);

// Custom hook to use the BackendActor context
export const useBackendActor = () => {
  const context = useContext(BackendActorContext);
  // Ensure the hook is used within a BackendActorProvider
  if (!context) {
    throw new Error('useBackendActor must be used within a BackendActorProvider');
  }
  return context;
};

// BackendActorProvider component to wrap the app and provide the context
export const BackendActorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Function to create a generic backend actor for a given canister and IDL
  const createBackendActor = async (agent: HttpAgent, canisterId: string, idl: any) => {
    // Create an actor using the provided agent, canister ID, and IDL
    const backendActor = Actor.createActor(idl, { agent, canisterId });
    return backendActor;
  };

  // Provide the context value (createBackendActor function) to all children components
  return (
    <BackendActorContext.Provider value={{ createBackendActor }}>
      {children}
    </BackendActorContext.Provider>
  );
};