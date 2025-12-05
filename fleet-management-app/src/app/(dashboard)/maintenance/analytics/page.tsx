'use client';

import dynamic from 'next/dynamic';
import { Loader } from '@/components/ui/loader';

const MaintenanceAnalytics = dynamic(() => 
  import('@/components/MaintenanceAnalytics').then(mod => ({ default: mod.MaintenanceAnalytics })),
  {
    loading: () => <Loader text="Loading analytics..." />,
  }
);

export default function MaintenanceAnalyticsPage() {
  return <MaintenanceAnalytics />;
}
