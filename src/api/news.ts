import api from './index';

// News API - Dựa trên NewsController.java
export const newsAPI = {
  // Tạo bài viết mới (Admin/Editor)
  create: async (articleData: any) => {
    const response = await api.post('/news', articleData);
    return response.data;
  },

  // Cập nhật bài viết (Admin/Editor)
  update: async (id: string, articleData: any) => {
    const response = await api.put(`/news/${id}`, articleData);
    return response.data;
  },

  // Publish bài viết (Admin/Editor)
  publish: async (id: string) => {
    const response = await api.put(`/news/${id}/publish`);
    return response.data;
  },

  // Xóa bài viết (Admin only)
  delete: async (id: string) => {
    const response = await api.delete(`/news/${id}`);
    return response.data;
  },

  // Lấy bài viết theo ID
  getById: async (id: string) => {
    const response = await api.get(`/news/${id}`);
    return response.data;
  },

  // Tăng lượt xem
  incrementViews: async (id: string) => {
    const response = await api.post(`/news/${id}/view`);
    return response.data;
  },

  // Lấy tất cả bài viết đã publish
  getAll: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }) => {
    const response = await api.get('/news', { params });
    return response.data;
  },

  // Lấy bài viết theo category
  getByCategory: async (category: string, page = 0, size = 10) => {
    const response = await api.get(`/news/category/${category}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Tìm kiếm bài viết
  search: async (keyword: string, page = 0, size = 10) => {
    const response = await api.get('/news/search', {
      params: { keyword, page, size }
    });
    return response.data;
  },

  // Lấy bài viết phổ biến (nhiều view)
  getPopular: async (days = 30, page = 0, size = 10) => {
    const response = await api.get('/news/popular', {
      params: { days, page, size }
    });
    return response.data;
  },

  // Lấy bài viết gần đây
  getRecent: async (days = 7, page = 0, size = 10) => {
    const response = await api.get('/news/recent', {
      params: { days, page, size }
    });
    return response.data;
  },

  // Lấy bài viết theo tác giả
  getByAuthor: async (authorId: string, page = 0, size = 10) => {
    const response = await api.get(`/news/author/${authorId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy bài viết nổi bật
  getFeatured: async (limit = 5) => {
    const response = await api.get('/news/featured', {
      params: { size: limit }
    });
    return response.data;
  },

  // Lấy bài viết liên quan
  getRelated: async (id: string, limit = 5) => {
    const response = await api.get(`/news/${id}/related`, {
      params: { size: limit }
    });
    return response.data;
  },

  // Lấy categories
  getCategories: async () => {
    const response = await api.get('/news/categories');
    return response.data;
  },

  // Lấy tags
  getTags: async () => {
    const response = await api.get('/news/tags');
    return response.data;
  },

  // Lấy bài viết theo tag
  getByTag: async (tag: string, page = 0, size = 10) => {
    const response = await api.get(`/news/tag/${tag}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Comment on article
  addComment: async (articleId: string, comment: string) => {
    const response = await api.post(`/news/${articleId}/comments`, {
      comment
    });
    return response.data;
  },

  // Get comments
  getComments: async (articleId: string, page = 0, size = 10) => {
    const response = await api.get(`/news/${articleId}/comments`, {
      params: { page, size }
    });
    return response.data;
  },

  // Like article
  like: async (articleId: string) => {
    const response = await api.post(`/news/${articleId}/like`);
    return response.data;
  },

  // Unlike article
  unlike: async (articleId: string) => {
    const response = await api.delete(`/news/${articleId}/like`);
    return response.data;
  },
};