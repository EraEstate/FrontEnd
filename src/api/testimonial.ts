import api from './index';

export interface TestimonialResponse {
  id: string;
  userId?: string;
  fullName: string;
  avatarUrl?: string;
  roleLabel?: string;
  content: string;
  rating: number;
  category: 'BUY' | 'SELL' | 'RENT' | 'INVEST' | 'GENERAL';
  propertyTitle?: string;
  propertyId?: string;
  isFeatured: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface TestimonialPage {
  content: TestimonialResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const testimonialAPI = {
  getApproved: async (page = 0, size = 12, category?: string): Promise<TestimonialPage> => {
    const params: any = { page, size };
    if (category) params.category = category;
    const response = await api.get<TestimonialPage>('/testimonials', { params });
    return response.data;
  },

  getFeatured: async (): Promise<TestimonialResponse[]> => {
    const response = await api.get<TestimonialResponse[]>('/testimonials/featured');
    return response.data;
  },

  create: async (data: {
    content: string;
    rating?: number;
    category?: string;
    propertyTitle?: string;
    propertyId?: string;
  }): Promise<TestimonialResponse> => {
    const response = await api.post<TestimonialResponse>('/testimonials', data);
    return response.data;
  },

  // Admin
  getAll: async (page = 0, size = 20): Promise<TestimonialPage> => {
    const response = await api.get<TestimonialPage>('/testimonials/admin/all', { params: { page, size } });
    return response.data;
  },

  approve: async (id: string) => {
    const response = await api.put(`/testimonials/${id}/approve`);
    return response.data;
  },

  toggleFeatured: async (id: string) => {
    const response = await api.put(`/testimonials/${id}/featured`);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/testimonials/${id}`);
  },
};
