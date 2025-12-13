'use client';

/**
 * AUTH CONTEXT - KEYCLOAK AUTHENTICATION
 * 
 * Integrated with NextAuth.js and Keycloak
 * - Server-side session validation
 * - JWT token management
 * - Secure authentication flow
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  accessToken: string | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      // Convert NextAuth session to our User type
      const mappedUser: User = {
        id: session.user.id || '',
        name: session.user.name || 'User',
        email: session.user.email || '',
        role: session.user.role || 'employee',
        department: 'Fleet Operations',
        avatar: session.user.image || '',
        status: 'active',
        lastLogin: new Date().toISOString(),
      };
      setUser(mappedUser);
    } else {
      setUser(null);
    }
  }, [session]);

  const login = async () => {
    await signIn('keycloak', { callbackUrl: '/dashboard' });
  };

  const logout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!session, 
        isLoading: status === 'loading',
        login, 
        logout,
        updateUser,
        accessToken: session?.accessToken
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

