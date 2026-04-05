import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { logger } from '../utils/logger';
import { showWarning, showError } from '../utils/toast';

// Determine API base URL from environment (Vercel/Vite) or fall back to local dev
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============ Token helpers ============

const getAccessToken = (): string | null => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.token ?? null;
    }
  } catch {
    // ignore
  }
  return localStorage.getItem('jwt');
};

const getRefreshToken = (): string | null => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.refreshToken ?? null;
    }
  } catch {
    // ignore
  }
  return null;
};

/**
 * Cập nhật token trong Zustand auth-storage.
 * Vì Zustand persist dùng localStorage key 'auth-storage',
 * ta phải update trực tiếp vào đó.
 */
const updateTokensInStorage = (token: string, refreshToken: string) => {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (raw) {
      const data = JSON.parse(raw);
      data.state.token = token;
      data.state.refreshToken = refreshToken;
      localStorage.setItem('auth-storage', JSON.stringify(data));
    }
    localStorage.setItem('jwt', token);
  } catch {
    // fallback: chỉ lưu jwt
    localStorage.setItem('jwt', token);
  }
};

const clearAuthAndRedirect = () => {
  localStorage.removeItem('auth-storage');
  localStorage.removeItem('jwt');
  localStorage.removeItem('token');
  showWarning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  window.location.href = '/login';
};

// ============ Refresh token logic ============

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) prom.resolve(token);
    else prom.reject(error);
  });
  failedQueue = [];
};

// ============ Request interceptor ============

api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ============ Response interceptor ============

api.interceptors.response.use(
  (response) => {
    // Parse JSON string nếu BE trả string thay vì object
    if (typeof response.data === 'string' && response.data.trim().startsWith('{')) {
      try {
        response.data = JSON.parse(response.data);
      } catch {
        // Keep original
      }
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Quiet log cho các case bình thường
    const isSubscription404 = error.response?.status === 404 && 
      (error.config?.url?.includes('/subscriptions/current') || 
       error.config?.url?.includes('/listing-packages/my-current'));
    
    const isAuth400 = error.response?.status === 400 && 
      (error.config?.url?.includes('/auth/login') || 
       error.config?.url?.includes('/auth/register'));
    
    if (isSubscription404) {
      logger.debug('No subscription found (expected)');
    } else if (isAuth400) {
      logger.debug('Auth validation failed');
    } else if (error.response?.status !== 401) {
      logger.warn('API error:', error.response?.status, error.config?.url);
    }
    
    // Circular reference
    if (error.message?.includes('nesting depth') || error.message?.includes('circular')) {
      logger.error('Circular reference detected in response!');
    }

    // ============ 401 → Thử refresh token ============
    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                             originalRequest.url?.includes('/auth/register') ||
                             originalRequest.url?.includes('/auth/refresh');
      
      // Không retry cho auth endpoints (tránh vòng lặp)
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }
      
      const refreshToken = getRefreshToken();
      
      // Không có refresh token → redirect login
      if (!refreshToken) {
        const isAuthPage = window.location.pathname === '/login' || 
                           window.location.pathname === '/register';
        if (!isAuthPage) {
          clearAuthAndRedirect();
        }
        return Promise.reject(error);
      }
      
      // Đang refresh rồi → xếp hàng chờ
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err: unknown) => {
              reject(err);
            },
          });
        });
      }
      
      // Bắt đầu refresh
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const newToken = res.data.token;
        const newRefreshToken = res.data.refreshToken;
        
        updateTokensInStorage(newToken, newRefreshToken);
        processQueue(null, newToken);
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ============ Global error toasts (network, server) ============
    if (!error.response) {
      // Network error — server down, timeout, CORS
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        showError('Kết nối quá hạn. Vui lòng kiểm tra mạng và thử lại.');
      } else if (error.message?.includes('Network Error')) {
        showError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      }
    } else if (error.response.status === 403) {
      showError('Bạn không có quyền thực hiện thao tác này.');
    } else if (error.response.status >= 500) {
      showError('Hệ thống đang gặp sự cố. Vui lòng thử lại sau ít phút.');
    }

    return Promise.reject(error);
  }
);

// Export all APIs and services
export * from './services';
export * from './types';

export default api;