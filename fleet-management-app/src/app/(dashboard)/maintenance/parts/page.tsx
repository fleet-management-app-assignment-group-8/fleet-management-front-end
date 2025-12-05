'use client';

import dynamic from 'next/dynamic';
import { Loader } from '@/components/ui/loader';

const PartsInventory = dynamic(() => 
  import('@/components/PartsInventory').then(mod => ({ default: mod.PartsInventory })),
  {
    loading: () => <Loader text="Loading parts inventory..." />,
  }
);

export default function PartsInventoryPage() {
  return <PartsInventory />;
}
