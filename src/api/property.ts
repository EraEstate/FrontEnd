import api from './index';

// Property API - Dựa trên PropertyController.java
export const propertyAPI = {
  // Tìm kiếm bất động sản (API chính như batdongsan.com.vn)
  search: async (params?: {
    query?: string;
    provinceId?: string;
    districtId?: string;
    wardId?: string;
    propertyType?: string;
    listingType?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }) => {
    const response = await api.get('/properties/search', { params });
    return response.data;
  },

  // Lấy tất cả bất động sản
  getAll: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
    provinceId?: string;
    districtId?: string;
    wardId?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    propertyType?: string;
    transactionType?: string;
  }) => {
    const response = await api.get('/properties', { params });
    return response.data;
  },

  // Lấy bất động sản nổi bật
  getFeatured: async (page = 0, size = 8) => {
    const response = await api.get('/properties/featured', { 
      params: { page, size } 
    });
    return response.data;
  },

  // Chi tiết bất động sản
  getById: async (id: string | number) => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },

  // Đăng tin bất động sản
  create: async (propertyData: any) => {
    const response = await api.post('/properties', propertyData);
    return response.data;
  },

  // Cập nhật bất động sản
  update: async (id: string, propertyData: any) => {
    const response = await api.put(`/properties/${id}`, propertyData);
    return response.data;
  },

  // Xóa bất động sản
  delete: async (id: string) => {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  },

  // Bất động sản của tôi
  getMyProperties: async (page = 0, size = 10) => {
    const response = await api.get('/properties/my-properties', {
      params: { page, size }
    });
    return response.data;
  },

  // Bất động sản theo chủ sở hữu
  getByOwner: async (ownerId: string, page = 0, size = 10) => {
    const response = await api.get(`/properties/by-owner/${ownerId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // === Location APIs (sử dụng từ location.ts) ===
  // Lấy danh sách tỉnh/thành phố
  getProvinces: async () => {
    const response = await api.get('/provinces');
    return response.data;
  },

  // Lấy danh sách quận/huyện theo tỉnh
  getDistrictsByProvince: async (provinceId: string) => {
    const response = await api.get(`/districts/province/${provinceId}`);
    return response.data;
  },

  // Lấy danh sách phường/xã theo quận
  getWardsByDistrict: async (districtId: string) => {
    const response = await api.get(`/wards/district/${districtId}`);
    return response.data;
  },

  // Bất động sản cho thuê
  getForRent: async (params?: {
    provinceId?: string;
    districtId?: string;
    wardId?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    page?: number;
    size?: number;
  }) => {
    const response = await api.get('/properties/search', { 
      params: { ...params, listingType: 'RENT' } 
    });
    return response.data;
  },

  // Bất động sản bán
  getForSale: async (params?: {
    provinceId?: string;
    districtId?: string;
    wardId?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    page?: number;
    size?: number;
  }) => {
    const response = await api.get('/properties/search', { 
      params: { ...params, listingType: 'SALE' } 
    });
    return response.data;
  },

  // Dự án bất động sản
  getProjects: async (params?: {
    provinceId?: string;
    districtId?: string;
    status?: string;
    investorName?: string;
    page?: number;
    size?: number;
  }) => {
    const response = await api.get('/properties/projects', { params });
    return response.data;
  },

  // Chi tiết dự án
  getProjectById: async (id: string) => {
    const response = await api.get(`/properties/projects/${id}`);
    return response.data;
  },

  // Tăng lượt xem
  incrementViews: async (id: string) => {
    const response = await api.post(`/properties/${id}/view`);
    return response.data;
  },

  // Báo cáo bất động sản
  report: async (propertyId: string, reason: string, description?: string) => {
    const response = await api.post(`/properties/${propertyId}/report`, {
      reason,
      description
    });
    return response.data;
  },

  // ========== ENDPOINTS MỚI BỔ SUNG - BE ==========

  // Lấy danh sách tất cả thành phố (BE endpoint)
  getAllCities: async () => {
    const response = await api.get('/properties/cities');
    return response.data;
  },

  // Lấy danh sách quận theo thành phố (BE endpoint)
  getDistrictsByCity: async (city: string) => {
    const response = await api.get(`/properties/districts/${city}`);
    return response.data;
  },

  // Duyệt tin đăng (STAFF/ADMIN)
  approveProperty: async (id: string) => {
    const response = await api.put(`/properties/${id}/approve`);
    return response.data;
  },

  // Từ chối tin đăng (STAFF/ADMIN)
  rejectProperty: async (id: string, reason?: string) => {
    const response = await api.put(`/properties/${id}/reject`, null, {
      params: reason ? { reason } : {}
    });
    return response.data;
  },

  // Lấy danh sách tin đăng chờ duyệt (STAFF/ADMIN)
  getPendingProperties: async (page = 0, size = 20) => {
    const response = await api.get('/properties/pending', {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy tin đăng theo trạng thái — moderation history (STAFF/ADMIN)
  getPropertiesByStatus: async (status: string, page = 0, size = 20) => {
    const response = await api.get('/properties/by-status', {
      params: { status, page, size }
    });
    return response.data;
  },

  // ========== AI RECOMMENDATION ENDPOINTS ==========

  // Lấy danh sách gợi ý cho user hiện tại
  getRecommendationsForYou: async (limit = 8) => {
    const response = await api.get('/recommendations/for-you', {
      params: { limit }
    });
    return response.data;
  },

  // Lấy danh sách BDS tương tự
  getSimilarProperties: async (propertyId: string, limit = 6) => {
    const response = await api.get(`/recommendations/similar/${propertyId}`, {
      params: { limit }
    });
    return response.data;
  },

  // ========== ADVANCED FEATURES ==========

  searchByGeo: async (polygon: number[][]) => {
    const response = await api.post('/properties/search/geo', { polygon });
    return response.data;
  },

  getPropertiesForCompare: async (ids: string[]) => {
    const params = new URLSearchParams();
    ids.forEach(id => params.append('ids', id));
    const response = await api.get(`/properties/compare?${params.toString()}`);
    return response.data;
  },

  getPriceHistory: async (propertyId: string) => {
    const response = await api.get(`/price-history/${propertyId}`);
    return response.data;
  },

  createPriceAlert: async (data: { propertyId: string, targetPrice: number }) => {
    const response = await api.post('/price-history/alerts', data);
    return response.data;
  },

  getUserPriceAlerts: async () => {
    const response = await api.get('/price-history/alerts');
    return response.data;
  },

  deletePriceAlert: async (alertId: string) => {
    const response = await api.delete(`/price-history/alerts/${alertId}`);
    return response.data;
  },
};