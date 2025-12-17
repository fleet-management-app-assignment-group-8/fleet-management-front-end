'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, Loader2, Server, Terminal } from 'lucide-react';
import { API_CONFIG } from '@/services/api/baseApi';
import { maintenanceService, driverService, vehicleService } from '@/services/api';

type ServiceStatus = 'success' | 'error' | 'pending';
type ServiceResult = { status: ServiceStatus; message: string };

export function DeveloperTesting() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{
    maintenance: ServiceResult;
    driver: ServiceResult;
    vehicle: ServiceResult;
  }>({
    maintenance: { status: 'pending', message: 'Not tested' },
    driver: { status: 'pending', message: 'Not tested' },
    vehicle: { status: 'pending', message: 'Not tested' },
  });

  const testMaintenanceService = async (): Promise<ServiceResult> => {
    try {
      const serviceUrl = API_CONFIG.MAINTENANCE_SERVICE_URL;
      
      // Test health endpoint (public)
      const healthResponse = await fetch(`${serviceUrl}/health`);
      if (!healthResponse.ok) {
        throw new Error('Health check failed');
      }

      // Test API endpoint using Authenticated Service
      const response = await maintenanceService.getAll({}, 1, 1);
      
      if (!response.success) {
        throw new Error(response.error || 'API request failed');
      }

      const data = response.data;
      
      return {
        status: 'success',
        message: `Connected! Found ${data.total || 0} maintenance items`,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  };

  const testDriverService = async (): Promise<ServiceResult> => {
    try {
      const serviceUrl = API_CONFIG.DRIVER_SERVICE_URL;
      
      // Test health endpoint (public)
      const healthResponse = await fetch(`${serviceUrl}/health`).catch(() => 
        fetch(`${serviceUrl}/`)
      );
      
      if (!healthResponse.ok) {
        throw new Error('Service not responding');
      }

      // Test API endpoint using Authenticated Service
      const response = await driverService.getAll();
      
      if (!response.success) {
        throw new Error(response.error || 'API request failed');
      }

      const data = response.data;
      const driverCount = Array.isArray(data) ? data.length : 0;
      
      return {
        status: 'success',
        message: `Connected! Found ${driverCount} drivers`,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  };

  const testVehicleService = async (): Promise<ServiceResult> => {
    try {
      const serviceUrl = API_CONFIG.VEHICLE_SERVICE_URL;
      
      // Test health endpoint (public)
      const healthResponse = await fetch(`${serviceUrl}/health`);
      if (!healthResponse.ok) {
        throw new Error('Health check failed');
      }

      // Test API endpoint using Authenticated Service
      // Using getStatistics as it's a lightweight read operation
      const response = await vehicleService.getStatistics();
      
      if (!response.success) {
        throw new Error(response.error || 'API request failed');
      }

      const data = response.data;
      const vehicleCount = data.TotalVehicles || data.totalVehicles || 0;
      
      return {
        status: 'success',
        message: `Connected! Found ${vehicleCount} vehicles`,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  };

  const runTests = async () => {
    setTesting(true);
    
    // Reset all to pending
    setResults({
      maintenance: { status: 'pending', message: 'Testing...' },
      driver: { status: 'pending', message: 'Testing...' },
      vehicle: { status: 'pending', message: 'Testing...' },
    });
    
    // Test all services in parallel for faster results
    const [maintenanceResult, driverResult, vehicleResult] = await Promise.all([
      testMaintenanceService(),
      testDriverService(),
      testVehicleService(),
    ]);
    
    setResults({
      maintenance: maintenanceResult,
      driver: driverResult,
      vehicle: vehicleResult,
    });
    
    setTesting(false);
  };

  const getStatusIcon = (status: 'success' | 'error' | 'pending') => {
    if (status === 'success') return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (status === 'error') return <XCircle className="h-5 w-5 text-red-600" />;
    return <Server className="h-5 w-5 text-gray-400" />;
  };

  const getStatusBadge = (status: 'success' | 'error' | 'pending') => {
    if (status === 'success') return <Badge variant="default" className="bg-green-600">Connected</Badge>;
    if (status === 'error') return <Badge variant="destructive">Failed</Badge>;
    return <Badge variant="outline">Pending</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Developer Testing</h2>
        <p className="text-sm text-muted-foreground">
          Test backend service connectivity and view configuration details
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Connection Tester Card */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Backend Connection Tester
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {/* Maintenance Service */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(results.maintenance.status)}
                  <div>
                    <p className="font-medium">Maintenance Service</p>
                    <p className="text-sm text-muted-foreground">Python/Flask</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {API_CONFIG.MAINTENANCE_SERVICE_URL}/api/maintenance
                    </p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      {results.maintenance.message}
                    </p>
                  </div>
                </div>
                {getStatusBadge(results.maintenance.status)}
              </div>

              {/* Driver Service */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(results.driver.status)}
                  <div>
                    <p className="font-medium">Driver Service</p>
                    <p className="text-sm text-muted-foreground">Java/Spring Boot</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {API_CONFIG.DRIVER_SERVICE_URL}/api/drivers
                    </p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      {results.driver.message}
                    </p>
                  </div>
                </div>
                {getStatusBadge(results.driver.status)}
              </div>

              {/* Vehicle Service */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(results.vehicle.status)}
                  <div>
                    <p className="font-medium">Vehicle Service</p>
                    <p className="text-sm text-muted-foreground">C#/.NET</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {API_CONFIG.VEHICLE_SERVICE_URL}/api/vehicles
                    </p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      {results.vehicle.message}
                    </p>
                  </div>
                </div>
                {getStatusBadge(results.vehicle.status)}
              </div>
            </div>

            <Button 
              onClick={runTests} 
              disabled={testing}
              className="w-full"
            >
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing Connections...
                </>
              ) : (
                'Test Backend Connections'
              )}
            </Button>

            {(results.maintenance.status !== 'pending' || 
              results.driver.status !== 'pending' || 
              results.vehicle.status !== 'pending') && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Status Legend:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>✅ Green = Service is running and connected</li>
                  <li>❌ Red = Service is not running or unreachable</li>
                  <li>⏱️ Gray = Not tested yet</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Service Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium mb-4 text-blue-900 dark:text-blue-100">
                  How to Start Backend Services
                </h4>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-blue-800 dark:text-blue-200 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      Maintenance Service (Port 5001)
                    </p>
                    <code className="text-xs text-blue-800 dark:text-blue-200 block mt-2 p-3 bg-blue-100 dark:bg-blue-900 rounded font-mono overflow-x-auto">
                      cd fleet-management-backend/src/maintenanceService && ./setup-and-run.sh
                    </code>
                    <div className="mt-2 flex gap-2 text-xs">
                      <a href={`${API_CONFIG.MAINTENANCE_SERVICE_URL}/docs`} target="_blank" rel="noopener" className="text-blue-600 hover:underline flex items-center gap-1">
                        📄 Swagger Docs
                      </a>
                      <span className="text-blue-300">|</span>
                      <a href={`${API_CONFIG.MAINTENANCE_SERVICE_URL}/health`} target="_blank" rel="noopener" className="text-blue-600 hover:underline flex items-center gap-1">
                        💚 Health Check
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-blue-800 dark:text-blue-200 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      Driver Service (Port 6001)
                    </p>
                    <code className="text-xs text-blue-800 dark:text-blue-200 block mt-2 p-3 bg-blue-100 dark:bg-blue-900 rounded font-mono overflow-x-auto">
                      cd fleet-management-backend/src/driverService && ./setup-and-run.sh
                    </code>
                    <div className="mt-2 flex gap-2 text-xs">
                      <a href={`${API_CONFIG.DRIVER_SERVICE_URL}/`} target="_blank" rel="noopener" className="text-blue-600 hover:underline flex items-center gap-1">
                        📄 Swagger Docs
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-blue-800 dark:text-blue-200 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      Vehicle Service (Port 7001)
                    </p>
                    <code className="text-xs text-blue-800 dark:text-blue-200 block mt-2 p-3 bg-blue-100 dark:bg-blue-900 rounded font-mono overflow-x-auto">
                      cd fleet-management-backend/src/vehicleService && ./setup-and-run.sh
                    </code>
                    <div className="mt-2 flex gap-2 text-xs">
                      <a href={`${API_CONFIG.VEHICLE_SERVICE_URL}/swagger`} target="_blank" rel="noopener" className="text-blue-600 hover:underline flex items-center gap-1">
                        📄 Swagger Docs
                      </a>
                      <span className="text-blue-300">|</span>
                      <a href={`${API_CONFIG.VEHICLE_SERVICE_URL}/health`} target="_blank" rel="noopener" className="text-blue-600 hover:underline flex items-center gap-1">
                        💚 Health Check
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
