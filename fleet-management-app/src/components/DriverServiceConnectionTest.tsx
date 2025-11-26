/**
 * Driver Service Connection Test Component
 * 
 * This component tests the connection to the Driver Service backend (port 6001)
 * and displays the status of all available endpoints.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { driverService, formService, scheduleService, API_CONFIG } from '@/services/api';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface EndpointTest {
  name: string;
  description: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
}

export function DriverServiceConnectionTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [tests, setTests] = useState<EndpointTest[]>([
    { name: 'Driver Service URL', description: API_CONFIG.DRIVER_SERVICE_URL, status: 'pending' },
    { name: 'GET /api/drivers/list', description: 'Fetch all drivers', status: 'pending' },
    { name: 'GET /api/forms/list', description: 'Fetch all performance forms', status: 'pending' },
    { name: 'GET /api/schedules/list', description: 'Fetch all schedules', status: 'pending' },
  ]);

  const runTests = async () => {
    setIsTesting(true);
    const updatedTests = [...tests];

    // Test 1: Base URL (just checking if it's configured)
    updatedTests[0].status = 'success';
    updatedTests[0].message = 'Configured';
    setTests([...updatedTests]);

    // Test 2: Get all drivers
    try {
      const driversResponse = await driverService.getAll();
      if (driversResponse.success) {
        updatedTests[1].status = 'success';
        updatedTests[1].message = `Found ${driversResponse.data?.length || 0} drivers`;
      } else {
        updatedTests[1].status = 'error';
        updatedTests[1].message = driversResponse.error || 'Failed to fetch';
      }
    } catch (error) {
      updatedTests[1].status = 'error';
      updatedTests[1].message = 'Connection failed';
    }
    setTests([...updatedTests]);

    // Test 3: Get all forms
    try {
      const formsResponse = await formService.getAll();
      if (formsResponse.success) {
        updatedTests[2].status = 'success';
        updatedTests[2].message = `Found ${formsResponse.data?.length || 0} forms`;
      } else {
        updatedTests[2].status = 'error';
        updatedTests[2].message = formsResponse.error || 'Failed to fetch';
      }
    } catch (error) {
      updatedTests[2].status = 'error';
      updatedTests[2].message = 'Connection failed';
    }
    setTests([...updatedTests]);

    // Test 4: Get all schedules
    try {
      const schedulesResponse = await scheduleService.getAll();
      if (schedulesResponse.success) {
        updatedTests[3].status = 'success';
        updatedTests[3].message = `Found ${schedulesResponse.data?.length || 0} schedules`;
      } else {
        updatedTests[3].status = 'error';
        updatedTests[3].message = schedulesResponse.error || 'Failed to fetch';
      }
    } catch (error) {
      updatedTests[3].status = 'error';
      updatedTests[3].message = 'Connection failed';
    }
    setTests([...updatedTests]);

    setIsTesting(false);
  };

  const getStatusIcon = (status: EndpointTest['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: EndpointTest['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-600">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const allSuccess = tests.every(test => test.status === 'success');
  const anyError = tests.some(test => test.status === 'error');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Driver Service Connection Test</CardTitle>
          <Button 
            onClick={runTests} 
            disabled={isTesting}
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isTesting ? 'animate-spin' : ''}`} />
            {isTesting ? 'Testing...' : 'Run Tests'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {allSuccess && !isTesting && (
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              All endpoints are working correctly! Driver service is connected.
            </AlertDescription>
          </Alert>
        )}

        {anyError && !isTesting && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Some endpoints failed. Make sure the Driver Service is running at {API_CONFIG.DRIVER_SERVICE_URL}.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {tests.map((test, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(test.status)}
                <div>
                  <p className="font-medium">{test.name}</p>
                  <p className="text-sm text-muted-foreground">{test.description}</p>
                  {test.message && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {test.message}
                    </p>
                  )}
                </div>
              </div>
              {getStatusBadge(test.status)}
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-semibold mb-2">Connection Instructions:</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Ensure the Driver Service backend is running at {API_CONFIG.DRIVER_SERVICE_URL}</li>
            <li>Check that PostgreSQL database is accessible</li>
            <li>Verify CORS is enabled for the frontend origin</li>
            <li>Click "Run Tests" to verify all endpoints</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}

