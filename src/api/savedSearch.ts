import api from './index';
import type { SavedSearch } from './types';

export const savedSearchAPI = {
  // Lấy danh sách tìm kiếm đã lưu của tôi
  getMySavedSearches: async (): Promise<SavedSearch[]> => {
    const response = await api.get<SavedSearch[]>('/saved-searches/my-searches');
    return response.data;
  },

  // Tạo tìm kiếm đã lưu mới
  createSavedSearch: async (data: {
    searchName: string;
    queryParams: string;
    alertFrequency: 'INSTANT' | 'DAILY' | 'WEEKLY' | 'OFF';
  }): Promise<SavedSearch> => {
    const response = await api.post<SavedSearch>('/saved-searches', data);
    return response.data;
  },

  // Cập nhật tìm kiếm đã lưu
  updateSavedSearch: async (
    id: string,
    data: {
      searchName?: string;
      alertFrequency?: 'INSTANT' | 'DAILY' | 'WEEKLY' | 'OFF';
      isActive?: boolean;
    }
  ): Promise<SavedSearch> => {
    const response = await api.put<SavedSearch>(`/saved-searches/${id}`, data);
    return response.data;
  },

  // Xóa tìm kiếm đã lưu
  deleteSavedSearch: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/saved-searches/${id}`);
    return response.data;
  }
};
