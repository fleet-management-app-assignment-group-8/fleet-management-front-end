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
import { baseApi, vehicleApi, maintenanceApi, driverApi } from '@/services/api/baseApi';

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
    // Check for refresh token error
    if (session?.error === "RefreshAccessTokenError") {
      signIn("keycloak"); // Force re-authentication
    }

    if (session?.accessToken) {
      const token = session.accessToken;
      baseApi.setAuthToken(token);
      vehicleApi.setAuthToken(token);
      maintenanceApi.setAuthToken(token);
      driverApi.setAuthToken(token);
    } else {
      baseApi.clearAuthToken();
      vehicleApi.clearAuthToken();
      maintenanceApi.clearAuthToken();
      driverApi.clearAuthToken();
    }

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
    // Build Keycloak logout URL to end the Keycloak session
    const keycloakIssuer = process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER || 'http://localhost:8080/realms/fleet-management-app';
    const keycloakLogoutUrl = `${keycloakIssuer}/protocol/openid-connect/logout`;
    // Use base URL instead of /login since it should be in Valid post logout redirect URIs
    const redirectUri = window.location.origin;
    
    // First sign out from NextAuth
    await signOut({ redirect: false });
    
    // Then redirect to Keycloak logout endpoint
    // This will end the Keycloak session and redirect back to our home page
    window.location.href = `${keycloakLogoutUrl}?post_logout_redirect_uri=${encodeURIComponent(redirectUri)}&client_id=${process.env.NEXT_PUBLIC_KEYCLOAK_ID || 'fleet-management-frontend'}`;
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

