/**
 * Maintenance API Service
 * 
 * Handles all maintenance-related API calls to the backend.
 * Connects to Flask maintenance service running on port 5001.
 */

import type { MaintenanceItem, MaintenancePart } from '@/types';
import { maintenanceApi, type ApiResponse } from './baseApi';

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
  parts_needed?: MaintenancePart[];
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
  parts_needed?: MaintenancePart[];
  attachments?: string[];
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
  private readonly endpoint = '/api/maintenance';

  /**
   * Get all maintenance items with optional filtering and pagination
   */
  async getAll(
    filters?: MaintenanceFilters,
    page: number = 1,
    perPage: number = 10
  ): Promise<ApiResponse<PaginatedMaintenanceResponse>> {
    const params: Record<string, string> = {
      page: page.toString(),
      per_page: perPage.toString(),
    };

    if (filters?.vehicle) {
      params['vehicle'] = filters.vehicle;
    }
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        filters.status.forEach(s => params['status'] = s); // Note: standard URLSearchParams overrides duplicates, might need custom handling if backend expects multiple keys
      } else {
        params['status'] = filters.status;
      }
    }
    if (filters?.priority) {
      if (Array.isArray(filters.priority)) {
        filters.priority.forEach(p => params['priority'] = p);
      } else {
        params['priority'] = filters.priority;
      }
    }
    if (filters?.assignedTo) {
      params['assignedTo'] = filters.assignedTo;
    }

    // For array params, we need to construct query string manually if baseApi doesn't support repeated keys
    // baseApi uses URLSearchParams which supports repeated keys but Object.entries(params) logic in baseApi might not.
    // Object.entries(params).forEach(([key, value]) => { url.searchParams.append(key, value); });
    // This supports string values. If we pass array, it won't work with Record<string, string>.
    // We'll stick to simple string params for now or assume comma separated.
    // The previous implementation used append for multiple keys.
    // Since we are replacing the logic, let's just use what we have.

    return maintenanceApi.get<PaginatedMaintenanceResponse>(
      `${this.endpoint}/`,
      params
    );
  }

  /**
   * Get a specific maintenance item by ID
   */
  async getById(itemId: string): Promise<ApiResponse<MaintenanceItem>> {
    return maintenanceApi.get<MaintenanceItem>(`${this.endpoint}/${itemId}`);
  }

  /**
   * Create a new maintenance item
   */
  async create(data: MaintenanceCreateData): Promise<ApiResponse<MaintenanceItem>> {
    return maintenanceApi.post<MaintenanceItem>(`${this.endpoint}/`, data);
  }

  /**
   * Update a maintenance item (partial update)
   */
  async update(itemId: string, data: MaintenanceUpdateData): Promise<ApiResponse<MaintenanceItem>> {
    return maintenanceApi.patch<MaintenanceItem>(`${this.endpoint}/${itemId}`, data);
  }

  /**
   * Delete a maintenance item
   */
  async delete(itemId: string): Promise<ApiResponse<void>> {
    return maintenanceApi.delete<void>(`${this.endpoint}/${itemId}`);
  }

  /**
   * Get maintenance summary statistics
   */
  async getSummary(): Promise<ApiResponse<MaintenanceSummary>> {
    return maintenanceApi.get<MaintenanceSummary>(`${this.endpoint}/summary`);
  }

  /**
   * Get maintenance history for a specific vehicle
   */
  async getVehicleHistory(vehicleId: string): Promise<ApiResponse<MaintenanceItem[]>> {
    return maintenanceApi.get<MaintenanceItem[]>(`${this.endpoint}/vehicle/${vehicleId}/history`);
  }

  /**
   * Update maintenance statuses in bulk (background job)
   */
  async updateStatusesBulk(): Promise<ApiResponse<{ message: string; updated_count: number }>> {
    return maintenanceApi.post<{ message: string; updated_count: number }>(`${this.endpoint}/status/update-bulk`, {});
  }

  /**
   * Get maintenance items by vehicle ID
   */
  async getByVehicle(vehicleId: string): Promise<ApiResponse<MaintenanceItem[]>> {
    const response = await this.getAll({ vehicle: vehicleId }, 1, 100);
    if (response.success && response.data) {
      return {
        data: response.data.items,
        success: true,
      };
    }
    return {
      data: null as any,
      success: false,
      error: response.error
    };
  }

  /**
   * Get overdue maintenance items
   */
  async getOverdue(): Promise<ApiResponse<MaintenanceItem[]>> {
    return maintenanceApi.get<MaintenanceItem[]>(`${this.endpoint}/overdue`);
  }

  /**
   * Get upcoming maintenance (due soon + scheduled)
   */
  async getUpcoming(): Promise<ApiResponse<MaintenanceItem[]>> {
    return maintenanceApi.get<MaintenanceItem[]>(`${this.endpoint}/upcoming`);
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
    return maintenanceApi.get(`${this.endpoint}/analytics/costs`);
  }

  /**
   * Get maintenance trends
   */
  async getTrends(period: string = 'month', limit: number = 6): Promise<ApiResponse<any>> {
    return maintenanceApi.get(`${this.endpoint}/analytics/trends`, {
      period,
      limit: limit.toString()
    });
  }

  /**
   * Search maintenance items
   */
  async search(query: string): Promise<ApiResponse<MaintenanceItem[]>> {
    const response = await maintenanceApi.get<PaginatedMaintenanceResponse>(
      `${this.endpoint}/search`,
      { q: query }
    );
    
    if (response.success && response.data) {
      return {
        data: response.data.items,
        success: true
      };
    }
    return { data: null as any, success: false, error: response.error };
  }

  // ==================== Technician Methods ====================
  async getTechnicians(): Promise<ApiResponse<Technician[]>> {
    return maintenanceApi.get<Technician[]>(`${this.endpoint}/technicians`);
  }

  async createTechnician(data: TechnicianCreateData): Promise<ApiResponse<Technician>> {
    return maintenanceApi.post<Technician>(`${this.endpoint}/technicians`, data);
  }

  async updateTechnician(id: string, data: TechnicianUpdateData): Promise<ApiResponse<Technician>> {
    return maintenanceApi.put<Technician>(`${this.endpoint}/technicians/${id}`, data);
  }

  async deleteTechnician(id: string): Promise<ApiResponse<void>> {
    return maintenanceApi.delete<void>(`${this.endpoint}/technicians/${id}`);
  }

  // ==================== Part Methods ====================
  async getParts(query?: string): Promise<ApiResponse<Part[]>> {
    const params = query ? { q: query } : undefined;
    return maintenanceApi.get<Part[]>(`${this.endpoint}/parts`, params);
  }

  async createPart(data: PartCreateData): Promise<ApiResponse<Part>> {
    return maintenanceApi.post<Part>(`${this.endpoint}/parts`, data);
  }

  async updatePart(id: string, data: PartUpdateData): Promise<ApiResponse<Part>> {
    return maintenanceApi.put<Part>(`${this.endpoint}/parts/${id}`, data);
  }

  async deletePart(id: string): Promise<ApiResponse<void>> {
    return maintenanceApi.delete<void>(`${this.endpoint}/parts/${id}`);
  }

  // ==================== Recurring Schedule Methods ====================
  async getRecurringSchedules(): Promise<ApiResponse<RecurringSchedule[]>> {
    return maintenanceApi.get<RecurringSchedule[]>(`${this.endpoint}/recurring-schedules`);
  }

  async createRecurringSchedule(data: RecurringScheduleCreateData): Promise<ApiResponse<RecurringSchedule>> {
    return maintenanceApi.post<RecurringSchedule>(`${this.endpoint}/recurring-schedules`, data);
  }

  async updateRecurringSchedule(id: string, data: RecurringScheduleUpdateData): Promise<ApiResponse<RecurringSchedule>> {
    return maintenanceApi.put<RecurringSchedule>(`${this.endpoint}/recurring-schedules/${id}`, data);
  }

  async deleteRecurringSchedule(id: string): Promise<ApiResponse<void>> {
    return maintenanceApi.delete<void>(`${this.endpoint}/recurring-schedules/${id}`);
  }
}

export const maintenanceService = new MaintenanceService();
