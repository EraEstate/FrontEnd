import api from './index';
import type { PropertyFavorite, PageResponse } from './types';

export const propertyFavoriteAPI = {
  // Lấy danh sách yêu thích của tôi
  getMyFavorites: async (page = 0, size = 12) => {
    try {
      console.log('propertyFavoriteAPI.getMyFavorites - Requesting favorites:', { page, size });
      const response = await api.get<PageResponse<PropertyFavorite>>('/favorites/my-favorites', {
        params: { page, size }
      });
      console.log('propertyFavoriteAPI.getMyFavorites - Response received:', response);
      console.log('propertyFavoriteAPI.getMyFavorites - Response data:', response.data);
      console.log('propertyFavoriteAPI.getMyFavorites - Response type:', typeof response.data);
      
      // Parse JSON string if response.data is a string
      let data = response.data;
      if (typeof data === 'string') {
        console.log('propertyFavoriteAPI.getMyFavorites - Parsing JSON string...');
        try {
          data = JSON.parse(data);
          console.log('propertyFavoriteAPI.getMyFavorites - Parsed data:', data);
        } catch (parseError) {
          console.error('propertyFavoriteAPI.getMyFavorites - Error parsing JSON:', parseError);
          return { content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 };
        }
      }
      
      // Ensure data is an object
      if (!data || typeof data !== 'object') {
        console.error('propertyFavoriteAPI.getMyFavorites - Invalid response data structure:', data);
        return { content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 };
      }
      
      console.log('propertyFavoriteAPI.getMyFavorites - Has content?', 'content' in data);
      console.log('propertyFavoriteAPI.getMyFavorites - Content count:', data?.content?.length || 0);
      
      // Ensure content is an array
      if (!Array.isArray(data.content)) {
        console.error('propertyFavoriteAPI.getMyFavorites - Content is not an array:', data.content);
        return { ...data, content: [] };
      }
      
      if (data.content && data.content.length > 0) {
        const firstFavorite = data.content[0];
        console.log('propertyFavoriteAPI.getMyFavorites - First favorite:', firstFavorite);
        console.log('propertyFavoriteAPI.getMyFavorites - First favorite keys:', Object.keys(firstFavorite || {}));
        console.log('propertyFavoriteAPI.getMyFavorites - Has property?', firstFavorite && 'property' in firstFavorite);
        console.log('propertyFavoriteAPI.getMyFavorites - First favorite property:', firstFavorite?.property);
        console.log('propertyFavoriteAPI.getMyFavorites - First favorite propertyId:', firstFavorite?.propertyId);
      }
      
      return data;
    } catch (error: any) {
      console.error('propertyFavoriteAPI.getMyFavorites - Error:', error);
      console.error('propertyFavoriteAPI.getMyFavorites - Error response:', error.response);
      console.error('propertyFavoriteAPI.getMyFavorites - Error message:', error.message);
      // Return empty structure on error
      return { content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 };
    }
  },

  // Thêm vào yêu thích
  addToFavorites: async (propertyId: string) => {
    const response = await api.post<PropertyFavorite>(`/favorites/${propertyId}`);
    return response.data;
  },

  // Xóa khỏi yêu thích
  removeFromFavorites: async (propertyId: string) => {
    const response = await api.delete(`/favorites/${propertyId}`);
    return response.data;
  },

  // Kiểm tra có trong yêu thích không
  isFavorited: async (propertyId: string) => {
    const response = await api.get<boolean>(`/favorites/${propertyId}/check`);
    return response.data;
  },

  // Số lượt yêu thích của property
  getPropertyFavoriteCount: async (propertyId: string) => {
    const response = await api.get<number>(`/favorites/${propertyId}/count`);
    return response.data;
  },

  // Toggle favorite
  toggle: async (propertyId: string) => {
    // Kiểm tra trước xem đã favorite chưa
    const isFavorited = await propertyFavoriteAPI.isFavorited(propertyId);
    
    if (isFavorited) {
      return propertyFavoriteAPI.removeFromFavorites(propertyId);
    } else {
      return propertyFavoriteAPI.addToFavorites(propertyId);
    }
  },

  // Admin functions
  // Lấy favorites của user (Admin)
  getUserFavorites: async (userId: string, page = 0, size = 12) => {
    const response = await api.get<PageResponse<PropertyFavorite>>(`/favorites/user/${userId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Xóa favorite theo user và property (Admin)
  removeByUserAndProperty: async (userId: string, propertyId: string) => {
    const response = await api.delete(`/favorites/remove/${userId}/${propertyId}`);
    return response.data;
  },

  // Lấy favorite detail theo ID (Admin)
  getFavoriteById: async (id: string) => {
    const response = await api.get<PropertyFavorite>(`/favorites/detail/${id}`);
    return response.data;
  }
};