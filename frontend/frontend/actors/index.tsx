// actors/index.ts

import React from 'react';
import { AuthActorProvider } from './Auth/AuthActor';
import { DataActorProvider } from './Data/DataActor';
import { BackendActorProvider } from './Backend/BackendActor';
import { DistroActorProvider } from './Distro/DistroActor';

const ActorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthActorProvider>
      <DataActorProvider>
        <BackendActorProvider>
          <DistroActorProvider>
            {children}
          </DistroActorProvider>
        </BackendActorProvider>
      </DataActorProvider>
    </AuthActorProvider>
  );
};

export { ActorProvider }; // Export the new ActorProvider
export { useAuthActor } from './Auth/AuthActor';
export { useDataActor } from './Data/DataActor';
export { useBackendActor } from './Backend/BackendActor';
export { useDistroActor } from './Distro/DistroActor';
