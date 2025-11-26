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
  id?: string;
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

// New Types
export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string[];
  status: 'available' | 'busy' | 'off-duty';
  rating: number;
  completed_jobs: number;
  active_jobs: number;
  certifications: string[];
  hourly_rate: number;
  join_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface TechnicianCreateData {
  name: string;
  email: string;
  phone: string;
  specialization?: string[];
  status?: string;
  certifications?: string[];
  hourly_rate: number;
  join_date?: string;
}

export interface TechnicianUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  specialization?: string[];
  status?: string;
  rating?: number;
  completed_jobs?: number;
  active_jobs?: number;
  certifications?: string[];
  hourly_rate?: number;
}

export interface Part {
  id: string;
  name: string;
  part_number: string;
  category: string;
  quantity: number;
  min_quantity: number;
  unit_cost: number;
  supplier: string;
  location: string;
  last_restocked?: string;
  used_in: string[];
  created_at?: string;
  updated_at?: string;
}

export interface PartCreateData {
  name: string;
  part_number: string;
  category: string;
  quantity: number;
  min_quantity: number;
  unit_cost: number;
  supplier?: string;
  location?: string;
  used_in?: string[];
}

export interface PartUpdateData {
  name?: string;
  part_number?: string;
  category?: string;
  quantity?: number;
  min_quantity?: number;
  unit_cost?: number;
  supplier?: string;
  location?: string;
  used_in?: string[];
}

