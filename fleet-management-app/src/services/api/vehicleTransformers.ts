/**
 * Vehicle Data Transformers
 * 
 * Handles data transformation between frontend and backend formats.
 * Backend uses C# conventions (PascalCase, Guid, int status)
 * Frontend uses TypeScript conventions (camelCase, string IDs, string status)
 */

import type { Vehicle, VehicleFormState } from '@/types';

// Backend vehicle response type
export interface BackendVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  fuelType: string;
  currentMileage: number;
  fuelLevel: number;
  currentLocation?: string;
  currentDriver?: string;
  status: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Backend create request type
export interface BackendCreateVehicleRequest {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  fuelType: string;
  currentMileage: number;
}

// Backend update request type
export interface BackendUpdateVehicleRequest {
  make?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  color?: string;
  fuelType?: string;
  currentMileage?: number;
  fuelLevel?: number;
  currentLocation?: string;
  currentDriver?: string;
  status?: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
}

// Status mapping
const STATUS_TO_INT: Record<string, number> = {
  'idle': 0,
  'active': 1,
  'maintenance': 2,
  'offline': 3
};

const INT_TO_STATUS: Record<number, string> = {
  0: 'idle',
  1: 'active',
  2: 'maintenance',
  3: 'offline'
};

/**
 * Transform backend vehicle response to frontend Vehicle type
 */
export function transformBackendVehicle(backendVehicle: BackendVehicle): Vehicle {
  return {
    id: backendVehicle.id,
    make: backendVehicle.make,
    model: backendVehicle.model,
    year: backendVehicle.year,
    license: backendVehicle.licensePlate,
    status: (INT_TO_STATUS[backendVehicle.status] || 'idle') as Vehicle['status'],
    driver: backendVehicle.currentDriver || 'Unassigned',
    location: backendVehicle.currentLocation || 'Unknown',
    fuelLevel: Math.round(backendVehicle.fuelLevel),
    lastMaintenance: backendVehicle.lastMaintenanceDate 
      ? new Date(backendVehicle.lastMaintenanceDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    nextMaintenance: backendVehicle.nextMaintenanceDate
      ? new Date(backendVehicle.nextMaintenanceDate).toISOString().split('T')[0]
      : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    mileage: Math.round(backendVehicle.currentMileage),
    color: backendVehicle.color,
    fuelType: backendVehicle.fuelType as Vehicle['fuelType']
  };
}

/**
 * Transform frontend VehicleFormState to backend create request
 */
export function transformToCreateRequest(formData: VehicleFormState): BackendCreateVehicleRequest {
  return {
    make: formData.make,
    model: formData.model,
    year: parseInt(formData.year),
    licensePlate: formData.license,
    color: formData.color,
    fuelType: formData.fuelType,
    currentMileage: parseInt(formData.mileage)
  };
}

/**
 * Transform frontend Vehicle partial update to backend update request
 */
export function transformToUpdateRequest(vehicle: Partial<Vehicle>): BackendUpdateVehicleRequest {
  const request: BackendUpdateVehicleRequest = {};

  if (vehicle.make) request.make = vehicle.make;
  if (vehicle.model) request.model = vehicle.model;
  if (vehicle.year) request.year = vehicle.year;
  if (vehicle.license) request.licensePlate = vehicle.license;
  if (vehicle.color) request.color = vehicle.color;
  if (vehicle.fuelType) request.fuelType = vehicle.fuelType;
  if (vehicle.mileage !== undefined) request.currentMileage = vehicle.mileage;
  if (vehicle.fuelLevel !== undefined) request.fuelLevel = vehicle.fuelLevel;
  if (vehicle.location) request.currentLocation = vehicle.location;
  if (vehicle.driver) request.currentDriver = vehicle.driver;
  if (vehicle.status) request.status = STATUS_TO_INT[vehicle.status];
  if (vehicle.lastMaintenance) request.lastMaintenanceDate = vehicle.lastMaintenance;
  if (vehicle.nextMaintenance) request.nextMaintenanceDate = vehicle.nextMaintenance;

  return request;
}

/**
 * Generate a frontend-friendly vehicle ID from backend GUID
 */
export function formatVehicleId(guid: string): string {
  // Take first 8 characters of GUID and format as VH-XXXX
  const shortId = guid.substring(0, 8).toUpperCase();
  return `VH-${shortId}`;
}

/**
 * Transform an array of backend vehicles
 */
export function transformBackendVehicles(backendVehicles: BackendVehicle[]): Vehicle[] {
  return backendVehicles.map(transformBackendVehicle);
}

