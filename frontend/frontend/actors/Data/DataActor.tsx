import React, { createContext, useContext } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
import * as dataIDL from '../../interfaces/backend'; // Import data IDL

const CANISTER_ID = "olf36-uaaaa-aaaan-qmu5q-cai"; // Data canister ID

interface DataActorContextType {
  createDataActor: (agent: HttpAgent) => Promise<any>;
}

const DataActorContext = createContext<DataActorContextType | undefined>(undefined);

export const useDataActor = () => {
  const context = useContext(DataActorContext);
  if (!context) {
    throw new Error('useDataActor must be used within a DataActorProvider');
  }
  return context;
};

export const DataActorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const createDataActor = async (agent: HttpAgent) => {
    return Actor.createActor(dataIDL.idlFactory, {
      agent,
      canisterId: CANISTER_ID,
    });
  };

  return (
    <DataActorContext.Provider value={{ createDataActor }}>
      {children}
    </DataActorContext.Provider>
  );
};