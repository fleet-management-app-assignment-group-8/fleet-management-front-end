/**
 * Base API Service
 * 
 * Centralized API configuration and request handling.
 * When backend is added, this will handle all HTTP requests with
 * proper error handling, authentication, and response transformation.
 */

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

/**
 * Base API configuration
 */
export const API_CONFIG = {
  VEHICLE_SERVICE_URL: process.env.NEXT_PUBLIC_VEHICLE_SERVICE_URL || 'http://localhost:7001',
  MAINTENANCE_SERVICE_URL: process.env.NEXT_PUBLIC_MAINTENANCE_SERVICE_URL || 'http://localhost:5001',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json'
  }
};

/**
 * Base API class for making HTTP requests
 * This provides a foundation for all API services
 */
class BaseApi {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || API_CONFIG.VEHICLE_SERVICE_URL;
    this.defaultHeaders = API_CONFIG.HEADERS;
  }

  /**
   * Set authentication token for requests
   * TODO: Integrate with Keycloak/Auth provider
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authentication token
   */
  clearAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.defaultHeaders
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify(data)
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.defaultHeaders,
        body: JSON.stringify(data)
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: this.defaultHeaders,
        body: JSON.stringify(data)
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.defaultHeaders
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Handle successful response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        data: null as T,
        success: false,
        error: errorData.message || `HTTP Error: ${response.status}`
      };
    }

    const data = await response.json();
    return {
      data,
      success: true
    };
  }

  /**
   * Handle request errors
   */
  private handleError<T>(error: unknown): ApiResponse<T> {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return {
      data: null as T,
      success: false,
      error: message
    };
  }
}

// Export configured API instances
export const baseApi = new BaseApi();
export const vehicleApi = new BaseApi(API_CONFIG.VEHICLE_SERVICE_URL);
export const maintenanceApi = new BaseApi(API_CONFIG.MAINTENANCE_SERVICE_URL);

