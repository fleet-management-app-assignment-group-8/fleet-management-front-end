'use client';

import dynamic from 'next/dynamic';
import { Loader } from '@/components/ui/loader';

const RecurringMaintenance = dynamic(() => 
  import('@/components/RecurringMaintenance').then(mod => ({ default: mod.RecurringMaintenance })),
  {
    loading: () => <Loader text="Loading recurring schedules..." />,
  }
);

export default function RecurringMaintenancePage() {
  return <RecurringMaintenance />;
}
