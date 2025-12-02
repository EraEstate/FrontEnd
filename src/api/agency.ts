import api from './index';

// Agency API - Dựa trên AgencyController
export const agencyAPI = {
  // Lấy tất cả agencies
  getAll: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }) => {
    const response = await api.get('/agencies', { params });
    return response.data;
  },

  // Lấy agency theo ID
  getById: async (id: string) => {
    const response = await api.get(`/agencies/${id}`);
    return response.data;
  },

  // Tạo agency mới
  create: async (agencyData: {
    name: string;
    description?: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    licenseNumber: string;
  }) => {
    const response = await api.post('/agencies', agencyData);
    return response.data;
  },

  // Cập nhật agency
  update: async (id: string, agencyData: any) => {
    const response = await api.put(`/agencies/${id}`, agencyData);
    return response.data;
  },

  // Xóa agency
  delete: async (id: string) => {
    const response = await api.delete(`/agencies/${id}`);
    return response.data;
  },

  // Lấy agents của agency
  getAgents: async (agencyId: string, page = 0, size = 10) => {
    const response = await api.get(`/agencies/${agencyId}/agents`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy properties của agency
  getProperties: async (agencyId: string, page = 0, size = 10) => {
    const response = await api.get(`/agencies/${agencyId}/properties`, {
      params: { page, size }
    });
    return response.data;
  },

  // Tìm kiếm agencies
  search: async (keyword: string, page = 0, size = 10) => {
    const response = await api.get('/agencies/search', {
      params: { keyword, page, size }
    });
    return response.data;
  },

  // Lấy agencies theo thành phố
  getByCity: async (city: string, page = 0, size = 10) => {
    const response = await api.get(`/agencies/city/${city}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy top agencies
  getTopAgencies: async (page = 0, size = 10) => {
    const response = await api.get('/agencies/top', {
      params: { page, size }
    });
    return response.data;
  },

  // Verify agency
  verify: async (id: string) => {
    const response = await api.patch(`/agencies/${id}/verify`);
    return response.data;
  },

  // Unverify agency
  unverify: async (id: string) => {
    const response = await api.patch(`/agencies/${id}/unverify`);
    return response.data;
  },

  // Get agency statistics
  getStatistics: async (id: string) => {
    const response = await api.get(`/agencies/${id}/statistics`);
    return response.data;
  },

  // ========== ENDPOINTS MỚI BỔ SUNG - BE ==========

  // Lấy các agency đang hoạt động
  getActiveAgencies: async (page = 0, size = 10) => {
    const response = await api.get('/agencies/active', {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy agency theo code
  getByCode: async (code: string) => {
    const response = await api.get(`/agencies/code/${code}`);
    return response.data;
  },

  // Kích hoạt agency (Admin)
  activate: async (id: string) => {
    const response = await api.put(`/agencies/${id}/activate`);
    return response.data;
  },

  // Đếm số agency đang hoạt động
  countActiveAgencies: async () => {
    const response = await api.get('/agencies/count');
    return response.data;
  },

  // Cập nhật rating của agency
  updateRating: async (id: string, rating: number) => {
    const response = await api.put(`/agencies/${id}/rating`, null, {
      params: { rating }
    });
    return response.data;
  },

  // Lấy agencies theo tỉnh
  getByProvince: async (provinceId: string, page = 0, size = 10) => {
    const response = await api.get(`/agencies/province/${provinceId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy agencies theo quận
  getByDistrict: async (districtId: string, page = 0, size = 10) => {
    const response = await api.get(`/agencies/district/${districtId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy agencies theo phường
  getByWard: async (wardId: string, page = 0, size = 10) => {
    const response = await api.get(`/agencies/ward/${wardId}`, {
      params: { page, size }
    });
    return response.data;
  },
};