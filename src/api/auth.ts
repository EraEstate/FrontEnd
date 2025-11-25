import api from './index';

// Mock data cho development khi backend chưa sẵn sàng
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@bds.com',
    username: 'admin',
    password: 'admin123',
    fullName: 'Quản trị viên',
    phone: '0901234567',
    role: 'ADMIN',
    enabled: true,
    avatar: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    email: 'user@bds.com',
    username: 'user',
    password: 'user123',
    fullName: 'Người dùng',
    phone: '0901234568',
    role: 'USER',
    enabled: true,
    avatar: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock JWT token generator
const generateMockToken = (user: any) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: user.id,
    username: user.username,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  }));
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
};

// Authentication API - Dựa trên AuthController.java
export const authAPI = {
  // Đăng nhập
  login: async (credentials: { 
    email: string; 
    password: string; 
  }) => {
    console.log('AuthAPI - Login request:', credentials);
    const response = await api.post('/auth/login', credentials);
    console.log('AuthAPI - Login response:', response.data);
    return response.data;
  },

  // Đăng ký
  register: async (userData: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
  }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      console.warn('Backend not available, using mock register');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if email already exists
      const existingUser = MOCK_USERS.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('Email đã được sử dụng');
      }
      
      // Create new user
      const newUser = {
        id: (MOCK_USERS.length + 1).toString(),
        email: userData.email,
        username: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        phone: userData.phone,
        role: 'USER',
        enabled: true,
        avatar: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      MOCK_USERS.push(newUser);
      
      const { password, ...userWithoutPassword } = newUser;
      const token = generateMockToken(newUser);
      
      return {
        token,
        user: userWithoutPassword,
        expiresIn: 86400 // 24 hours
      };
    }
  },

  // Đăng xuất
  logout: async () => {
    try {
      // Gọi API logout từ AuthController
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Backend logout failed, proceeding with local logout');
    } finally {
      // Luôn xóa token và user khỏi localStorage
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
  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  // Quên mật khẩu
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset mật khẩu
  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },
};