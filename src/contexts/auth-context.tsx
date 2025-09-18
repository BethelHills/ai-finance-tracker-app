'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

interface AuthContextType {
  user: any;
  loading: boolean;
  signIn: (provider?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const sessionData = useSession();
  const session = sessionData?.data;
  const status = sessionData?.status || 'unauthenticated';
  const loading = status === 'loading';

  const handleSignIn = async (provider?: string) => {
    try {
      if (provider) {
        await signIn(provider);
      } else {
        await signIn();
      }
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user,
        loading,
        signIn: handleSignIn,
        signOut: handleSignOut,
        isAuthenticated: !!session?.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
