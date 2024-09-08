// context/BackendActorContext.tsx
import React, { createContext, useContext } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';

interface BackendActorContextType {
  createBackendActor: (agent: HttpAgent, canisterId: string, idl: any) => Promise<any>;
}

const BackendActorContext = createContext<BackendActorContextType | undefined>(undefined);

export const useBackendActor = () => {
  const context = useContext(BackendActorContext);
  if (!context) {
    throw new Error('useBackendActor must be used within a BackendActorProvider');
  }
  return context;
};

export const BackendActorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Function to create a generic backend actor for a given canister and IDL
  const createBackendActor = async (agent: HttpAgent, canisterId: string, idl: any) => {
    const backendActor = Actor.createActor(idl, { agent, canisterId });
    return backendActor;
  };

  return (
    <BackendActorContext.Provider value={{ createBackendActor }}>
      {children}
    </BackendActorContext.Provider>
  );
};
