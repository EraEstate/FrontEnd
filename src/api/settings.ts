import api from './index';

export interface SettingsResponse {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string;
  bio?: string;
  address?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  bio?: string;
  address?: string;
  avatarUrl?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export const settingsAPI = {
  // Lấy cài đặt của user hiện tại
  getCurrentSettings: async (): Promise<SettingsResponse> => {
    const response = await api.get('/settings');
    return response.data;
  },

  // Cập nhật thông tin profile
  updateProfile: async (data: UpdateProfileRequest): Promise<SettingsResponse> => {
    const response = await api.put('/settings/profile', data);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<SettingsResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Don't set Content-Type manually - let axios set it with boundary
    const response = await api.post('/settings/avatar', formData);
    return response.data;
  },

  // Đổi mật khẩu
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.put('/settings/password', data);
  },
};

export default settingsAPI;

