"use client";

import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, TrendingUp, Clock, DollarSign, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  fuelConsumptionData, 
  vehicleUtilizationData, 
  maintenanceCostsData, 
  performanceMetrics, 
  topPerformingDrivers 
} from './constants/mockData';

export function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const reportTypes = [
    {
      id: 'fleet-performance',
      name: 'Fleet Performance Report',
      description: 'Comprehensive vehicle utilization and performance metrics',
      icon: TrendingUp,
      lastGenerated: '2 hours ago',
      schedule: 'Weekly',
      category: 'performance',
    },
    {
      id: 'maintenance-summary',
      name: 'Maintenance Summary',
      description: 'Maintenance costs, schedules, and service history',
      icon: Activity,
      lastGenerated: '1 day ago',
      schedule: 'Monthly',
      category: 'maintenance',
    },
    {
      id: 'fuel-consumption',
      name: 'Fuel Consumption Analysis',
      description: 'Fuel usage patterns and cost analysis',
      icon: DollarSign,
      lastGenerated: '3 hours ago',
      schedule: 'Weekly',
      category: 'fuel',
    },
    {
      id: 'driver-performance',
      name: 'Driver Performance Report',
      description: 'Driver safety scores, efficiency, and compliance',
      icon: Clock,
      lastGenerated: '5 hours ago',
      schedule: 'Monthly',
      category: 'performance',
    },
  ];

  const scheduledReports = [
    { name: 'Monthly Fleet Overview', schedule: 'Every 1st of month', nextRun: 'Nov 1, 2024', status: 'active' },
    { name: 'Weekly Maintenance Report', schedule: 'Every Monday', nextRun: 'Oct 14, 2024', status: 'active' },
    { name: 'Quarterly Financial Summary', schedule: 'Every quarter', nextRun: 'Jan 1, 2025', status: 'active' },
    { name: 'Daily Operations Report', schedule: 'Daily at 6 PM', nextRun: 'Today, 6:00 PM', status: 'active' },
  ];

  const recentReports = [
    { name: 'Fleet Performance - September 2024', date: 'Oct 1, 2024', size: '2.4 MB', format: 'PDF' },
    { name: 'Maintenance Summary - Q3 2024', date: 'Sep 30, 2024', size: '1.8 MB', format: 'PDF' },
    { name: 'Fuel Analysis - Week 39', date: 'Sep 28, 2024', size: '856 KB', format: 'Excel' },
    { name: 'Driver Performance - September', date: 'Sep 27, 2024', size: '1.2 MB', format: 'PDF' },
  ];

  const generateReport = (reportId: string) => {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const reportConfig = reportTypes.find(r => r.id === reportId);
    
    if (!reportConfig) return;

    const filename = `${reportConfig.id}_${timestamp}.csv`;
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    switch (reportId) {
      case 'fleet-performance':
        headers = ['Metric', 'Value', 'Change', 'Trend'];
        rows = performanceMetrics.map(m => [m.metric, m.value, m.change, m.trend]);
        // Append utilization data section
        rows.push([]);
        rows.push(['Utilization Status', 'Count', 'Color']);
        vehicleUtilizationData.forEach(d => rows.push([d.name, d.value, d.color]));
        break;
        
      case 'maintenance-summary':
        headers = ['Month', 'Scheduled Cost', 'Emergency Cost'];
        rows = maintenanceCostsData.map(m => [m.month, m.scheduled, m.emergency]);
        break;

      case 'fuel-consumption':
        headers = ['Month', 'Consumption (L)', 'Cost'];
        rows = fuelConsumptionData.map(f => [f.month, f.consumption, f.cost]);
        break;

      case 'driver-performance':
        headers = ['Driver Name', 'Safety Score', 'Trips'];
        rows = topPerformingDrivers.map(d => [d.name, d.score, d.trips]);
        break;
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadReport = (reportName: string) => {
    alert(`Downloading ${reportName}...`);
  };

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Reports & Analytics</h2>
          <p className="text-muted-foreground">Generate and manage fleet management reports</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="fuel">Fuel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList>
          <TabsTrigger value="generate">Generate Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="recent">Recent Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTypes
              .filter(report => selectedCategory === 'all' || report.category === selectedCategory)
              .map((report) => {
                const Icon = report.icon;
                return (
                  <Card key={report.id} className="hover:border-primary transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{report.name}</CardTitle>
                            <CardDescription className="mt-1">{report.description}</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Last generated: {report.lastGenerated}
                          </p>
                          <Badge variant="secondary">{report.schedule}</Badge>
                        </div>
                        <Button onClick={() => generateReport(report.id)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Generate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Automated report generation schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Next Run</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledReports.map((report, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>{report.schedule}</TableCell>
                      <TableCell>{report.nextRun}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Previously generated reports available for download</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Generated Date</TableHead>
                    <TableHead>File Size</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentReports.map((report, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>{report.size}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.format}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => downloadReport(report.name)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
