import React, { createContext, useContext, useState, useCallback } from 'react';
// Import all exports from dataManager as 'data'
import * as data from '../../hooks/dataManager/dataManager';

// Define the shape of our context
interface DataActorContextType {
  dataActor: any;  // The data actor instance
  initializeDataActor: (currentUserAgent: any) => Promise<void>;  // Function to initialize the data actor
}

// Create a new context with the defined type
const DataActorContext = createContext<DataActorContextType | undefined>(undefined);

// Custom hook to use the DataActor context
export const useDataActor = () => {
  const context = useContext(DataActorContext);
  // Ensure the hook is used within a DataActorProvider
  if (!context) {
    throw new Error('useDataActor must be used within a DataActorProvider');
  }
  return context;
};

// DataActorProvider component to wrap the app and provide the context
export const DataActorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State to hold the data actor
  const [dataActor, setDataActor] = useState<any | null>(null);

  // Function to initialize the data actor
  const initializeDataActor = useCallback(async (currentUserAgent: any) => {
    if (currentUserAgent) {
      try {
        // Use the getDataActor function from the imported data module
        const actor = await data.getDataActor(currentUserAgent);
        setDataActor(actor);
      } catch (error) {
        console.error('Error initializing data actor:', error);
      }
    }
  }, []);

  // Provide the context value (dataActor and initializeDataActor) to all children components
  return (
    <DataActorContext.Provider value={{ dataActor, initializeDataActor }}>
      {children}
    </DataActorContext.Provider>
  );
};