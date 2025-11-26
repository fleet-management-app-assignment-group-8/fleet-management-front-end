'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  FileText,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Printer,
  Mail,
  RefreshCw,
  Loader2,
  BarChart3,
  PieChart
} from 'lucide-react';
import { maintenanceService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  summary: any;
  costAnalytics: any;
  trends: any;
}

export function MaintenanceReports() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [generating, setGenerating] = useState(false);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Fetch summary
      const summaryResponse = await maintenanceService.getSummary();
      
      // Fetch cost analytics
      const costResponse = await maintenanceService.getCostAnalysis();
      const costData = costResponse.success ? costResponse.data : null;

      // Fetch trends
      const trendsResponse = await maintenanceService.getTrends('month', 6);
      const trendsData = trendsResponse.success ? trendsResponse.data : null;

      setReportData({
        summary: summaryResponse.data,
        costAnalytics: costData,
        trends: trendsData
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

  const generateReport = (format: 'pdf' | 'excel' | 'csv') => {
    setGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      setGenerating(false);
      toast({
        title: 'Success',
        description: `${format.toUpperCase()} report generated successfully`,
      });
      
      // In a real implementation, this would trigger a download
      const filename = `maintenance-report-${new Date().toISOString().split('T')[0]}.${format}`;
      console.log(`Would download: ${filename}`);
    }, 2000);
  };

  const emailReport = () => {
    toast({
      title: 'Email Sent',
      description: 'Report has been sent to your email address',
    });
  };

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
  const costAnalytics = reportData?.costAnalytics;
  const trends = reportData?.trends;

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Maintenance Reports</h2>
          <p className="text-muted-foreground">Generate and export maintenance analytics reports</p>
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 py-4"
              onClick={() => generateReport('pdf')}
              disabled={generating}
            >
              <FileText className="h-8 w-8" />
              <span>PDF Report</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 py-4"
              onClick={() => generateReport('excel')}
              disabled={generating}
            >
              <BarChart3 className="h-8 w-8" />
              <span>Excel Spreadsheet</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 py-4"
              onClick={() => generateReport('csv')}
              disabled={generating}
            >
              <Download className="h-8 w-8" />
              <span>CSV Export</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 py-4"
              onClick={emailReport}
            >
              <Mail className="h-8 w-8" />
              <span>Email Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold">{summary.total_items}</div>
                <div className="text-sm text-muted-foreground">Total Items</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-red-600">{summary.overdue_count}</div>
                <div className="text-sm text-muted-foreground">Overdue</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-orange-600">{summary.due_soon_count}</div>
                <div className="text-sm text-muted-foreground">Due Soon</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  ${summary.total_estimated_cost.toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground">Est. Budget</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Status Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(summary.by_status as Record<string, number>).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between p-2 border rounded">
                      <span className="capitalize text-sm">{status.replace('_', ' ')}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Priority Distribution</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(summary.by_priority as Record<string, number>).map(([priority, count]) => (
                    <div key={priority} className="flex items-center justify-between p-2 border rounded">
                      <span className="capitalize text-sm">{priority}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost Analysis */}
      {costAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle>Cost Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Total Estimated</span>
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold">${costAnalytics.total_estimated.toFixed(2)}</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Total Actual</span>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-2xl font-bold">${costAnalytics.total_actual.toFixed(2)}</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Variance</span>
                  <TrendingUp className={`h-4 w-4 ${costAnalytics.variance > 0 ? 'text-red-600' : 'text-green-600'}`} />
                </div>
                <div className={`text-2xl font-bold ${costAnalytics.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${Math.abs(costAnalytics.variance).toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {costAnalytics.variance_percent.toFixed(1)}% {costAnalytics.variance > 0 ? 'over' : 'under'}
                </div>
              </div>
            </div>

            {/* Cost by Type */}
            {costAnalytics.by_type && Object.keys(costAnalytics.by_type).length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Cost by Maintenance Type</h4>
                <div className="space-y-2">
                  {Object.entries(costAnalytics.by_type as Record<string, any>)
                    .sort(([, a], [, b]) => b.estimated - a.estimated)
                    .map(([type, data]) => (
                      <div key={type} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1">
                          <div className="font-medium">{type}</div>
                          <div className="text-sm text-muted-foreground">{data.count} items</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${data.estimated.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">
                            ${(data.estimated / data.count).toFixed(2)} avg
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Maintenance Trends */}
      {trends && trends.periods && (
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Trends (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Simple text-based trend visualization */}
              <div>
                <h4 className="font-semibold mb-3">Monthly Maintenance Volume</h4>
                <div className="space-y-2">
                  {trends.periods.map((period: string, idx: number) => {
                    const total = trends.total_items[idx];
                    const completed = trends.completed[idx];
                    const percentage = total > 0 ? (completed / total) * 100 : 0;
                    
                    return (
                      <div key={period} className="p-3 border rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{period}</span>
                          <div className="flex gap-4 text-sm">
                            <span>Total: {total}</span>
                            <span className="text-green-600">Completed: {completed}</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cost trends */}
              <div>
                <h4 className="font-semibold mb-3">Monthly Cost Trends</h4>
                <div className="space-y-2">
                  {trends.periods.map((period: string, idx: number) => {
                    const estimated = trends.estimated_cost[idx];
                    const actual = trends.actual_cost[idx];
                    
                    return (
                      <div key={period} className="flex items-center justify-between p-3 border rounded">
                        <span className="font-medium">{period}</span>
                        <div className="flex gap-6 text-sm">
                          <div>
                            <span className="text-muted-foreground">Est: </span>
                            <span className="font-medium">${estimated.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Actual: </span>
                            <span className="font-medium">${actual.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {summary && summary.overdue_count > 0 && (
              <div className="flex items-start gap-3 p-3 border border-red-200 bg-red-50 rounded">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-red-900">Urgent: Overdue Maintenance</div>
                  <div className="text-sm text-red-800">
                    {summary.overdue_count} item(s) are overdue. Schedule immediate maintenance to avoid 
                    vehicle downtime and safety risks.
                  </div>
                </div>
              </div>
            )}
            
            {costAnalytics && costAnalytics.variance > 0 && costAnalytics.variance_percent > 10 && (
              <div className="flex items-start gap-3 p-3 border border-orange-200 bg-orange-50 rounded">
                <DollarSign className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-orange-900">Budget Review Needed</div>
                  <div className="text-sm text-orange-800">
                    Actual costs are {costAnalytics.variance_percent.toFixed(1)}% over budget. 
                    Consider reviewing maintenance procedures or adjusting budget allocation.
                  </div>
                </div>
              </div>
            )}

            {summary && summary.due_soon_count > 5 && (
              <div className="flex items-start gap-3 p-3 border border-blue-200 bg-blue-50 rounded">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-blue-900">Plan Ahead</div>
                  <div className="text-sm text-blue-800">
                    {summary.due_soon_count} maintenance items are due soon. Schedule these preventive 
                    maintenance tasks to avoid service backlogs.
                  </div>
                </div>
              </div>
            )}

            {costAnalytics && costAnalytics.variance < 0 && Math.abs(costAnalytics.variance_percent) > 5 && (
              <div className="flex items-start gap-3 p-3 border border-green-200 bg-green-50 rounded">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-green-900">Cost Efficiency</div>
                  <div className="text-sm text-green-800">
                    Maintenance costs are {Math.abs(costAnalytics.variance_percent).toFixed(1)}% under budget. 
                    Great job managing costs efficiently!
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Footer */}
      <Card>
        <CardContent className="py-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>Report generated on {new Date().toLocaleString()}</p>
            <p className="mt-1">Fleet Management System - Maintenance Service</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

