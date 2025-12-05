/**
 * Reports API Service
 * 
 * Handles all reports-related API calls to the Vehicle Service backend.
 * Provides fleet performance, fuel consumption, and maintenance reports.
 */

import { vehicleApi, type ApiResponse, API_CONFIG } from './baseApi';

// Report types based on backend responses
export interface FleetPerformanceReport {
  reportType: string;
  period: string;
  generatedAt: string;
  summary: {
    totalVehicles: number;
    activeVehicles: number;
    utilizationRate: number;
    averageMileage: number;
    totalMileage: number;
  };
  vehicles: Array<{
    id: string;
    make: string;
    model: string;
    licensePlate: string;
    status: string;
    mileage: number;
    fuelLevel: number;
    lastMaintenance?: string;
  }>;
}

export interface FuelConsumptionReport {
  reportType: string;
  period: string;
  generatedAt: string;
  summary: {
    averageFuelLevel: number;
    lowFuelVehicles: number;
    criticalFuelVehicles: number;
    fuelTypeDistribution: Array<{
      fuelType: string;
      count: number;
    }>;
  };
  vehicles: Array<{
    id: string;
    make: string;
    model: string;
    licensePlate: string;
    fuelLevel: number;
    fuelType: string;
    currentDriver?: string;
    status: string;
  }>;
}

export interface MaintenanceSummaryReport {
  reportType: string;
  period: string;
  generatedAt: string;
  summary: {
    totalVehicles: number;
    inMaintenance: number;
    maintenanceDueSoon: number;
    overdueCount: number;
    nextWeekScheduled: number;
  };
  upcomingMaintenance: Array<{
    vehicleId: string;
    make: string;
    model: string;
    licensePlate: string;
    dueDate?: string;
    lastMaintenance?: string;
    currentMileage: number;
    priority: 'overdue' | 'due-soon';
  }>;
  vehiclesInService: Array<{
    vehicleId: string;
    make: string;
    model: string;
    licensePlate: string;
    currentMileage: number;
  }>;
}

export interface FleetSummaryReport {
  reportType: string;
  generatedAt: string;
  fleetOverview: {
    totalVehicles: number;
    activeVehicles: number;
    idleVehicles: number;
    maintenanceVehicles: number;
    offlineVehicles: number;
  };
  fuelStatus: {
    averageFuelLevel: number;
    lowFuelCount: number;
    criticalFuelCount: number;
    fuelTypeDistribution?: Array<{ fuelType: string; count: number }>;
  };
  maintenance: {
    inService: number;
    dueSoon: number;
  };
  mileageStats: {
    totalMileage: number;
    averageMileage: number;
    highestMileage: number;
    lowestMileage: number;
  };
}

export interface GeneratedReport {
  id: number;
  reportName: string;
  reportType: string;
  generatedDate: string;
  fileSize: string;
  format: string;
}

class ReportsService {
  private readonly endpoint = '/api/reports';

  /**
   * Get fleet performance report
   * @param period - Time period for the report (default: 'month')
   */
  async getFleetPerformance(period: string = 'month'): Promise<ApiResponse<FleetPerformanceReport>> {
    try {
      const response = await vehicleApi.get<FleetPerformanceReport>(
        `${this.endpoint}/fleet-performance`,
        { period }
      );
      return response;
    } catch (error) {
      console.error('Error fetching fleet performance report:', error);
      return {
        data: {} as FleetPerformanceReport,
        success: false,
        error: 'Failed to fetch fleet performance report'
      };
    }
  }

  /**
   * Get fuel consumption analysis report
   * @param period - Time period for the report (default: 'month')
   */
  async getFuelConsumption(period: string = 'month'): Promise<ApiResponse<FuelConsumptionReport>> {
    try {
      const response = await vehicleApi.get<FuelConsumptionReport>(
        `${this.endpoint}/fuel-consumption`,
        { period }
      );
      return response;
    } catch (error) {
      console.error('Error fetching fuel consumption report:', error);
      return {
        data: {} as FuelConsumptionReport,
        success: false,
        error: 'Failed to fetch fuel consumption report'
      };
    }
  }

  /**
   * Get maintenance summary report
   * @param period - Time period for the report (default: 'month')
   */
  async getMaintenanceSummary(period: string = 'month'): Promise<ApiResponse<MaintenanceSummaryReport>> {
    try {
      const response = await vehicleApi.get<MaintenanceSummaryReport>(
        `${this.endpoint}/maintenance-summary`,
        { period }
      );
      return response;
    } catch (error) {
      console.error('Error fetching maintenance summary report:', error);
      return {
        data: {} as MaintenanceSummaryReport,
        success: false,
        error: 'Failed to fetch maintenance summary report'
      };
    }
  }

  /**
   * Get comprehensive fleet summary report
   */
  async getFleetSummary(): Promise<ApiResponse<FleetSummaryReport>> {
    try {
      const response = await vehicleApi.get<FleetSummaryReport>(
        `${this.endpoint}/summary`
      );
      return response;
    } catch (error) {
      console.error('Error fetching fleet summary report:', error);
      return {
        data: {} as FleetSummaryReport,
        success: false,
        error: 'Failed to fetch fleet summary report'
      };
    }
  }

  /**
   * Generate a report
   */
  async generateReport(reportType: string, period: string = 'month'): Promise<ApiResponse<GeneratedReport>> {
    try {
      const response = await vehicleApi.post<GeneratedReport>(
        `${this.endpoint}/generate/${reportType}?period=${period}`,
        {}
      );
      return response;
    } catch (error) {
      console.error('Error generating report:', error);
      return {
        data: {} as GeneratedReport,
        success: false,
        error: 'Failed to generate report'
      };
    }
  }

  /**
   * Get recent reports
   */
  async getRecentReports(): Promise<ApiResponse<GeneratedReport[]>> {
    try {
      const response = await vehicleApi.get<GeneratedReport[]>(
        `${this.endpoint}/recent`
      );
      return response;
    } catch (error) {
      console.error('Error fetching recent reports:', error);
      return {
        data: [],
        success: false,
        error: 'Failed to fetch recent reports'
      };
    }
  }

  /**
   * Download generated report
   */
  downloadGeneratedReport(id: number): void {
    window.open(`${API_CONFIG.VEHICLE_SERVICE_URL}${this.endpoint}/${id}/download`, '_blank');
  }

  /**
   * Download report as PDF
   * Note: Backend implementation needed for PDF generation
   * @deprecated Use downloadGeneratedReport instead
   */
  async downloadReport(reportType: string, period?: string): Promise<Blob | null> {
    try {
      // This will need backend implementation for PDF generation
      console.warn('PDF download not yet implemented in backend');
      return null;
    } catch (error) {
      console.error('Error downloading report:', error);
      return null;
    }
  }
}

export const reportsService = new ReportsService();
