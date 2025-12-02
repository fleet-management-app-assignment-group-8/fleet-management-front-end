'use client';

/**
 * DASHBOARD LAYOUT - Client-Side Auth Guard
 * 
 * This layout protects all dashboard routes by checking authentication state.
 * Currently uses client-side auth context.
 * 
 * ⚠️ Note: This is client-side only protection. When integrating Keycloak,
 * server-side middleware will provide additional security.
 * 
 * See: docs/AUTHENTICATION.md for Keycloak integration guide
 */

import React, { useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from '@/components/ui/loader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, updateUser } = useAuth();

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
    return <Loader />;
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
