'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  user: any;
  setUser: (user: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within a Providers');
  }
  return context;
}

export function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <AppContext.Provider value={{ user, setUser, isLoading, setIsLoading }}>
      {children}
    </AppContext.Provider>
  );
}
