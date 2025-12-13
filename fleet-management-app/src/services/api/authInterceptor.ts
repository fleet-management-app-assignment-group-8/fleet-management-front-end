/**
 * Auth Interceptor for API calls
 * Adds JWT token to all backend service requests
 */

export async function fetchWithAuth(url: string, options: RequestInit = {}, accessToken?: string) {
  const headers = new Headers(options.headers);
  
  // Add authorization header if token is available
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  
  // Add content-type if not set
  if (!headers.has('Content-Type') && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Handle 401 Unauthorized responses
  if (response.status === 401) {
    // Token might be expired, redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized - please log in again');
  }
  
  return response;
}

/**
 * Helper to create authenticated API client
 */
export function createAuthenticatedApi(accessToken?: string) {
  return {
    get: (url: string, options?: RequestInit) => 
      fetchWithAuth(url, { ...options, method: 'GET' }, accessToken),
    
    post: (url: string, body?: any, options?: RequestInit) =>
      fetchWithAuth(url, { 
        ...options, 
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined 
      }, accessToken),
    
    put: (url: string, body?: any, options?: RequestInit) =>
      fetchWithAuth(url, { 
        ...options, 
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined 
      }, accessToken),
    
    delete: (url: string, options?: RequestInit) =>
      fetchWithAuth(url, { ...options, method: 'DELETE' }, accessToken),
    
    patch: (url: string, body?: any, options?: RequestInit) =>
      fetchWithAuth(url, { 
        ...options, 
        method: 'PATCH',
        body: body ? JSON.stringify(body) : undefined 
      }, accessToken),
  };
}

