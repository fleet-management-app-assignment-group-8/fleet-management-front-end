import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { vehicleApi, maintenanceApi, driverApi } from '@/services/api/baseApi';

/**
 * Hook to automatically configure API clients with authentication token
 * Call this in components that make API calls to ensure token is set
 */
export function useAuthenticatedApi() {
  const { accessToken } = useAuth();

  useEffect(() => {
    if (accessToken) {
      // Set token for all API clients
      vehicleApi.setAuthToken(accessToken);
      maintenanceApi.setAuthToken(accessToken);
      driverApi.setAuthToken(accessToken);
    } else {
      // Clear tokens if not authenticated
      vehicleApi.clearAuthToken();
      maintenanceApi.clearAuthToken();
      driverApi.clearAuthToken();
    }
  }, [accessToken]);

  return { accessToken };
}

