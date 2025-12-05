// Performance optimization: Code splitting with dynamic import
// Component only loads when this route is visited
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, Calendar, AlertTriangle, TrendingUp } from 'lucide-react';
import { Loader } from '@/components/ui/loader';

const DriverManagement = dynamic(() => 
  import('@/components/DriverManagement').then(mod => ({ default: mod.DriverManagement })),
  {
    loading: () => <Loader text="Loading drivers..." />,
  }
);

const DriverForms = dynamic(() => 
  import('@/components/DriverForms').then(mod => ({ default: mod.DriverForms })),
  {
    loading: () => <Loader text="Loading performance forms..." />,
  }
);

const DriverScheduleManagement = dynamic(() => 
  import('@/components/DriverSchedule').then(mod => ({ default: mod.DriverScheduleManagement })),
  {
    loading: () => <Loader text="Loading schedules..." />,
  }
);

const ScheduleConflictChecker = dynamic(() => 
  import('@/components/ScheduleConflictChecker').then(mod => ({ default: mod.ScheduleConflictChecker })),
  {
    loading: () => <Loader text="Loading conflict checker..." />,
  }
);

const PerformanceTrendsChart = dynamic(() => 
  import('@/components/PerformanceTrendsChart').then(mod => ({ default: mod.PerformanceTrendsChart })),
  {
    loading: () => <Loader text="Loading trends..." />,
  }
);

export default function DriversPage() {
  const [activeTab, setActiveTab] = useState('drivers');

  return (
    <div className="h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="px-6 pt-6 pb-2 border-b">
          <TabsList className="flex h-auto w-full max-w-4xl">
            <TabsTrigger value="drivers" className="gap-2 py-2">
              <Users className="h-4 w-4" />
              Drivers
            </TabsTrigger>
            <TabsTrigger value="forms" className="gap-2 py-2">
              <FileText className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="schedules" className="gap-2 py-2">
              <Calendar className="h-4 w-4" />
              Schedules
            </TabsTrigger>
            <TabsTrigger value="conflicts" className="gap-2 py-2">
              <AlertTriangle className="h-4 w-4" />
              Conflicts
            </TabsTrigger>
            <TabsTrigger value="trends" className="gap-2 py-2">
              <TrendingUp className="h-4 w-4" />
              Trends
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="drivers" className="flex-1 m-0 overflow-hidden">
          <DriverManagement />
        </TabsContent>
        
        <TabsContent value="forms" className="flex-1 m-0 overflow-hidden">
          <DriverForms />
        </TabsContent>
        
        <TabsContent value="schedules" className="flex-1 m-0 overflow-hidden">
          <DriverScheduleManagement />
        </TabsContent>

        <TabsContent value="conflicts" className="flex-1 m-0 overflow-auto">
          <div className="p-6">
            <ScheduleConflictChecker />
          </div>
        </TabsContent>

        <TabsContent value="trends" className="flex-1 m-0 overflow-auto">
          <div className="p-6">
            <PerformanceTrendsChart />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

