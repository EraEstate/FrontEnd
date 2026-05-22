import api from './index';
import type { PropertyHistory, PropertyHistoryStats } from './types';

export const propertyHistoryAPI = {
  // Lấy dòng thời gian lịch sử của BĐS
  getTimeline: async (propertyId: string): Promise<PropertyHistory[]> => {
    const response = await api.get<PropertyHistory[]>(`/property-history/${propertyId}`);
    return response.data;
  },

  // Lấy thống kê lịch sử của BĐS (days on market, discount, price change count)
  getStats: async (propertyId: string): Promise<PropertyHistoryStats> => {
    const response = await api.get<PropertyHistoryStats>(`/property-history/${propertyId}/stats`);
    return response.data;
  }
};
