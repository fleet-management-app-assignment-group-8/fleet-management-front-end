/**
 * Driver API Service
 * 
 * Handles all driver-related API calls to the Java Spring Boot backend (port 6001).
 * Implements full CRUD operations for drivers with backend integration.
 */

import type { Driver, DriverFormState } from '@/types';
import { driverApi, type ApiResponse } from './baseApi';

class DriverService {
  private readonly endpoint = '/api/drivers';

  /**
   * Get all drivers
   * GET /api/drivers/list
   */
  async getAll(): Promise<ApiResponse<Driver[]>> {
    try {
      return await driverApi.get<Driver[]>(`${this.endpoint}/list`);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
      return {
        data: [] as Driver[],
        success: false,
        error: 'Failed to fetch drivers'
      };
    }
  }

  /**
   * Get driver by ID
   * GET /api/drivers/{id}
   */
  async getById(id: number | string): Promise<ApiResponse<Driver>> {
    try {
      return await driverApi.get<Driver>(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Failed to fetch driver ${id}:`, error);
      return {
        data: {} as Driver,
        success: false,
        error: 'Failed to fetch driver'
      };
    }
  }

  /**
   * Create new driver
   * POST /api/drivers
   */
  async create(driverData: DriverFormState): Promise<ApiResponse<string>> {
    try {
      // Transform frontend data to backend DTO format
      const backendData = {
        fullName: driverData.fullName || driverData.name,
        email: driverData.email,
        phone: driverData.phone,
        licenseNumber: driverData.licenseNumber,
        expiryDate: driverData.expiryDate || driverData.licenseExpiry
      };
      
      console.log('Sending driver creation payload:', backendData);
      
      const response = await driverApi.post<{ message: string }>(this.endpoint, backendData);
      
      console.log('Received driver creation response:', response);
      
      // Map the object response back to a string for the frontend
      return {
        ...response,
        data: response.data?.message || 'Driver created successfully'
      };
    } catch (error) {
      console.error('Failed to create driver:', error);
      return {
        data: '' as string,
        success: false,
        error: 'Failed to create driver'
      };
    }
  }

  /**
   * Update driver
   * PUT /api/drivers/{id}
   */
  async update(id: number | string, driverData: Partial<Driver>): Promise<ApiResponse<Driver>> {
    try {
      // Transform frontend data to backend DTO format
      const backendData = {
        fullName: driverData.fullName || driverData.name,
        email: driverData.email,
        phone: driverData.phone,
        licenseNumber: driverData.licenseNumber,
        expiryDate: driverData.expiryDate || driverData.licenseExpiry
      };
      
      return await driverApi.put<Driver>(`${this.endpoint}/${id}`, backendData);
    } catch (error) {
      console.error(`Failed to update driver ${id}:`, error);
      return {
        data: {} as Driver,
        success: false,
        error: 'Failed to update driver'
      };
    }
  }

  /**
   * Delete driver
   * DELETE /api/drivers/{id}
   */
  async delete(id: number | string): Promise<ApiResponse<string>> {
    try {
      const response = await driverApi.delete<{ message: string }>(`${this.endpoint}/${id}`);
      return {
        ...response,
        data: response.data?.message || 'Driver deleted successfully'
      };
    } catch (error) {
      console.error(`Failed to delete driver ${id}:`, error);
      return {
        data: '' as string,
        success: false,
        error: 'Failed to delete driver'
      };
    }
  }

  /**
   * Transform backend driver data to frontend format
   */
  transformDriver(backendDriver: Driver): Driver {
    return {
      ...backendDriver,
      id: backendDriver.driverId?.toString() || backendDriver.id || '',
      name: backendDriver.fullName || backendDriver.name || 'Unknown Driver',
      licenseExpiry: backendDriver.expiryDate || backendDriver.licenseExpiry || '',
      // Preserve frontend-only fields if they exist
      status: backendDriver.status || 'off-duty',
      vehicle: backendDriver.vehicle || 'Unassigned',
      rating: backendDriver.starRating || backendDriver.rating || 0,
      totalTrips: backendDriver.tripCount || backendDriver.totalTrips || 0,
      hoursThisWeek: backendDriver.hoursThisWeek || 0,
      joinDate: backendDriver.joinDate || new Date().toISOString().split('T')[0]
    };
  }

  /**
   * Transform array of backend drivers to frontend format
   */
  transformDrivers(backendDrivers: Driver[]): Driver[] {
    return backendDrivers.map(driver => this.transformDriver(driver));
  }
}

export const driverService = new DriverService();

