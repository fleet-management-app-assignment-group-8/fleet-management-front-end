'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Wrench,
  AlertTriangle,
  Calendar,
  BarChart3,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { maintenanceService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface CostAnalytics {
  total_estimated: number;
  total_actual: number;
  variance: number;
  variance_percent: number;
  by_vehicle: Record<string, { estimated: number; actual: number; variance: number }>;
  by_type: Record<string, { estimated: number; actual: number; count: number }>;
  completed_count: number;
  pending_count: number;
}

export function MaintenanceAnalytics() {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<CostAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await maintenanceService.getCostAnalysis();
      
      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to fetch analytics data',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect to maintenance service',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No analytics data available
        </CardContent>
      </Card>
    );
  }

  const isOverBudget = analytics.variance > 0;
  const varianceColor = isOverBudget ? 'text-red-600' : 'text-green-600';
  const VarianceIcon = isOverBudget ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Maintenance Analytics</h2>
          <p className="text-muted-foreground">Cost tracking and performance insights</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAnalytics}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estimated</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.total_estimated.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{analytics.pending_count} pending items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actual</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.total_actual.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{analytics.completed_count} completed items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Variance</CardTitle>
            <VarianceIcon className={`h-4 w-4 ${varianceColor}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${varianceColor}`}>
              ${Math.abs(analytics.variance).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.variance_percent.toFixed(1)}% {isOverBudget ? 'over' : 'under'} budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((analytics.completed_count / (analytics.completed_count + analytics.pending_count)) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.completed_count} / {analytics.completed_count + analytics.pending_count} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cost by Vehicle */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown by Vehicle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analytics.by_vehicle).map(([vehicleId, costs]) => {
              const vehicleVariance = costs.variance;
              const isVehicleOverBudget = vehicleVariance > 0;
              
              return (
                <div key={vehicleId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{vehicleId}</h4>
                      {isVehicleOverBudget && (
                        <Badge variant="destructive">Over Budget</Badge>
                      )}
                    </div>
                    <div className="mt-2 flex gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Estimated: </span>
                        <span className="font-medium">${costs.estimated.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Actual: </span>
                        <span className="font-medium">${costs.actual.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Variance: </span>
                        <span className={`font-medium ${isVehicleOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                          ${Math.abs(vehicleVariance).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {Object.keys(analytics.by_vehicle).length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No vehicle-specific data available
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cost by Maintenance Type */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown by Maintenance Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analytics.by_type)
              .sort(([, a], [, b]) => b.estimated - a.estimated)
              .map(([type, data]) => (
                <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-semibold">{type}</h4>
                      <Badge variant="outline">{data.count} items</Badge>
                    </div>
                    <div className="mt-2 flex gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Estimated: </span>
                        <span className="font-medium">${data.estimated.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Actual: </span>
                        <span className="font-medium">${data.actual.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg per Item: </span>
                        <span className="font-medium">${(data.estimated / data.count).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            
            {Object.keys(analytics.by_type).length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No maintenance type data available
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Budget Alert */}
      {isOverBudget && analytics.variance_percent > 10 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-900">Budget Alert</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-red-800">
              Maintenance costs are currently <strong>{analytics.variance_percent.toFixed(1)}%</strong> over budget.
              Actual spending (${analytics.total_actual.toFixed(2)}) exceeds estimated costs 
              by ${analytics.variance.toFixed(2)}. Consider reviewing maintenance procedures or budget allocation.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

