import axios from 'axios';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // If data is FormData, remove Content-Type header to let axios set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // Try to get token from auth-storage first, then fallback to jwt
    let token = null;
    
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        token = parsed.state?.token;
        console.log('Axios - Token from auth-storage:', token ? 'exists' : 'null');
      }
    } catch (e) {
      console.warn('Failed to parse auth-storage:', e);
    }
    
    // Fallback to jwt key
    if (!token) {
      token = localStorage.getItem('jwt');
      console.log('Axios - Token from jwt:', token ? 'exists' : 'null');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Axios - Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.log('Axios - No token found, request will be unauthorized');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and circular reference issues
api.interceptors.response.use(
  (response) => {
    // Log response for debugging
    if (response.config.url?.includes('/favorites')) {
      console.log('Axios - Favorites response status:', response.status);
      console.log('Axios - Favorites response data type:', typeof response.data);
      console.log('Axios - Favorites response headers:', response.headers);
    }
    
    // Parse JSON string if response.data is a string (sometimes backend returns string instead of object)
    if (typeof response.data === 'string' && response.data.trim().startsWith('{')) {
      try {
        console.log('Axios - Parsing JSON string in response interceptor...');
        response.data = JSON.parse(response.data);
        console.log('Axios - Parsed successfully, new type:', typeof response.data);
      } catch (parseError) {
        console.error('Axios - Error parsing JSON string:', parseError);
        // Keep original string if parse fails
      }
    }
    
    return response;
  },
  (error) => {
    // Không log 404 cho các endpoint subscription (bình thường khi chưa có subscription)
    const isSubscription404 = error.response?.status === 404 && 
      (error.config?.url?.includes('/subscriptions/current') || 
       error.config?.url?.includes('/listing-packages/my-current'));
    
    // Không log error cho 400 từ login/register (chỉ log warning)
    const isAuth400 = error.response?.status === 400 && 
      (error.config?.url?.includes('/auth/login') || 
       error.config?.url?.includes('/auth/register'));
    
    if (isSubscription404) {
      // Chỉ log debug cho 404 subscription (không phải error)
      console.debug('Axios - No subscription found (404) - this is normal if user has no active subscription');
    } else if (isAuth400) {
      // Chỉ log warning cho 400 từ auth (sai password, account disabled, etc.)
      console.warn('Axios - Auth request failed:', error.response?.data?.error || error.response?.data?.message || 'Authentication failed');
    } else {
      // Log error cho các lỗi khác
      console.error('Axios - Response error:', error);
      if (error.response) {
        console.error('Axios - Error response status:', error.response.status);
        console.error('Axios - Error response data:', error.response.data);
      }
    }
    
    if (error.message?.includes('nesting depth') || error.message?.includes('circular')) {
      console.error('Axios - Circular reference detected in response!');
    }
    if (error.response?.status === 401) {
      console.log('Axios - 401 Unauthorized, but NOT clearing localStorage for debugging');
      // Temporarily disable localStorage clearing for debugging
      // localStorage.removeItem('auth-storage');
      // localStorage.removeItem('jwt');
      // localStorage.removeItem('token');
      // localStorage.removeItem('user');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Export all APIs and services
export * from './services';
export * from './types';

export default api;