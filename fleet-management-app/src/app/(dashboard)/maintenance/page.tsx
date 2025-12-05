// Performance optimization: Code splitting with dynamic import
// Component only loads when this route is visited
'use client';

import dynamic from 'next/dynamic';
import { Loader } from '@/components/ui/loader';

const MaintenanceDashboard = dynamic(() => 
  import('@/components/MaintenanceDashboard').then(mod => ({ default: mod.MaintenanceDashboard })),
  {
    loading: () => <Loader text="Loading maintenance dashboard..." />,
  }
);

export default function MaintenancePage() {
  return <MaintenanceDashboard />;
}
