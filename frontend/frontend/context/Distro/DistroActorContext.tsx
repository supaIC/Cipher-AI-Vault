import React, { createContext, useContext } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
import * as distro from '../../interfaces/distro'; // Import the distro interface and IDL

interface DistroActorContextType {
  createDistroActor: (agent: HttpAgent) => Promise<any>;
}

const DistroActorContext = createContext<DistroActorContextType | undefined>(undefined);

export const useDistroActor = () => {
  const context = useContext(DistroActorContext);
  if (!context) {
    throw new Error('useDistroActor must be used within a DistroActorProvider');
  }
  return context;
};

export const DistroActorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Function to create a distro-specific actor
  const createDistroActor = async (agent: HttpAgent) => {
    const distroActor = Actor.createActor(distro.idlFactory, {
      agent,
      canisterId: 'jeb4e-myaaa-aaaak-aflga-cai',
    });
    return distroActor;
  };

  return (
    <DistroActorContext.Provider value={{ createDistroActor }}>
      {children}
    </DistroActorContext.Provider>
  );
};
