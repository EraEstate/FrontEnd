import api from './index';
import type { MarketAnalysis } from './types';

// Market Analysis API
export const marketAnalysisAPI = {
  // Lấy tất cả bài phân tích thị trường
  getAll: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }) => {
    const response = await api.get('/market-analyses', { params });
    return response.data;
  },

  // Lấy bài phân tích theo ID
  getById: async (id: string) => {
    const response = await api.get(`/market-analyses/${id}`);
    return response.data;
  },

  // Lấy bài phân tích theo slug
  getBySlug: async (slug: string) => {
    const response = await api.get(`/market-analyses/slug/${slug}`);
    return response.data;
  },

  // Lấy bài phân tích theo danh mục
  getByCategory: async (category: string, page = 0, size = 10) => {
    const response = await api.get(`/market-analyses/category/${category}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy bài phân tích phổ biến
  getPopular: async (limit = 10) => {
    const response = await api.get('/market-analyses/popular', {
      params: { limit }
    });
    return response.data;
  },

  // Tìm kiếm bài phân tích
  search: async (query: string, page = 0, size = 10) => {
    const response = await api.get('/market-analyses/search', {
      params: { q: query, page, size }
    });
    return response.data;
  },

  // Tăng lượt xem
  incrementViewCount: async (id: string) => {
    const response = await api.post(`/market-analyses/${id}/view`);
    return response.data;
  },

  // Tăng lượt thích
  incrementLikeCount: async (id: string) => {
    const response = await api.post(`/market-analyses/${id}/like`);
    return response.data;
  },

  // Tăng lượt chia sẻ
  incrementShareCount: async (id: string) => {
    const response = await api.post(`/market-analyses/${id}/share`);
    return response.data;
  },

  // Tạo bài phân tích mới (Admin)
  create: async (analysis: Partial<MarketAnalysis>) => {
    const response = await api.post('/market-analyses', analysis);
    return response.data;
  },

  // Cập nhật bài phân tích (Admin)
  update: async (id: string, analysis: Partial<MarketAnalysis>) => {
    const response = await api.put(`/market-analyses/${id}`, analysis);
    return response.data;
  },

  // Xóa bài phân tích (Admin)
  delete: async (id: string) => {
    const response = await api.delete(`/market-analyses/${id}`);
    return response.data;
  },

  // ========== ENDPOINTS MỚI BỔ SUNG ==========

  // Lấy bài phân tích theo loại
  getByType: async (type: string, page = 0, size = 10) => {
    const response = await api.get(`/market-analyses/type/${type}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy bài phân tích mới nhất
  getLatest: async (limit = 10) => {
    const response = await api.get('/market-analyses/latest', {
      params: { limit }
    });
    return response.data;
  },

  // Lấy bài phân tích theo tỉnh
  getByProvince: async (provinceId: string, page = 0, size = 10) => {
    const response = await api.get(`/market-analyses/province/${provinceId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy bài phân tích theo quận
  getByDistrict: async (districtId: string, page = 0, size = 10) => {
    const response = await api.get(`/market-analyses/district/${districtId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy bài phân tích theo dự án
  getByProject: async (projectId: string, page = 0, size = 10) => {
    const response = await api.get(`/market-analyses/project/${projectId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy bài phân tích theo công ty
  getByCompany: async (companyId: string, page = 0, size = 10) => {
    const response = await api.get(`/market-analyses/company/${companyId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy bài phân tích theo tag
  getByTag: async (tag: string, page = 0, size = 10) => {
    const response = await api.get(`/market-analyses/tag/${tag}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy bài phân tích theo tác giả
  getByAuthor: async (author: string, page = 0, size = 10) => {
    const response = await api.get(`/market-analyses/author/${author}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy bài phân tích theo khoảng thời gian
  getByDateRange: async (startDate: string, endDate: string, page = 0, size = 10) => {
    const response = await api.get('/market-analyses/date-range', {
      params: { startDate, endDate, page, size }
    });
    return response.data;
  },

  // Lấy bài phân tích liên quan
  getRelated: async (id: string, limit = 5) => {
    const response = await api.get(`/market-analyses/${id}/related`, {
      params: { limit }
    });
    return response.data;
  },

  // Thống kê: Đếm số bài theo category
  getCountByCategory: async (category: string) => {
    const response = await api.get(`/market-analyses/stats/category/${category}`);
    return response.data;
  },

  // Thống kê: Đếm số bài theo type
  getCountByType: async (type: string) => {
    const response = await api.get(`/market-analyses/stats/type/${type}`);
    return response.data;
  },

  // Thống kê: Số liệu theo tháng
  getMonthlyStatistics: async (year?: number, month?: number) => {
    const response = await api.get('/market-analyses/stats/monthly', {
      params: { year, month }
    });
    return response.data;
  },

  // Lấy bài phổ biến nhất theo category
  getPopularByCategory: async (category: string, limit = 10) => {
    const response = await api.get(`/market-analyses/popular/category/${category}`, {
      params: { limit }
    });
    return response.data;
  },

  // Toggle publish status (Admin)
  togglePublishStatus: async (id: string) => {
    const response = await api.patch(`/market-analyses/${id}/toggle-publish`);
    return response.data;
  }
};