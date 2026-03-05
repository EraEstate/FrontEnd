import axios from 'axios';
import api from './index';
import type { WikiCategory, WikiArticleCreateRequest, WikiArticleUpdateRequest } from './types';

// Determine API base URL from environment (Vercel/Vite) or fall back to local dev
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

// Create a public API instance for endpoints that don't require authentication
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Wiki API - Dựa trên WikiArticleController.java
export const wikiAPI = {
  // Tạo bài viết wiki mới (Admin/Editor)
  create: async (articleData: WikiArticleCreateRequest) => {
    const response = await api.post('/wiki', articleData);
    return response.data;
  },

  // Cập nhật bài viết wiki (Admin/Editor)
  update: async (id: string, articleData: WikiArticleUpdateRequest) => {
    const response = await api.put(`/wiki/${id}`, articleData);
    return response.data;
  },

  // Publish bài viết wiki (Admin/Editor)
  publish: async (id: string) => {
    const response = await api.put(`/wiki/${id}/publish`);
    return response.data;
  },

  // Xóa bài viết wiki (Admin only)
  delete: async (id: string) => {
    const response = await api.delete(`/wiki/${id}`);
    return response.data;
  },

  // Lấy bài viết wiki theo ID
  getById: async (id: string) => {
    const response = await publicApi.get(`/wiki/${id}`);
    return response.data;
  },

  // Lấy bài viết wiki theo slug
  getBySlug: async (slug: string) => {
    const response = await publicApi.get(`/wiki/article/${slug}`);
    return response.data;
  },

  // Tăng lượt xem
  incrementViews: async (id: string) => {
    const response = await publicApi.post(`/wiki/${id}/view`);
    return response.data;
  },

  // Lấy tất cả bài viết wiki đã publish
  getAll: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }) => {
    const response = await publicApi.get('/wiki', { params });
    return response.data;
  },

  // Lấy bài viết wiki theo category
  getByCategory: async (category: WikiCategory, page = 0, size = 10) => {
    const response = await publicApi.get(`/wiki/category/${category}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Tìm kiếm bài viết wiki
  search: async (keyword: string, page = 0, size = 10) => {
    const response = await publicApi.get('/wiki/search', {
      params: { keyword, page, size }
    });
    return response.data;
  },

  // Lấy bài viết wiki phổ biến (nhiều view)
  getPopular: async (days = 30, page = 0, size = 10) => {
    const response = await publicApi.get('/wiki/popular', {
      params: { days, page, size }
    });
    return response.data;
  },

  // Lấy bài viết wiki gần đây
  getRecent: async (days = 7, page = 0, size = 10) => {
    const response = await publicApi.get('/wiki/recent', {
      params: { days, page, size }
    });
    return response.data;
  },

  // Lấy bài viết wiki theo tác giả
  getByAuthor: async (authorId: string, page = 0, size = 10) => {
    const response = await publicApi.get(`/wiki/author/${authorId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy tất cả categories
  getCategories: () => {
    return [
      { value: 'MUA_BDS', label: 'Mua BĐS', displayName: 'Mua BĐS' },
      { value: 'BAN_BDS', label: 'Bán BĐS', displayName: 'Bán BĐS' },
      { value: 'THUE_BDS', label: 'Thuê BĐS', displayName: 'Thuê BĐS' },
      { value: 'TAI_CHINH_BDS', label: 'Tài chính BĐS', displayName: 'Tài chính BĐS' },
      { value: 'QUY_HOACH_PHAP_LY', label: 'Quy hoạch - Pháp lý', displayName: 'Quy hoạch - Pháp lý' },
      { value: 'NOI_NGOAI_THAT', label: 'Nội - Ngoại thất', displayName: 'Nội - Ngoại thất' },
      { value: 'PHONG_THUY', label: 'Phong thủy', displayName: 'Phong thủy' }
    ];
  },

  // Lấy bài viết wiki nổi bật
  getFeatured: async (limit = 5) => {
    const response = await publicApi.get('/wiki', {
      params: { size: limit, sortBy: 'publishedAt', sortDir: 'desc' }
    });
    return response.data;
  }
};