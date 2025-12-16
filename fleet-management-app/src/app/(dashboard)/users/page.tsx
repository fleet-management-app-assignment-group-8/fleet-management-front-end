// Performance optimization: Code splitting with dynamic import
// Component only loads when this route is visited
'use client';

import dynamic from 'next/dynamic';
import RoleGuard from '@/components/auth/RoleGuard';

const UserManagement = dynamic(() => 
  import('@/components/user/UserManagement').then(mod => ({ default: mod.UserManagement })),
  {
    loading: () => <div className="flex items-center justify-center h-screen">Loading users...</div>,
  }
);

export default function UsersPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <UserManagement />
    </RoleGuard>
  );
}

