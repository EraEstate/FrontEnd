import api from './index';
import type { Project, Company } from './types';

// Project API
export const projectAPI = {
  // Lấy tất cả dự án
  getAll: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }) => {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  // Lấy dự án theo ID
  getById: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  // Lấy dự án theo tỉnh
  getByProvince: async (provinceId: string, page = 0, size = 10) => {
    const response = await api.get(`/projects/province/${provinceId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy dự án theo quận
  getByDistrict: async (districtId: string, page = 0, size = 10) => {
    const response = await api.get(`/projects/district/${districtId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy dự án theo loại
  getByType: async (projectType: string, page = 0, size = 10) => {
    const response = await api.get(`/projects/type/${projectType}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Tìm kiếm dự án
  search: async (keyword: string, page = 0, size = 10) => {
    const response = await api.get('/projects/search', {
      params: { keyword, page, size }
    });
    return response.data;
  },

  // Lấy dự án phổ biến
  getPopular: async (page = 0, size = 10) => {
    const response = await api.get('/projects/popular', {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy dự án gần đây
  getRecent: async (page = 0, size = 10) => {
    const response = await api.get('/projects/recent', {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy dự án theo khoảng giá
  getByPriceRange: async (minPrice: number, maxPrice: number, page = 0, size = 10) => {
    const response = await api.get('/projects/price-range', {
      params: { minPrice, maxPrice, page, size }
    });
    return response.data;
  },

  // Lấy dự án theo trạng thái
  getByStatus: async (projectStatus: string, page = 0, size = 10) => {
    const response = await api.get(`/projects/status/${projectStatus}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy dự án theo chủ đầu tư
  getByDeveloper: async (developer: string) => {
    const response = await api.get(`/projects/developer/${developer}`);
    return response.data;
  },

  // Tăng lượt xem dự án
  incrementViewCount: async (id: string) => {
    const response = await api.post(`/projects/${id}/view`);
    return response.data;
  },

  // Tạo dự án mới (Admin/Agent)
  create: async (project: Partial<Project>) => {
    const response = await api.post('/projects', project);
    return response.data;
  },

  // Cập nhật dự án (Admin/Agent)
  update: async (id: string, project: Partial<Project>) => {
    const response = await api.put(`/projects/${id}`, project);
    return response.data;
  },

  // Xóa dự án (Admin)
  delete: async (id: string) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  }
};

// Company API
export const companyAPI = {
  // Lấy tất cả công ty
  getAll: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }) => {
    const response = await api.get('/companies', { params });
    return response.data;
  },

  // Lấy công ty theo ID
  getById: async (id: string) => {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },

  // Lấy công ty theo loại
  getByType: async (companyType: string, page = 0, size = 10) => {
    const response = await api.get(`/companies/type/${companyType}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy công ty theo tỉnh
  getByProvince: async (provinceId: string, page = 0, size = 10) => {
    const response = await api.get(`/companies/province/${provinceId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Tìm kiếm công ty
  search: async (keyword: string, page = 0, size = 10) => {
    const response = await api.get('/companies/search', {
      params: { keyword, page, size }
    });
    return response.data;
  },

  // Lấy công ty hàng đầu
  getTop: async (page = 0, size = 10) => {
    const response = await api.get('/companies/top', {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy công ty theo mã số thuế
  getByTaxCode: async (taxCode: string) => {
    const response = await api.get(`/companies/tax-code/${taxCode}`);
    return response.data;
  },

  // Lấy công ty hoạt động theo loại
  getActiveByType: async (type: string) => {
    const response = await api.get(`/companies/active/${type}`);
    return response.data;
  },

  // ========== ENDPOINTS MỚI BỔ SUNG - BE ==========

  // Lấy công ty theo người đại diện
  getByRepresentative: async (representative: string, page = 0, size = 10) => {
    const response = await api.get(`/companies/representative/${representative}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Tạo công ty mới (Admin)
  create: async (companyData: {
    name: string;
    companyType: 'DEVELOPER' | 'INVESTOR' | 'CONTRACTOR' | 'CONSULTANT' | 'BROKER';
    taxCode: string;
    representative: string;
    address: string;
    phoneNumber: string;
    email: string;
    website?: string;
    provinceId: number;
    establishedYear?: number;
    description?: string;
    logo?: string;
  }) => {
    const response = await api.post('/companies', companyData);
    return response.data;
  },

  // Cập nhật công ty (Admin)
  update: async (id: string, companyData: any) => {
    const response = await api.put(`/companies/${id}`, companyData);
    return response.data;
  },

  // Xóa công ty (Admin)
  delete: async (id: string) => {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
  }
};