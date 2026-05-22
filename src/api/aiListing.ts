import { api } from './index';

export interface AIListingGenerateRequest {
  propertyType?: string;
  transactionType?: string;
  area?: string;
  price?: string;
  address?: string;
  provinceName?: string;
  districtName?: string;
  wardName?: string;
  bedrooms?: string;
  bathrooms?: string;
  floors?: string;
  yearBuilt?: string;
  furnishing?: string;
  features?: string[];
  rawNotes?: string;
  currentTitle?: string;
  currentDescription?: string;
}

export interface AIListingGenerateResponse {
  status: string;
  title: string;
  description: string;
  seoKeywords: string[];
}

export const aiListingAPI = {
  /**
   * Sinh tiêu đề & mô tả BĐS chuyên nghiệp từ thông số gốc
   */
  generate: async (data: AIListingGenerateRequest): Promise<AIListingGenerateResponse> => {
    const response = await api.post<AIListingGenerateResponse>('/ai-listing/generate', data);
    return response.data;
  },

  /**
   * Sinh bài viết tiếp thị đa kênh (Facebook, Zalo, TikTok, Email)
   */
  generateCampaign: async (data: {
    title: string;
    description: string;
    channel: string;
    tone: string;
  }): Promise<{ status: string; campaignContent: string }> => {
    const response = await api.post<{ status: string; campaignContent: string }>('/ai-listing/campaign', data);
    return response.data;
  },

  /**
   * Dịch thuật tin đăng BĐS tự động chuẩn hóa thuật ngữ (English, Japanese)
   */
  translateListing: async (data: {
    title: string;
    description: string;
    targetLanguage: string;
  }): Promise<{ status: string; title: string; description: string }> => {
    const response = await api.post<{ status: string; title: string; description: string }>('/ai-listing/translate', data);
    return response.data;
  },
};
