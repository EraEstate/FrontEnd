import api from './index';

// User API - Dựa trên UserController.java
export const userAPI = {
  // Tạo user mới (Admin only)
  create: async (userData: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role?: string;
    enabled?: boolean;
  }) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Lấy user theo ID
  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Lấy user theo email
  getByEmail: async (email: string) => {
    const response = await api.get(`/users/email/${email}`);
    return response.data;
  },

  // Lấy user theo số điện thoại
  getByPhone: async (phone: string) => {
    const response = await api.get(`/users/phone/${phone}`);
    return response.data;
  },

  // Lấy tất cả users (Admin only)
  getAll: async (page = 0, size = 20) => {
    const response = await api.get('/users', {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy users theo role (Admin only)
  getByRole: async (role: string, page = 0, size = 20) => {
    const response = await api.get(`/users/role/${role}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy users theo trạng thái enabled (Admin only)
  getByEnabled: async (enabled: boolean, page = 0, size = 20) => {
    const response = await api.get(`/users/enabled/${enabled}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Tìm kiếm users theo tên (Admin only)
  search: async (keyword: string) => {
    const response = await api.get('/users/search', {
      params: { keyword }
    });
    return response.data;
  },

  // Cập nhật user
  update: async (id: string, userData: {
    email?: string;
    fullName?: string;
    phone?: string;
    role?: string;
    enabled?: boolean;
  }) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Đổi mật khẩu
  changePassword: async (id: string, passwords: {
    oldPassword: string;
    newPassword: string;
  }) => {
    const response = await api.patch(`/users/${id}/change-password`, passwords);
    return response.data;
  },

  // Reset mật khẩu (Admin only)
  resetPassword: async (id: string, newPassword: string) => {
    const response = await api.patch(`/users/${id}/reset-password`, {
      newPassword
    });
    return response.data;
  },

  // Kích hoạt user (Admin only)
  enable: async (id: string) => {
    const response = await api.patch(`/users/${id}/enable`);
    return response.data;
  },

  // Vô hiệu hóa user (Admin only)
  disable: async (id: string) => {
    const response = await api.patch(`/users/${id}/disable`);
    return response.data;
  },

  // Thay đổi role user (Admin only)
  changeRole: async (id: string, role: string) => {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data;
  },

  // Xóa user (Admin only)
  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Kiểm tra email tồn tại (Admin only)
  existsByEmail: async (email: string) => {
    const response = await api.get(`/users/exists/email/${email}`);
    return response.data;
  },

  // Kiểm tra phone tồn tại (Admin only)
  existsByPhone: async (phone: string) => {
    const response = await api.get(`/users/exists/phone/${phone}`);
    return response.data;
  },

  // Đếm tổng số users (Admin only)
  count: async () => {
    const response = await api.get('/users/count');
    return response.data;
  },

  // Đếm users theo role (Admin only)
  countByRole: async (role: string) => {
    const response = await api.get(`/users/count/role/${role}`);
    return response.data;
  },

  // Đếm users đã kích hoạt (Admin only)
  countEnabled: async () => {
    const response = await api.get('/users/count/enabled');
    return response.data;
  },

  // Đếm users chưa kích hoạt (Admin only)
  countDisabled: async () => {
    const response = await api.get('/users/count/disabled');
    return response.data;
  },

  // Lấy thông tin profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Cập nhật profile
  updateProfile: async (profileData: any) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // ========== ENDPOINTS MỚI BỔ SUNG - BE ==========

  // Lấy user kèm profile (Admin/BE endpoint)
  getUserWithProfile: async (userId: string) => {
    const response = await api.get(`/users/${userId}/with-profile`);
    return response.data;
  },

  // Lấy user kèm properties (Admin/BE endpoint)
  getUserWithProperties: async (userId: string) => {
    const response = await api.get(`/users/${userId}/with-properties`);
    return response.data;
  },

  // Lấy user kèm thông tin agent (Admin/BE endpoint)
  getUserWithAgentInfo: async (userId: string) => {
    const response = await api.get(`/users/${userId}/agent-info`);
    return response.data;
  },

  // Lấy danh sách yêu thích của user (Admin/BE endpoint)
  getUserFavorites: async (userId: string, page = 0, size = 10) => {
    const response = await api.get(`/users/${userId}/favorites`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy lịch sử xem property của user (Admin/BE endpoint)
  getUserPropertyViews: async (userId: string, page = 0, size = 10) => {
    const response = await api.get(`/users/${userId}/property-views`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy reviews của user (Admin/BE endpoint)
  getUserReviews: async (userId: string, page = 0, size = 10) => {
    const response = await api.get(`/users/${userId}/reviews`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy notifications của user (Admin/BE endpoint)
  getUserNotifications: async (userId: string, page = 0, size = 10) => {
    const response = await api.get(`/users/${userId}/notifications`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy dashboard data của user (Admin/BE endpoint)
  getUserDashboard: async (userId: string) => {
    const response = await api.get(`/users/${userId}/dashboard`);
    return response.data;
  },

  // Lấy public profile của user (không cần auth)
  getPublicProfile: async (userId: string) => {
    const response = await api.get(`/users/${userId}/public`);
    return response.data;
  },
};