import api from './index';

// Agent API - Dựa trên AgentController.java
export const agentAPI = {
  // Lấy tất cả agents hoạt động
  getAll: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
    agencyId?: number;
  }) => {
    const response = await api.get('/agents', { params });
    return response.data;
  },

  // Lấy agent theo ID
  getById: async (id: string) => {
    const response = await api.get(`/agents/${id}`);
    return response.data;
  },

  // Tạo agent mới
  create: async (agentData: {
    userId: string;
    agencyId: string;
    agentCode: string;
    licenseNumber: string;
    specialization?: string;
    experienceYears?: number;
  }) => {
    const response = await api.post('/agents', null, {
      params: agentData
    });
    return response.data;
  },

  // Cập nhật agent
  update: async (id: string, agentData: {
    agentCode?: string;
    licenseNumber?: string;
    specialization?: string;
    experienceYears?: number;
    isVerified?: boolean;
    isFeatured?: boolean;
  }) => {
    const response = await api.put(`/agents/${id}`, null, {
      params: agentData
    });
    return response.data;
  },

  // Vô hiệu hóa agent
  deactivate: async (id: string) => {
    const response = await api.delete(`/agents/${id}`);
    return response.data;
  },

  // Kích hoạt agent
  activate: async (id: string) => {
    const response = await api.put(`/agents/${id}/activate`);
    return response.data;
  },

  // Lấy agents theo agency
  getByAgency: async (agencyId: string) => {
    const response = await api.get(`/agents/agency/${agencyId}`);
    return response.data;
  },

  // Lấy agent theo email
  getByEmail: async (email: string) => {
    const response = await api.get(`/agents/email/${email}`);
    return response.data;
  },

  // Lấy agent theo phone
  getByPhone: async (phone: string) => {
    const response = await api.get(`/agents/phone/${phone}`);
    return response.data;
  },

  // Tìm kiếm agents theo tên
  search: async (name: string, page = 0, size = 10) => {
    const response = await api.get('/agents/search', {
      params: { name, page, size }
    });
    return response.data;
  },

  // Lấy agents theo thành phố
  getByCity: async (city: string, page = 0, size = 10) => {
    const response = await api.get(`/agents/city/${city}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy agents theo location (city + district)
  getByLocation: async (city: string, district: string, page = 0, size = 10) => {
    const response = await api.get('/agents/location', {
      params: { city, district, page, size }
    });
    return response.data;
  },

  // Lấy top agents theo rating
  getTopRated: async (page = 0, size = 10) => {
    const response = await api.get('/agents/top-rated', {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy agents có nhiều property nhất
  getMostProperties: async (page = 0, size = 10) => {
    const response = await api.get('/agents/most-properties', {
      params: { page, size }
    });
    return response.data;
  },

  // Cập nhật rating agent
  updateRating: async (id: string, ratingData: {
    ratingAverage: number;
    ratingCount: number;
  }) => {
    const response = await api.put(`/agents/${id}/rating`, null, {
      params: ratingData
    });
    return response.data;
  },

  // Đếm agents theo agency
  countByAgency: async (agencyId: string) => {
    const response = await api.get(`/agents/agency/${agencyId}/count`);
    return response.data;
  },

  // Đếm tổng agents hoạt động
  countActive: async () => {
    const response = await api.get('/agents/count');
    return response.data;
  },

  // Lấy properties của agent
  getProperties: async (agentId: string, page = 0, size = 10) => {
    const response = await api.get(`/agents/${agentId}/properties`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy reviews của agent
  getReviews: async (agentId: string, page = 0, size = 10) => {
    const response = await api.get(`/agents/${agentId}/reviews`, {
      params: { page, size }
    });
    return response.data;
  },

  // Rate agent
  rate: async (agentId: string, rating: number, review?: string) => {
    const response = await api.post(`/agents/${agentId}/rate`, {
      rating,
      review
    });
    return response.data;
  },
};