import React, { createContext, useContext, useState } from 'react';
// Import UserObject type from another file
import { UserObject } from '../../hooks/assetManager/assetManager';

// Define the shape of our context
interface AuthActorContextType {
  currentUser: UserObject | null;  // The current user or null if not logged in
  setCurrentUser: (user: UserObject | null) => void;  // Function to update the current user
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
  // State to hold the current user
  const [currentUser, setCurrentUser] = useState<UserObject | null>(null);

  // Provide the context value to all children components
  return (
    <AuthActorContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AuthActorContext.Provider>
  );
};