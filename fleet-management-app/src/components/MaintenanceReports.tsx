'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Printer,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { maintenanceService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  summary: any;
}

export function MaintenanceReports() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Fetch summary
      const summaryResponse = await maintenanceService.getSummary();
      
      setReportData({
        summary: summaryResponse.data
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch report data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const printReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const summary = reportData?.summary;

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Maintenance Reports</h2>
          <p className="text-muted-foreground">Maintenance overview and actionable insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchReportData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={printReport}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="text-4xl font-bold mb-2">{summary.total_items}</div>
              <div className="text-sm text-muted-foreground font-medium">Total Items</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">{summary.overdue_count}</div>
              <div className="text-sm text-muted-foreground font-medium">Overdue</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">{summary.due_soon_count}</div>
              <div className="text-sm text-muted-foreground font-medium">Due Soon</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Action Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {!summary?.overdue_count && !summary?.due_soon_count && (
                <div className="flex items-start gap-3 p-3 border border-green-200 bg-green-50 rounded">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-green-900">All Systems Go</div>
                  <div className="text-sm text-green-800">
                    No immediate maintenance actions required.
                  </div>
                </div>
              </div>
            )}
            {summary && summary.overdue_count > 0 && (
              <div className="flex items-start gap-3 p-3 border border-red-200 bg-red-50 rounded">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-red-900">Urgent: Overdue Maintenance</div>
                  <div className="text-sm text-red-800">
                    {summary.overdue_count} item(s) are overdue. Schedule immediate maintenance.
                  </div>
                </div>
              </div>
            )}

            {summary && summary.due_soon_count > 0 && (
              <div className="flex items-start gap-3 p-3 border border-blue-200 bg-blue-50 rounded">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-blue-900">Upcoming Maintenance</div>
                  <div className="text-sm text-blue-800">
                    {summary.due_soon_count} maintenance items are due soon.
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

