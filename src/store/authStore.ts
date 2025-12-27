import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginForm, RegisterForm } from '../types';
import { authAPI } from '../api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginForm) => Promise<void>;
  register: (data: RegisterForm) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (user: User) => void;
  initializeAuth: () => void;
}

// Helper function to check if user is authenticated
const checkIsAuthenticated = (user: User | null, token: string | null): boolean => {
  return !!(user && token);
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (data: LoginForm) => {
        set({ isLoading: true, error: null });
        try {
          console.log('AuthStore - Login attempt:', data);
          const response = await authAPI.login(data);
          console.log('AuthStore - Login response:', response);
          const { user, token } = response;
          set({
            user,
            token,
            isAuthenticated: checkIsAuthenticated(user, token),
            isLoading: false,
          });
          console.log('AuthStore - Login success, auth state updated');
          
          // Manual localStorage save as backup
          localStorage.setItem('jwt', token);
          console.log('AuthStore - Manual localStorage save completed');
        } catch (error: any) {
          console.error('AuthStore - Login error:', error);
          set({
            error: error.response?.data?.message || 'Đăng nhập thất bại',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (data: RegisterForm) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(data);
          const { user, token } = response;
          set({
            user,
            token,
            isAuthenticated: checkIsAuthenticated(user, token),
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Đăng ký thất bại',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          // Gọi API logout
          await authAPI.logout();
        } catch (error) {
          console.warn('Logout API call failed:', error);
        } finally {
          // Clear localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('auth-storage');
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
          
          // Redirect to login page
          window.location.href = '/login';
        }
      },

      clearError: () => set({ error: null }),

      updateUser: (user) => {
        const state = get();
        set({ 
          user,
          isAuthenticated: checkIsAuthenticated(user, state.token)
        });
      },

      // Initialize auth state from persisted data
      initializeAuth: () => {
        const state = get();
        const isAuthenticated = checkIsAuthenticated(state.user, state.token);
        
        // Debug: Log auth initialization
        console.log('AuthStore - Initialize Auth:', {
          user: state.user,
          token: state.token ? 'exists' : 'null',
          isAuthenticated,
          authStorage: localStorage.getItem('auth-storage') ? 'exists' : 'null',
          jwt: localStorage.getItem('jwt') ? 'exists' : 'null'
        });
        
        set({
          isAuthenticated
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);