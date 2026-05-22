import api from './index';
import { logger } from '../utils/logger';

// Authentication API - Dựa trên AuthController.java (BE_Potsgre)
export const authAPI = {
  // Đăng nhập
  login: async (credentials: { 
    email: string; 
    password: string; 
  }) => {
    logger.debug('AuthAPI - Login request for:', credentials.email);
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Gửi OTP
  sendOtp: async (email: string) => {
    const response = await api.post('/auth/send-otp', { email });
    return response.data;
  },

  // Đăng ký
  register: async (userData: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    otpCode: string;
  }) => {
    const response = await api.post('/auth/register', {
      email: userData.email,
      password: userData.password,
      fullName: userData.fullName,
      phone: userData.phone,
      otpCode: userData.otpCode,
    });
    return response.data;
  },

  // Đăng xuất
  logout: async () => {
    try {
      // Lấy refreshToken từ store để gửi cho BE revoke
      let refreshToken: string | undefined;
      try {
        const raw = localStorage.getItem('auth-storage');
        if (raw) {
          const data = JSON.parse(raw);
          refreshToken = data.state?.refreshToken;
        }
      } catch { /* ignore */ }
      
      await api.post('/auth/logout', refreshToken ? { refreshToken } : {});
    } catch (error) {
      logger.warn('Backend logout failed, proceeding with local logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Refresh token
  refreshToken: async (token: string) => {
    const response = await api.post('/auth/refresh', { refreshToken: token });
    return response.data;
  },

  // Quên mật khẩu
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset mật khẩu bằng OTP
  resetPassword: async (email: string, otpCode: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { email, otpCode, newPassword });
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },
};