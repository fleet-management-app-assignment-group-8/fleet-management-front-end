/**
 * Maintenance API Service
 * 
 * Handles all maintenance-related API calls to the backend.
 * Connects to Flask maintenance service running on port 5001.
 */

import type { MaintenanceItem } from '@/types';
import { baseApi, type ApiResponse } from './baseApi';

export interface MaintenanceSummary {
  total_items: number;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  total_estimated_cost: number;
  total_actual_cost: number;
  overdue_count: number;
  due_soon_count: number;
}

export interface PaginatedMaintenanceResponse {
  items: MaintenanceItem[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface MaintenanceFilters {
  vehicle?: string;
  status?: string | string[];
  priority?: string | string[];
  assignedTo?: string;
}

export interface MaintenanceCreateData {
  id: string;
  vehicle_id: string;
  type: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date: string;
  current_mileage: number;
  due_mileage: number;
  estimated_cost?: number;
  assigned_to?: string;
  assigned_technician?: string;
  notes?: string;
}

export interface MaintenanceUpdateData {
  type?: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  scheduled_date?: string;
  completed_date?: string;
  current_mileage?: number;
  due_mileage?: number;
  estimated_cost?: number;
  actual_cost?: number;
  assigned_to?: string;
  assigned_technician?: string;
  notes?: string;
  parts_needed?: any;
  attachments?: any;
}

class MaintenanceService {
  private readonly baseUrl: string;
  private readonly endpoint = '/maintenance';

  constructor() {
    // Use maintenance service specific URL
    this.baseUrl = process.env.NEXT_PUBLIC_MAINTENANCE_API_URL || 'http://localhost:5001/api';
  }

  /**
   * Get all maintenance items with optional filtering and pagination
   */
  async getAll(
    filters?: MaintenanceFilters,
    page: number = 1,
    perPage: number = 10
  ): Promise<ApiResponse<PaginatedMaintenanceResponse>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
      });

      if (filters?.vehicle) {
        params.append('vehicle', filters.vehicle);
      }
      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          filters.status.forEach(s => params.append('status', s));
        } else {
          params.append('status', filters.status);
        }
      }
      if (filters?.priority) {
        if (Array.isArray(filters.priority)) {
          filters.priority.forEach(p => params.append('priority', p));
        } else {
          params.append('priority', filters.priority);
        }
      }
      if (filters?.assignedTo) {
        params.append('assignedTo', filters.assignedTo);
      }

      const url = `${this.baseUrl}${this.endpoint}?${params.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: null as any,
          success: false,
          error: errorData.message || `HTTP Error: ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        data,
        success: true,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch maintenance items';
      return {
        data: null as any,
        success: false,
        error: message,
      };
    }
  }

  /**
   * Get a specific maintenance item by ID
   */
  async getById(itemId: string): Promise<ApiResponse<MaintenanceItem>> {
    try {
      const url = `${this.baseUrl}${this.endpoint}/${itemId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: null as any,
          success: false,
          error: errorData.message || `HTTP Error: ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        data,
        success: true,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch maintenance item';
      return {
        data: null as any,
        success: false,
        error: message,
      };
    }
  }

  /**
   * Create a new maintenance item
   */
  async create(data: MaintenanceCreateData): Promise<ApiResponse<MaintenanceItem>> {
    try {
      const url = `${this.baseUrl}${this.endpoint}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: null as any,
          success: false,
          error: errorData.message || `HTTP Error: ${response.status}`,
        };
      }

      const responseData = await response.json();
      return {
        data: responseData,
        success: true,
        message: 'Maintenance item created successfully',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create maintenance item';
      return {
        data: null as any,
        success: false,
        error: message,
      };
    }
  }

  /**
   * Update a maintenance item (partial update)
   */
  async update(itemId: string, data: MaintenanceUpdateData): Promise<ApiResponse<MaintenanceItem>> {
    try {
      const url = `${this.baseUrl}${this.endpoint}/${itemId}`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: null as any,
          success: false,
          error: errorData.message || `HTTP Error: ${response.status}`,
        };
      }

      const responseData = await response.json();
      return {
        data: responseData,
        success: true,
        message: 'Maintenance item updated successfully',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update maintenance item';
      return {
        data: null as any,
        success: false,
        error: message,
      };
    }
  }

  /**
   * Delete a maintenance item
   */
  async delete(itemId: string): Promise<ApiResponse<void>> {
    try {
      const url = `${this.baseUrl}${this.endpoint}/${itemId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: undefined as void,
          success: false,
          error: errorData.message || `HTTP Error: ${response.status}`,
        };
      }

      return {
        data: undefined as void,
        success: true,
        message: 'Maintenance item deleted successfully',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete maintenance item';
      return {
        data: undefined as void,
        success: false,
        error: message,
      };
    }
  }

  /**
   * Get maintenance summary statistics
   */
  async getSummary(): Promise<ApiResponse<MaintenanceSummary>> {
    try {
      const url = `${this.baseUrl}${this.endpoint}/summary`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: null as any,
          success: false,
          error: errorData.message || `HTTP Error: ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        data,
        success: true,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch maintenance summary';
      return {
        data: null as any,
        success: false,
        error: message,
      };
    }
  }

  /**
   * Get maintenance history for a specific vehicle
   */
  async getVehicleHistory(vehicleId: string): Promise<ApiResponse<MaintenanceItem[]>> {
    try {
      const url = `${this.baseUrl}${this.endpoint}/vehicle/${vehicleId}/history`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: null as any,
          success: false,
          error: errorData.message || `HTTP Error: ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        data,
        success: true,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch vehicle history';
      return {
        data: null as any,
        success: false,
        error: message,
      };
    }
  }

  /**
   * Update maintenance statuses in bulk (background job)
   */
  async updateStatusesBulk(): Promise<ApiResponse<{ message: string; updated_count: number }>> {
    try {
      const url = `${this.baseUrl}${this.endpoint}/status/update-bulk`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: null as any,
          success: false,
          error: errorData.message || `HTTP Error: ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        data,
        success: true,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update statuses';
      return {
        data: null as any,
        success: false,
        error: message,
      };
    }
  }
}

export const maintenanceService = new MaintenanceService();

