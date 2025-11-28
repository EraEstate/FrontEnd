import api from './index';

// User Profile API - Dựa trên UserProfileController.java
export const profileAPI = {
  // Tạo profile mới
  createProfile: async (data: {
    userId: number;
    fullName?: string;
    dateOfBirth?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    phoneNumber?: string;
    address?: string;
    city?: string;
    district?: string;
    ward?: string;
    zipCode?: string;
    avatar?: string;
    bio?: string;
    website?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    occupation?: string;
    company?: string;
  }) => {
    const response = await api.post('/profiles', data);
    return response.data;
  },

  // Cập nhật profile
  updateProfile: async (data: {
    userId?: number;
    fullName?: string;
    dateOfBirth?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    phoneNumber?: string;
    address?: string;
    city?: string;
    district?: string;
    ward?: string;
    zipCode?: string;
    avatar?: string;
    bio?: string;
    website?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    occupation?: string;
    company?: string;
  }) => {
    const response = await api.put('/profiles', data);
    return response.data;
  },

  // Lấy profile của tôi
  getMyProfile: async () => {
    const response = await api.get('/profiles/me');
    return response.data;
  },

  // Lấy profile theo profile ID
  getProfile: async (profileId: number) => {
    const response = await api.get(`/profiles/${profileId}`);
    return response.data;
  },

  // Lấy profile theo user ID
  getProfileByUserId: async (userId: number) => {
    const response = await api.get(`/profiles/user/${userId}`);
    return response.data;
  },

  // Xóa profile
  deleteProfile: async () => {
    const response = await api.delete('/profiles');
    return response.data;
  },

  // Cập nhật avatar
  updateAvatar: async (avatarFile: File) => {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    
    const response = await api.put('/profiles/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Tìm kiếm profiles
  searchProfiles: async (params: {
    query?: string;
    city?: string;
    occupation?: string;
    page?: number;
    size?: number;
  }) => {
    const response = await api.get('/profiles/search', { params });
    return response.data;
  },

  // Lấy tất cả profiles (Admin)
  getAllProfiles: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }) => {
    const response = await api.get('/profiles', { params });
    return response.data;
  },

  // Kiểm tra profile đã hoàn chỉnh chưa
  isProfileComplete: async () => {
    const response = await api.get('/profiles/complete');
    return response.data;
  },
};

export default profileAPI;
