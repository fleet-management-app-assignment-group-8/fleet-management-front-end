'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useRouter } from 'next/navigation';
import { 
  LayoutGrid,
  Wrench,
  BarChart3,
  Calendar,
  Package,
  Users,
  FileText,
  Repeat,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { maintenanceService } from '@/services/api';

export function MaintenanceDashboard() {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await maintenanceService.getSummary();
        if (response.success && response.data) {
          setSummary(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const modules = [
    {
      title: 'Maintenance Management',
      description: 'Manage all maintenance items, schedules, and tasks',
      icon: Wrench,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/maintenance/manage',
      stats: summary ? `${summary.total_items} items` : 'Loading...'
    },
    {
      title: 'Cost Analytics',
      description: 'Track costs, budgets, and financial insights',
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/maintenance/analytics',
      stats: summary ? `$${summary.total_estimated_cost.toFixed(0)} budget` : 'Loading...'
    },
    {
      title: 'Maintenance Scheduler',
      description: 'Calendar view of all maintenance schedules',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '/maintenance/scheduler',
      stats: summary ? `${summary.overdue_count + summary.due_soon_count} upcoming` : 'Loading...'
    },
    {
      title: 'Parts Inventory',
      description: 'Manage parts, supplies, and inventory tracking',
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      href: '/maintenance/parts',
      stats: 'Track stock levels'
    },
    {
      title: 'Technician Management',
      description: 'Manage technicians, assignments, and schedules',
      icon: Users,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      href: '/maintenance/technicians',
      stats: 'Manage team'
    },
    {
      title: 'Recurring Schedules',
      description: 'Automated recurring maintenance schedules',
      icon: Repeat,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      href: '/maintenance/recurring',
      stats: 'Automate planning'
    },
    {
      title: 'Reports & Analytics',
      description: 'Generate and export detailed reports',
      icon: FileText,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      href: '/maintenance/reports',
      stats: 'Export data'
    }
  ];

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div>
        <h2 className="text-2xl font-semibold">Maintenance System</h2>
        <p className="text-muted-foreground">Comprehensive maintenance management and analytics</p>
      </div>

      {/* Quick Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_items}</div>
              <p className="text-xs text-muted-foreground">All maintenance records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.overdue_count}</div>
              <p className="text-xs text-muted-foreground">Overdue items</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{summary.due_soon_count}</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.total_estimated_cost.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">Estimated costs</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alert Banner */}
      {summary && summary.overdue_count > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">Urgent Action Required</p>
                  <p className="text-sm text-red-800">
                    {summary.overdue_count} maintenance item{summary.overdue_count > 1 ? 's are' : ' is'} overdue
                  </p>
                </div>
              </div>
              <Button 
                className="bg-red-600 text-white hover:bg-red-700 cursor-pointer z-10 relative shadow-sm transition-colors"
                onClick={() => router.push('/maintenance/manage')}
              >
                View Items
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Card 
              key={module.title}
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-primary"
              onClick={() => router.push(module.href)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${module.bgColor}`}>
                    <Icon className={`h-6 w-6 ${module.color}`} />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="mt-4">{module.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {module.description}
                </p>
                <Badge variant="outline">{module.stats}</Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>


      {/* Status Overview */}
      {summary && summary.by_status && (
        <Card>
          <CardHeader>
            <CardTitle>Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(summary.by_status as Record<string, number>).map(([status, count]) => (
                <div key={status} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs text-muted-foreground capitalize mt-1">
                    {status.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

