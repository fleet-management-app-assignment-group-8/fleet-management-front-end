/**
 * Vehicle API Service
 * 
 * Handles all vehicle-related API calls to the Vehicle Service backend.
 */

import type { Vehicle, VehicleFormState } from '@/types';
import { vehicleApi, type ApiResponse } from './baseApi';
import {
  transformBackendVehicle,
  transformBackendVehicles,
  transformToCreateRequest,
  transformToUpdateRequest,
  type BackendVehicle
} from './vehicleTransformers';

class VehicleService {
  private readonly endpoint = '/api/vehicles';

  /**
   * Get all vehicles, optionally filtered by status
   */
  async getAll(statusFilter?: string): Promise<ApiResponse<Vehicle[]>> {
    try {
      const params: Record<string, string> = {};
      
      // Map frontend status string to backend status int
      if (statusFilter && statusFilter !== 'all') {
        const statusMap: Record<string, string> = {
          'idle': '0',
          'active': '1',
          'maintenance': '2',
          'offline': '3'
        };
        if (statusMap[statusFilter]) {
          params.status = statusMap[statusFilter];
        }
      }

      const response = await vehicleApi.get<BackendVehicle[]>(
        this.endpoint,
        Object.keys(params).length > 0 ? params : undefined
      );

      if (response.success && response.data) {
        const transformedVehicles = transformBackendVehicles(response.data);
        return {
          ...response,
          data: transformedVehicles
        };
      }

      return response as unknown as ApiResponse<Vehicle[]>;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      return {
        data: [],
        success: false,
        error: 'Failed to fetch vehicles'
      };
    }
  }

  /**
   * Get vehicle by ID
   */
  async getById(id: string): Promise<ApiResponse<Vehicle>> {
    try {
      const response = await vehicleApi.get<BackendVehicle>(`${this.endpoint}/${id}`);

      if (response.success && response.data) {
        const transformedVehicle = transformBackendVehicle(response.data);
        return {
          ...response,
          data: transformedVehicle
        };
      }

      return response as unknown as ApiResponse<Vehicle>;
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      return {
        data: {} as Vehicle,
        success: false,
        error: 'Failed to fetch vehicle'
      };
    }
  }

  /**
   * Create new vehicle
   */
  async create(vehicleData: VehicleFormState): Promise<ApiResponse<Vehicle>> {
    try {
      const createRequest = transformToCreateRequest(vehicleData);
      const response = await vehicleApi.post<BackendVehicle>(this.endpoint, createRequest);

      if (response.success && response.data) {
        const transformedVehicle = transformBackendVehicle(response.data);
        return {
          ...response,
          data: transformedVehicle,
          message: 'Vehicle created successfully'
        };
      }

      return response as unknown as ApiResponse<Vehicle>;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      return {
        data: {} as Vehicle,
        success: false,
        error: 'Failed to create vehicle'
      };
    }
  }

  /**
   * Update vehicle
   */
  async update(id: string, vehicleData: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> {
    try {
      const updateRequest = transformToUpdateRequest(vehicleData);
      const response = await vehicleApi.put<BackendVehicle>(`${this.endpoint}/${id}`, updateRequest);

      if (response.success && response.data) {
        const transformedVehicle = transformBackendVehicle(response.data);
        return {
          ...response,
          data: transformedVehicle,
          message: 'Vehicle updated successfully'
        };
      }

      return response as unknown as ApiResponse<Vehicle>;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      return {
        data: {} as Vehicle,
        success: false,
        error: 'Failed to update vehicle'
      };
    }
  }

  /**
   * Delete vehicle
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await vehicleApi.delete<void>(`${this.endpoint}/${id}`);
      return {
        ...response,
        message: response.success ? 'Vehicle deleted successfully' : response.error
      };
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      return {
        data: undefined as void,
        success: false,
        error: 'Failed to delete vehicle'
      };
    }
  }

  /**
   * Assign driver to vehicle
   */
  async assignDriver(vehicleId: string, driverId: string): Promise<ApiResponse<any>> {
    try {
      // Find vehicle by license plate if vehicleId looks like a license plate (e.g. VH-XXXX or simple string)
      // Ideally we should use the internal ID, but the frontend might be passing license plate or formatted ID.
      // The backend expects a GUID for vehicleId.
      // If the frontend passed a vehicle object, we should use its ID.
      
      // We'll assume vehicleId passed here is the ID. If it's a license plate, we might need to look it up first.
      // But let's assume the caller passes the correct ID.
      
      const response = await vehicleApi.post<any>(
        `${this.endpoint}/${vehicleId}/assign-driver`,
        { driverId }
      );
      return response;
    } catch (error) {
      console.error('Error assigning driver:', error);
      return {
        data: null,
        success: false,
        error: 'Failed to assign driver'
      };
    }
  }

  /**
   * Unassign driver from vehicle
   */
  async unassignDriver(vehicleId: string): Promise<ApiResponse<any>> {
    try {
      const response = await vehicleApi.post<any>(
        `${this.endpoint}/${vehicleId}/unassign-driver`,
        {}
      );
      return response;
    } catch (error) {
      console.error('Error unassigning driver:', error);
      return {
        data: null,
        success: false,
        error: 'Failed to unassign driver'
      };
    }
  }

  /**
   * Get vehicles by status (convenience method)
   */
  async getByStatus(status: string): Promise<ApiResponse<Vehicle[]>> {
    return this.getAll(status);
  }

  /**
   * Get vehicle statistics for dashboard
   */
  async getStatistics(): Promise<ApiResponse<any>> {
    try {
      const response = await vehicleApi.get<any>(`${this.endpoint}/statistics`);
      return response;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return {
        data: null,
        success: false,
        error: 'Failed to fetch statistics'
      };
    }
  }

  /**
   * Get fuel data for all vehicles
   */
  async getFuelData(statusFilter?: string): Promise<ApiResponse<any[]>> {
    try {
      const params: Record<string, string> = {};
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await vehicleApi.get<any[]>(
        `${this.endpoint}/fuel`,
        Object.keys(params).length > 0 ? params : undefined
      );
      return response;
    } catch (error) {
      console.error('Error fetching fuel data:', error);
      return {
        data: [],
        success: false,
        error: 'Failed to fetch fuel data'
      };
    }
  }

  /**
   * Get low fuel vehicles
   */
  async getLowFuelVehicles(threshold: number = 25): Promise<ApiResponse<Vehicle[]>> {
    try {
      const response = await vehicleApi.get<BackendVehicle[]>(
        `${this.endpoint}/low-fuel`,
        { threshold: threshold.toString() }
      );

      if (response.success && response.data) {
        const transformedVehicles = transformBackendVehicles(response.data);
        return {
          ...response,
          data: transformedVehicles
        };
      }

      return response as unknown as ApiResponse<Vehicle[]>;
    } catch (error) {
      console.error('Error fetching low fuel vehicles:', error);
      return {
        data: [],
        success: false,
        error: 'Failed to fetch low fuel vehicles'
      };
    }
  }
}

export const vehicleService = new VehicleService();

