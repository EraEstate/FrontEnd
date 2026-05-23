import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginForm, RegisterForm } from '../types';
import { authAPI } from '../api/auth';
import { logger } from '../utils/logger';
import { extractErrorMessage } from '../utils/errorParser';
import { showSuccess, showError } from '../utils/toast';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginForm) => Promise<void>;
  register: (data: RegisterForm) => Promise<void>;
  sendOtp: (email: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (user: User) => void;
  initializeAuth: () => void;
}

const checkIsAuthenticated = (user: User | null, token: string | null): boolean => {
  return !!(user && token);
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (data: LoginForm) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(data);
          const { user, token, refreshToken } = response;
          set({
            user,
            token,
            refreshToken: refreshToken || null,
            isAuthenticated: checkIsAuthenticated(user, token),
            isLoading: false,
          });
          logger.info('Login success:', user?.email);
          showSuccess('Đăng nhập thành công!');
          localStorage.setItem('jwt', token);
        } catch (error: any) {
          const errorMessage = extractErrorMessage(error, 'Đăng nhập thất bại');
          logger.debug('Login failed:', errorMessage);
          set({ error: errorMessage, isLoading: false });
          showError(errorMessage);
          throw error;
        }
      },

      register: async (data: RegisterForm) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(data);
          const { user, token, refreshToken } = response;
          set({
            user,
            token,
            refreshToken: refreshToken || null,
            isAuthenticated: checkIsAuthenticated(user, token),
            isLoading: false,
          });
          showSuccess('Đăng ký tài khoản thành công!');
        } catch (error: any) {
          const errorMessage = extractErrorMessage(error, 'Đăng ký thất bại');
          set({ error: errorMessage, isLoading: false });
          showError(errorMessage);
          throw error;
        }
      },

      sendOtp: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await authAPI.sendOtp(email);
          set({ isLoading: false });
        } catch (error: any) {
          set({
            error: extractErrorMessage(error, 'Không thể gửi mã OTP'),
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('auth-storage:v1');
        localStorage.removeItem('jwt');

        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });

        showSuccess('Đăng xuất thành công!');
        window.location.href = '/';

        try {
          await authAPI.logout();
        } catch (error) {
          logger.warn('Logout API call failed:', error);
        }
      },

      clearError: () => set({ error: null }),

      updateUser: (user) => {
        const state = get();
        set({ user, isAuthenticated: checkIsAuthenticated(user, state.token) });
      },

      initializeAuth: () => {
        const state = get();
        const isAuthenticated = checkIsAuthenticated(state.user, state.token);
        logger.debug('Auth init:', { hasUser: !!state.user, hasToken: !!state.token, isAuthenticated });
        set({ isAuthenticated });
      },
    }),
    {
      name: 'auth-storage:v1',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
