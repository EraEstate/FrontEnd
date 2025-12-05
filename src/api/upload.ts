import api from './index';

export const uploadAPI = {
  // Upload avatar
  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Don't set Content-Type manually - let axios set it with boundary
    const response = await api.post('/upload/avatar', formData);
    return response.data.imageUrl;
  },

  // Upload single property image
  uploadPropertyImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Don't set Content-Type manually - let axios set it with boundary
    const response = await api.post('/upload/property', formData);
    return response.data.imageUrl;
  },

  // Upload multiple property images
  uploadPropertyImages: async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    // Don't set Content-Type manually - let axios set it with boundary
    // This ensures Authorization header is preserved
    const response = await api.post('/upload/property/multiple', formData);
    return response.data.imageUrls || [];
  },
};

export default uploadAPI;

