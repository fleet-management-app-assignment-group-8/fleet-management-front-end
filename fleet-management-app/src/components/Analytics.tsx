"use client";

import React from 'react';
import { Button } from './ui/button';
import { Calendar, Download } from 'lucide-react';
import { PerformanceMetrics } from './analytics/PerformanceMetrics';
import { FuelConsumptionChart } from './analytics/FuelConsumptionChart';
import { VehicleUtilizationChart } from './analytics/VehicleUtilizationChart';
import { MaintenanceCostsChart } from './analytics/MaintenanceCostsChart';
import { InsightsSection } from './analytics/InsightsSection';
import { fuelConsumptionData, maintenanceCostsData } from './constants/mockData';

export function Analytics() {
  const handleExport = () => {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `fleet_analytics_report_${timestamp}.csv`;

    const headers = ['Report Type', 'Month', 'Value 1', 'Value 2'];
    const rows: (string | number)[][] = [];

    // Add Fuel Consumption Data
    fuelConsumptionData.forEach(item => {
      rows.push(['Fuel Consumption', item.month, item.consumption, item.cost]);
    });

    // Add Maintenance Costs Data
    maintenanceCostsData.forEach(item => {
      rows.push(['Maintenance Costs', item.month, item.scheduled, item.emergency]);
    });

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

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Analytics & Reports</h2>
          <p className="text-muted-foreground">Analyze fleet performance and operational metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => alert("Date Range filter functionality coming soon")}>
            <Calendar className="h-4 w-4" />
            Date Range
          </Button>
          <Button className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <PerformanceMetrics />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FuelConsumptionChart />
        <VehicleUtilizationChart />
      </div>

      <MaintenanceCostsChart />

      <InsightsSection />
    </div>
  );
}