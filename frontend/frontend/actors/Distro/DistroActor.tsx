import React, { createContext, useContext } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
import * as distro from '../../interfaces/distro'; // Import the distro interface and IDL

// Define the shape of our context
interface DistroActorContextType {
  createDistroActor: (agent: HttpAgent) => Promise<any>;  // Function to create a distro actor
}

// Create a new context with the defined type
const DistroActorContext = createContext<DistroActorContextType | undefined>(undefined);

// Custom hook to use the DistroActor context
export const useDistroActor = () => {
  const context = useContext(DistroActorContext);
  // Ensure the hook is used within a DistroActorProvider
  if (!context) {
    throw new Error('useDistroActor must be used within a DistroActorProvider');
  }
  return context;
};

// DistroActorProvider component to wrap the app and provide the context
export const DistroActorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Function to create a distro-specific actor
  const createDistroActor = async (agent: HttpAgent) => {
    // Create an actor using the distro IDL factory and a specific canister ID
    const distroActor = Actor.createActor(distro.idlFactory, {
      agent,
      canisterId: 'jeb4e-myaaa-aaaak-aflga-cai',  // Specific canister ID for the distro actor
    });
    return distroActor;
  };

  // Provide the context value (createDistroActor function) to all children components
  return (
    <DistroActorContext.Provider value={{ createDistroActor }}>
      {children}
    </DistroActorContext.Provider>
  );
};