/**
 * API Service Layer
 * Centralized API configuration and request handling
 */

// Priority: VITE_API_URL from environment, fallback to localhost
const VITE_API_URL_FROM_ENV = import.meta?.env?.VITE_API_URL as string | undefined;
const API_BASE_URL = VITE_API_URL_FROM_ENV || 'http://localhost:8080/api';

console.log('🔧 API Configuration:', {
  'import.meta.env exists': typeof import.meta !== 'undefined' && import.meta.env != null,
  'VITE_API_URL (raw)': VITE_API_URL_FROM_ENV,
  'VITE_API_URL is defined': !!VITE_API_URL_FROM_ENV,
  'API_BASE_URL (computed)': API_BASE_URL,
  'Using localhost fallback': !VITE_API_URL_FROM_ENV,
  'All env keys': (typeof import.meta !== 'undefined' && import.meta.env != null) ? Object.keys(import.meta.env) : [],
  timestamp: new Date().toISOString()
});

/**
 * Get auth token from localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Set auth token in localStorage
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

/**
 * Remove auth token from localStorage
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
};

/**
 * Generic API request handler
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config: RequestInit = {
    ...options,
    headers,
  };
  
  try {
    console.log('📡 API Request:', { endpoint, method: config.method || 'GET' });
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...config,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log('📡 API Response:', { endpoint, status: response.status, ok: response.ok });
    
    // Handle empty responses (like 204 No Content)
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { message: text } : { success: response.ok };
    }
    
    // Handle errors
    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `Request failed with status ${response.status}`;
      console.error('❌ API Error:', { endpoint, status: response.status, error: errorMessage, data });
      const error: any = new Error(errorMessage);
      error.response = { data, status: response.status };
      throw error;
    }
    
    console.log('✅ API Success:', { endpoint, data });
    return data;
  } catch (error: any) {
    // Handle abort/timeout
    if (error.name === 'AbortError') {
      console.error('❌ API Request Timeout:', { endpoint });
      const timeoutError: any = new Error('Request timeout - please try again');
      timeoutError.response = { data: { message: 'Request timeout' }, status: 408 };
      throw timeoutError;
    }
    
    console.error('❌ API Request Failed:', { endpoint, error: error.message, stack: error.stack });
    
    if (error.response) {
      throw error;
    }
    
    const networkError: any = new Error(error.message || 'Network error occurred');
    networkError.response = { data: { message: error.message || 'Network error' }, status: 0 };
    throw networkError;
  }
}

/**
 * API methods
 */
export const api = {
  // GET request
  get: <T,>(endpoint: string): Promise<T> => {
    return apiRequest<T>(endpoint, { method: 'GET' });
  },
  
  // POST request
  post: <T,>(endpoint: string, data?: any): Promise<T> => {
    return apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  // PUT request
  put: <T,>(endpoint: string, data?: any): Promise<T> => {
    return apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  // DELETE request
  delete: <T,>(endpoint: string): Promise<T> => {
    return apiRequest<T>(endpoint, { method: 'DELETE' });
  },
};

export default api;
