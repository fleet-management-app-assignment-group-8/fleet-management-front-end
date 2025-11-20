/**
 * API Services barrel export
 * 
 * Centralized export point for all API services
 */

export { baseApi, API_CONFIG } from './baseApi';
export type { ApiResponse, ApiError } from './baseApi';

export { vehicleService } from './vehicleService';
export { driverService } from './driverService';
export { maintenanceService } from './maintenanceService';
export type { 
  MaintenanceSummary, 
  PaginatedMaintenanceResponse, 
  MaintenanceFilters,
  MaintenanceCreateData,
  MaintenanceUpdateData 
} from './maintenanceService';

// TODO: Add more services as needed:
// export { tripService } from './tripService';
// export { fuelService } from './fuelService';
// export { userService } from './userService';
// export { analyticsService } from './analyticsService';

