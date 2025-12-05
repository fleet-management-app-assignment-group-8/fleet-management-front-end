'use client';

import dynamic from 'next/dynamic';
import { Loader } from '@/components/ui/loader';

const MaintenanceScheduler = dynamic(() => 
  import('@/components/MaintenanceScheduler').then(mod => ({ default: mod.MaintenanceScheduler })),
  {
    loading: () => <Loader text="Loading scheduler..." />,
  }
);

export default function MaintenanceSchedulerPage() {
  return <MaintenanceScheduler />;
}
