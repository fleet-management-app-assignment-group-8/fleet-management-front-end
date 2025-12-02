'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Route, 
  Wrench, 
  Fuel, 
  BarChart3,
  Settings,
  FileText,
  UserCog
} from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

interface SidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  userRole: 'admin' | 'employee';
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'vehicles', label: 'Vehicles', icon: Truck, href: '/vehicles' },
  { id: 'drivers', label: 'Drivers', icon: Users, href: '/drivers' },
  { id: 'trips', label: 'Trips & Routes', icon: Route, href: '/trips' },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, href: '/maintenance' },
  { id: 'fuel', label: 'Fuel Management', icon: Fuel, href: '/fuel' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { id: 'reports', label: 'Reports', icon: FileText, href: '/reports' },
];

const adminOnlyItems = [
  { id: 'users', label: 'User Management', icon: UserCog, href: '/users' },
];

export function Sidebar({ activeSection, onSectionChange, userRole }: SidebarProps) {
  const pathname = usePathname();
  
  // Determine active section from pathname if not provided
  const getActiveSection = () => {
    if (activeSection) return activeSection;
    const path = pathname?.split('/')[1];
    return path || 'dashboard';
  };

  const currentSection = getActiveSection();

  const handleNavClick = (itemId: string) => {
    if (onSectionChange) {
      onSectionChange(itemId);
    }
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-semibold text-foreground">FleetManager</h1>
        <p className="text-sm text-muted-foreground">B2B Fleet Solutions</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start gap-3"
              asChild
            >
              <Link href={item.href} onClick={() => handleNavClick(item.id)}>
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          );
        })}

        {/* Admin Only Section */}
        {userRole === 'admin' && (
          <>
            <Separator className="my-4" />
            <div className="px-3 py-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Administration</p>
            </div>
            {adminOnlyItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3"
                  asChild
                >
                  <Link href={item.href} onClick={() => handleNavClick(item.id)}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </>
        )}
      </nav>
      
      <div className="p-4 border-t border-border">
        <Button variant="ghost" className="w-full justify-start gap-3" asChild>
          <Link href="/settings">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </Button>
      </div>
    </div>
  );
}
