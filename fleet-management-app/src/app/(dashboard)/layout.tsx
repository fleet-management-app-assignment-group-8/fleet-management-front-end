'use client';

/**
 * DASHBOARD LAYOUT - Protected with Keycloak
 * 
 * This layout protects all dashboard routes with NextAuth/Keycloak authentication.
 * Automatically injects JWT tokens into API calls for backend services.
 */

import React, { useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from '@/components/ui/loader';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, updateUser } = useAuth();
  
  // Automatically configure API clients with auth token
  useAuthenticatedApi();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleSectionChange = (section: string) => {
    // The navigation is now handled by Link components in Sidebar
    // This callback is kept for backwards compatibility
    const routeMap: Record<string, string> = {
      'dashboard': '/dashboard',
      'vehicles': '/vehicles',
      'drivers': '/drivers',
      'trips': '/trips',
      'maintenance': '/maintenance',
      'fuel': '/fuel',
      'analytics': '/analytics',
      'reports': '/reports',
      'users': '/users',
      'settings': '/settings',
    };
    
    const route = routeMap[section];
    if (route) {
      router.push(route);
    }
  };

  // Determine active section from pathname
  const getActiveSection = () => {
    const path = pathname.split('/')[1] || 'dashboard';
    return path;
  };

  // Show loader while checking authentication
  if (isLoading) {
    return <Loader text="Authenticating..." />;
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        activeSection={getActiveSection()} 
        onSectionChange={handleSectionChange}
        userRole={user.role}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          user={user}
          onLogout={logout}
          onProfileClick={handleProfileClick}
        />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
