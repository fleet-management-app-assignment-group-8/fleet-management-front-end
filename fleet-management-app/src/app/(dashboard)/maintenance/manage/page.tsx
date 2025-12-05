'use client';

import dynamic from 'next/dynamic';
import { Loader } from '@/components/ui/loader';

const MaintenanceManagement = dynamic(() => 
  import('@/components/MaintenanceManagement').then(mod => ({ default: mod.MaintenanceManagement })),
  {
    loading: () => <Loader text="Loading maintenance management..." />,
  }
);

export default function MaintenanceManagementPage() {
  return <MaintenanceManagement />;
}
