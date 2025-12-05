'use client';

import dynamic from 'next/dynamic';
import { Loader } from '@/components/ui/loader';

const TechnicianManagement = dynamic(() => 
  import('@/components/TechnicianManagement').then(mod => ({ default: mod.TechnicianManagement })),
  {
    loading: () => <Loader text="Loading technicians..." />,
  }
);

export default function TechniciansPage() {
  return <TechnicianManagement />;
}
