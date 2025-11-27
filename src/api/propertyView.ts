import api from './index';

// Property View API - Dựa trên PropertyViewController.java
export const propertyViewAPI = {
  // Ghi nhận lượt xem bất động sản
  recordView: async (propertyId: string, ipAddress?: string, userAgent?: string) => {
    const params: any = {};
    if (ipAddress) params.ipAddress = ipAddress;
    if (userAgent) params.userAgent = userAgent;
    
    const response = await api.post(`/property-views/${propertyId}`, null, { params });
    return response.data;
  },

  // Lấy số lượt xem của bất động sản
  getViewCount: async (propertyId: string) => {
    const response = await api.get(`/property-views/${propertyId}/count`);
    return response.data;
  },

  // Lấy thống kê lượt xem theo thời gian
  getViewStats: async (propertyId: string, days = 7) => {
    const response = await api.get(`/property-views/${propertyId}/stats`, {
      params: { days }
    });
    return response.data;
  },

  // Lịch sử xem theo bất động sản (Admin only)
  getPropertyViewHistory: async (propertyId: string, page = 0, size = 20) => {
    const response = await api.get(`/property-views/${propertyId}/history`, {
      params: { page, size }
    });
    return response.data;
  },

  // Thống kê lượt xem theo ngày (Admin only)
  getDailyViewStats: async (startDate?: string, endDate?: string) => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await api.get('/property-views/daily-stats', { params });
    return response.data;
  },

  // Top bất động sản được xem nhiều nhất
  getTrendingProperties: async (limit = 10, days = 7) => {
    const response = await api.get('/property-views/trending', {
      params: { limit, days }
    });
    return response.data;
  },

  // Top bất động sản được xem nhiều nhất từ ngày cụ thể
  getMostViewedProperties: async (fromDate?: string, page = 0, size = 10) => {
    const params: any = { page, size };
    if (fromDate) params.fromDate = fromDate;
    
    const response = await api.get('/property-views/most-viewed', { params });
    return response.data;
  },
};