// context/AuthActorContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { UserObject } from '../../hooks/assetManager/assetManager';

interface AuthActorContextType {
  currentUser: UserObject | null;
  setCurrentUser: (user: UserObject | null) => void;
}

const AuthActorContext = createContext<AuthActorContextType | undefined>(undefined);

export const useAuthActor = () => {
  const context = useContext(AuthActorContext);
  if (!context) {
    throw new Error('useAuthActor must be used within an AuthActorProvider');
  }
  return context;
};

export const AuthActorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserObject | null>(null);

  return (
    <AuthActorContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AuthActorContext.Provider>
  );
};