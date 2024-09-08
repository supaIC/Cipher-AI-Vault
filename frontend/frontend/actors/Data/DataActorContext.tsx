// context/DataActorContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import * as data from '../../hooks/dataManager/dataManager';

interface DataActorContextType {
  dataActor: any;
  initializeDataActor: (currentUserAgent: any) => Promise<void>;
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
  const [dataActor, setDataActor] = useState<any | null>(null);

  const initializeDataActor = useCallback(async (currentUserAgent: any) => {
    if (currentUserAgent) {
      try {
        const actor = await data.getDataActor(currentUserAgent);
        setDataActor(actor);
      } catch (error) {
        console.error('Error initializing data actor:', error);
      }
    }
  }, []);

  return (
    <DataActorContext.Provider value={{ dataActor, initializeDataActor }}>
      {children}
    </DataActorContext.Provider>
  );
};
