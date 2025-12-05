'use client';

import dynamic from 'next/dynamic';
import { Loader } from '@/components/ui/loader';

const MaintenanceReports = dynamic(() => 
  import('@/components/MaintenanceReports').then(mod => ({ default: mod.MaintenanceReports })),
  {
    loading: () => <Loader text="Loading reports..." />,
  }
);

export default function MaintenanceReportsPage() {
  return <MaintenanceReports />;
}
