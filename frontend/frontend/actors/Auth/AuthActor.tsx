// AuthActorContext.tsx
import React, { createContext, useContext, Dispatch, SetStateAction } from 'react';
import { UserObject } from '../../hooks/assetManager/assetManager'; // Ensure correct path
import { useStore } from '../../store/store'; // Adjust the path based on your project structure

// Define the shape of our context
interface AuthActorContextType {
  currentUser: UserObject | null;  // The current user or null if not logged in
  setCurrentUser: Dispatch<SetStateAction<UserObject | null>>;  // Function to update the current user
}

// Create a new context with the defined type
const AuthActorContext = createContext<AuthActorContextType | undefined>(undefined);

// Custom hook to use the AuthActor context
export const useAuthActor = () => {
  const context = useContext(AuthActorContext);
  // Ensure the hook is used within an AuthActorProvider
  if (!context) {
    throw new Error('useAuthActor must be used within an AuthActorProvider');
  }
  return context;
};

// AuthActorProvider component to wrap the app and provide the context
export const AuthActorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Retrieve currentUser and setCurrentUser from Zustand store
  const currentUser = useStore((state) => state.currentUser);
  const setCurrentUser = useStore((state) => state.setCurrentUser);

  // Provide the context value to all children components
  return (
    <AuthActorContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AuthActorContext.Provider>
  );
};