export interface RecurringSchedule {
  id: string;
  name: string;
  vehicle_id: string;
  maintenance_type: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'mileage-based';
  frequency_value: number;
  estimated_cost: number;
  estimated_duration: number;
  assigned_to: string;
  is_active: boolean;
  last_executed?: string;
  next_scheduled?: string;
  total_executions: number;
  created_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface RecurringScheduleCreateData {
  name: string;
  vehicle_id: string;
  maintenance_type: string;
  description?: string;
  frequency: string;
  frequency_value: number;
  estimated_cost?: number;
  estimated_duration?: number;
  assigned_to?: string;
  is_active?: boolean;
}

export interface RecurringScheduleUpdateData {
  name?: string;
  description?: string;
  frequency?: string;
  frequency_value?: number;
  estimated_cost?: number;
  estimated_duration?: number;
  assigned_to?: string;
  is_active?: boolean;
  last_executed?: string;
  next_scheduled?: string;
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

      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
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

      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
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

      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
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

      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
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
      return this.handleError(error);
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

      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
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

      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
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

      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get maintenance items by vehicle ID
   */
  async getByVehicle(vehicleId: string): Promise<ApiResponse<MaintenanceItem[]>> {
    try {
      const response = await this.getAll({ vehicle: vehicleId }, 1, 100);
      if (response.success && response.data) {
        return {
          data: response.data.items,
          success: true,
        };
      }
      return response as any;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get overdue maintenance items
   */
  async getOverdue(): Promise<ApiResponse<MaintenanceItem[]>> {
    try {
      const url = `${this.baseUrl}${this.endpoint}/overdue`;
      const response = await fetch(url);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get upcoming maintenance (due soon + scheduled)
   */
  async getUpcoming(): Promise<ApiResponse<MaintenanceItem[]>> {
    try {
      const url = `${this.baseUrl}${this.endpoint}/upcoming`;
      const response = await fetch(url);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Complete a maintenance item
   */
  async complete(itemId: string, actualCost?: number, notes?: string): Promise<ApiResponse<MaintenanceItem>> {
    const updateData: MaintenanceUpdateData = {
      status: 'completed',
      completed_date: new Date().toISOString(),
      actual_cost: actualCost,
      notes: notes,
    };
    return this.update(itemId, updateData);
  }

  /**
   * Cancel a maintenance item
   */
  async cancel(itemId: string, reason?: string): Promise<ApiResponse<MaintenanceItem>> {
    const updateData: MaintenanceUpdateData = {
      status: 'cancelled',
      notes: reason,
    };
    return this.update(itemId, updateData);
  }

  /**
   * Start maintenance (set to in_progress)
   */
  async start(itemId: string): Promise<ApiResponse<MaintenanceItem>> {
    const updateData: MaintenanceUpdateData = {
      status: 'in_progress',
      scheduled_date: new Date().toISOString(),
    };
    return this.update(itemId, updateData);
  }

  /**
   * Get maintenance cost analysis
   */
  async getCostAnalysis(): Promise<ApiResponse<{
    total_estimated: number;
    total_actual: number;
    variance: number;
    variance_percent: number;
    by_vehicle: Record<string, { estimated: number; actual: number; variance: number }>;
    by_type: Record<string, { estimated: number; actual: number; count: number }>;
    completed_count: number;
    pending_count: number;
  }>> {
    try {
      const url = `${this.baseUrl}${this.endpoint}/analytics/costs`;
      const response = await fetch(url);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get maintenance trends
   */
  async getTrends(period: string = 'month', limit: number = 6): Promise<ApiResponse<any>> {
    try {
      const url = new URL(`${this.baseUrl}${this.endpoint}/analytics/trends`);
      url.searchParams.append('period', period);
      url.searchParams.append('limit', limit.toString());
      const response = await fetch(url.toString());
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Search maintenance items
   */
  async search(query: string): Promise<ApiResponse<MaintenanceItem[]>> {
    try {
      const url = new URL(`${this.baseUrl}${this.endpoint}/search`);
      url.searchParams.append('q', query);
      const response = await fetch(url.toString());
      
      const result = await this.handleResponse<PaginatedMaintenanceResponse>(response);
      if (result.success && result.data) {
        return {
          data: result.data.items,
          success: true
        };
      }
      return { data: null as any, success: false, error: result.error };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== Technician Methods ====================
  async getTechnicians(): Promise<ApiResponse<Technician[]>> {
    try {
      const url = `${this.baseUrl}${this.endpoint}/technicians`;
      const response = await fetch(url);
      return this.handleResponse<Technician[]>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createTechnician(data: TechnicianCreateData): Promise<ApiResponse<Technician>> {
    try {
      const url = `${this.baseUrl}${this.endpoint}/technicians`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return this.handleResponse<Technician>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateTechnician(id: string, data: TechnicianUpdateData): Promise<ApiResponse<Technician>> {
    try {
      const url = `${this.baseUrl}${this.endpoint}/technicians/${id}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return this.handleResponse<Technician>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteTechnician(id: string): Promise<ApiResponse<void>> {
    try {
      const url = `${this.baseUrl}${this.endpoint}/technicians/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
      });
      return this.handleResponse<void>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== Part Methods ====================
  async getParts(query?: string): Promise<ApiResponse<Part[]>> {
    try {
      const url = new URL(`${this.baseUrl}${this.endpoint}/parts`);
      if (query) url.searchParams.append('q', query);
      const response = await fetch(url.toString());
      return this.handleResponse<Part[]>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createPart(data: PartCreateData): Promise<ApiResponse<Part>> {
    try {
      const url = `${this.baseUrl}${this.endpoint}/parts`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return this.handleResponse<Part>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updatePart(id: string, data: PartUpdateData): Promise<ApiResponse<Part>> {
    try {
      const url = `${this.baseUrl}${this.endpoint}/parts/${id}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return this.handleResponse<Part>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deletePart(id: string): Promise<ApiResponse<void>> {
    try {
      const url = `${this.baseUrl}${this.endpoint}/parts/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
      });
      return this.handleResponse<void>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== Recurring Schedule Methods ====================
  async getRecurringSchedules(): Promise<ApiResponse<RecurringSchedule[]>> {
    try {
      const url = `${this.baseUrl}${this.endpoint}/recurring-schedules`;
      const response = await fetch(url);
      return this.handleResponse<RecurringSchedule[]>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createRecurringSchedule(data: RecurringScheduleCreateData): Promise<ApiResponse<RecurringSchedule>> {
    try {
      const url = `${this.baseUrl}${this.endpoint}/recurring-schedules`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return this.handleResponse<RecurringSchedule>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateRecurringSchedule(id: string, data: RecurringScheduleUpdateData): Promise<ApiResponse<RecurringSchedule>> {
    try {
      const url = `${this.baseUrl}${this.endpoint}/recurring-schedules/${id}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return this.handleResponse<RecurringSchedule>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteRecurringSchedule(id: string): Promise<ApiResponse<void>> {
    try {
      const url = `${this.baseUrl}${this.endpoint}/recurring-schedules/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
      });
      return this.handleResponse<void>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Helper methods to reduce redundancy
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
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
  }

  private handleError<T>(error: unknown): ApiResponse<T> {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return {
      data: null as T,
      success: false,
      error: message,
    };
  }
}

export const maintenanceService = new MaintenanceService();
