'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Truck, 
  Users, 
  MapPin, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp,
  Activity,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  Fuel
} from 'lucide-react';
import { ConnectionTester } from './ConnectionTester';
import { vehicleService } from '@/services/api';

interface VehicleStatistics {
  totalVehicles: number;
  activeVehicles: number;
  idleVehicles: number;
  maintenanceVehicles: number;
  offlineVehicles: number;
  averageFuelLevel: number;
  averageMileage: number;
  lowFuelCount: number;
  maintenanceDueCount: number;
}

export function DashboardOverview() {
  const [showConnectionTester, setShowConnectionTester] = useState(false);
  const [stats, setStats] = useState<VehicleStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await vehicleService.getStatistics();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error || 'Failed to fetch statistics');
      }
    } catch (err) {
      setError('An error occurred while fetching statistics');
      console.error('Error fetching statistics:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const metrics = stats ? [
    {
      title: 'Total Vehicles',
      value: stats.totalVehicles.toString(),
      change: `${stats.activeVehicles} active`,
      icon: Truck,
      color: 'text-blue-600'
    },
    {
      title: 'Active Vehicles',
      value: stats.activeVehicles.toString(),
      change: stats.totalVehicles > 0 ? `${((stats.activeVehicles / stats.totalVehicles) * 100).toFixed(0)}% utilization` : '0%',
      icon: Activity,
      color: 'text-green-600'
    },
    {
      title: 'Idle Vehicles',
      value: stats.idleVehicles.toString(),
      change: 'Ready for dispatch',
      icon: MapPin,
      color: 'text-orange-600'
    },
    {
      title: 'Maintenance Alerts',
      value: stats.maintenanceDueCount.toString(),
      change: stats.maintenanceVehicles > 0 ? `${stats.maintenanceVehicles} in service` : 'All clear',
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      title: 'Low Fuel Alerts',
      value: stats.lowFuelCount.toString(),
      change: `${stats.averageFuelLevel.toFixed(0)}% avg level`,
      icon: Fuel,
      color: 'text-purple-600'
    },
    {
      title: 'Average Mileage',
      value: `${(stats.averageMileage / 1000).toFixed(1)}k`,
      change: 'km per vehicle',
      icon: TrendingUp,
      color: 'text-emerald-600'
    }
  ] : [];

  const vehicleStatus = stats ? [
    { status: 'Active', count: stats.activeVehicles, color: 'bg-green-500', total: stats.totalVehicles },
    { status: 'Idle', count: stats.idleVehicles, color: 'bg-yellow-500', total: stats.totalVehicles },
    { status: 'Maintenance', count: stats.maintenanceVehicles, color: 'bg-red-500', total: stats.totalVehicles },
    { status: 'Offline', count: stats.offlineVehicles, color: 'bg-gray-500', total: stats.totalVehicles },
  ] : [];

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Fleet Dashboard</h2>
          <p className="text-muted-foreground">Monitor your fleet performance and status</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStatistics}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConnectionTester(!showConnectionTester)}
          >
            {showConnectionTester ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Hide Connection Test
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Test Backend Connection
              </>
            )}
          </Button>
          {!isLoading && stats && (
            <Badge variant="default" className="gap-1">
              <Activity className="h-3 w-3" />
              Live Data
            </Badge>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Connection Tester */}
      {showConnectionTester && (
        <div className="animate-in slide-in-from-top">
          <ConnectionTester />
        </div>
      )}

      {/* Metrics Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{metric.change}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">No data available</p>
          <Button className="mt-4" onClick={fetchStatistics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}

      {!isLoading && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicle Status */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {vehicleStatus.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                    <span className="text-sm">{status.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{status.count}</span>
                    <Progress 
                      value={status.total > 0 ? (status.count / status.total) * 100 : 0} 
                      className="w-16 h-2"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Fleet Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Fleet Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Average Fuel Level</span>
                  </div>
                  <span className="text-sm font-medium">{stats.averageFuelLevel.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Low Fuel Vehicles</span>
                  </div>
                  <span className="text-sm font-medium">{stats.lowFuelCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Average Mileage</span>
                  </div>
                  <span className="text-sm font-medium">{stats.averageMileage.toLocaleString()} km</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Maintenance Due</span>
                  </div>
                  <span className="text-sm font-medium">{stats.maintenanceDueCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}