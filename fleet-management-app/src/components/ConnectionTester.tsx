'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, Loader2, Server } from 'lucide-react';

export function ConnectionTester() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{
    maintenance: { status: 'success' | 'error' | 'pending'; message: string };
  }>({
    maintenance: { status: 'pending', message: 'Not tested' },
  });

  const testMaintenanceService = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_MAINTENANCE_API_URL || 'http://localhost:5001/api';
      const serviceUrl = process.env.NEXT_PUBLIC_MAINTENANCE_SERVICE_URL || 'http://localhost:5001';
      
      // Test health endpoint
      const healthResponse = await fetch(`${serviceUrl}/health`);
      if (!healthResponse.ok) {
        throw new Error('Health check failed');
      }

      // Test API endpoint
      const apiResponse = await fetch(`${baseUrl}/maintenance?page=1&per_page=1`);
      if (!apiResponse.ok) {
        throw new Error(`API returned status ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      
      return {
        status: 'success' as const,
        message: `Connected! Found ${data.total || 0} maintenance items`,
      };
    } catch (error) {
      return {
        status: 'error' as const,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  };

  const runTests = async () => {
    setTesting(true);
    
    // Test maintenance service
    const maintenanceResult = await testMaintenanceService();
    
    setResults({
      maintenance: maintenanceResult,
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
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Backend Connection Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(results.maintenance.status)}
              <div>
                <p className="font-medium">Maintenance Service</p>
                <p className="text-sm text-muted-foreground">
                  {results.maintenance.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  http://localhost:5001/api/maintenance
                </p>
              </div>
            </div>
            {getStatusBadge(results.maintenance.status)}
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

        {results.maintenance.status !== 'pending' && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Quick Tips:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✅ Green = Backend is running and connected</li>
              <li>❌ Red = Backend is not running or unreachable</li>
              <li>🔧 Make sure backend is running on port 5001</li>
              <li>📚 Check Swagger docs at http://localhost:5001/docs</li>
            </ul>
          </div>
        )}

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
            How to Start Backend:
          </h4>
          <code className="text-sm text-blue-800 dark:text-blue-200 block mt-2 p-2 bg-blue-100 dark:bg-blue-900 rounded">
            cd fleet-management-backend\src\maintenanceService<br />
            python run.py
          </code>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
            Or use Docker: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">docker-compose up</code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

