import api from './index';
import type { PropertyInquiry, PageResponse } from './types';

export const propertyInquiryAPI = {
  // Lấy yêu cầu tư vấn theo ID
  getInquiryById: async (id: string) => {
    const response = await api.get<PropertyInquiry>(`/property-inquiries/${id}`);
    return response.data;
  },

  // Lấy yêu cầu theo property
  getInquiriesByProperty: async (propertyId: string, page = 0, size = 10) => {
    const response = await api.get<PageResponse<PropertyInquiry>>(`/property-inquiries/property/${propertyId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy yêu cầu theo người yêu cầu
  getInquiriesByUser: async (inquirerId: string, page = 0, size = 10) => {
    const response = await api.get<PageResponse<PropertyInquiry>>(`/property-inquiries/user/${inquirerId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy yêu cầu theo trạng thái
  getInquiriesByStatus: async (status: 'NEW' | 'IN_PROGRESS' | 'RESPONDED' | 'CLOSED' | 'SPAM', page = 0, size = 10) => {
    const response = await api.get<PageResponse<PropertyInquiry>>(`/property-inquiries/status/${status}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy yêu cầu theo loại
  getInquiriesByType: async (type: 'GENERAL_INFO' | 'SCHEDULE_VIEWING' | 'PRICE_NEGOTIATION' | 'FINANCING_INFO' | 'PROPERTY_HISTORY' | 'NEIGHBORHOOD_INFO' | 'OTHER', page = 0, size = 10) => {
    const response = await api.get<PageResponse<PropertyInquiry>>(`/property-inquiries/type/${type}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Tạo yêu cầu tư vấn mới
  createInquiry: async (data: {
    propertyId: string;
    inquirerId: string;
    agentId?: string;
    inquirerName: string;
    inquirerEmail: string;
    inquirerPhone?: string;
    inquiryType: 'GENERAL_INFO' | 'SCHEDULE_VIEWING' | 'PRICE_NEGOTIATION' | 'FINANCING_INFO' | 'PROPERTY_HISTORY' | 'NEIGHBORHOOD_INFO' | 'OTHER';
    message: string;
    preferredContactMethod?: 'EMAIL' | 'PHONE' | 'SMS' | 'WHATSAPP' | 'ZALO';
  }) => {
    const response = await api.post<PropertyInquiry>('/property-inquiries', null, { params: data });
    return response.data;
  },

  // Cập nhật trạng thái yêu cầu
  updateInquiryStatus: async (id: string, status: 'NEW' | 'IN_PROGRESS' | 'RESPONDED' | 'CLOSED' | 'SPAM', agentResponse?: string) => {
    const response = await api.put<PropertyInquiry>(`/property-inquiries/${id}/status`, null, { 
      params: { status, agentResponse } 
    });
    return response.data;
  },

  // Phản hồi yêu cầu tư vấn
  respondToInquiry: async (id: string, agentResponse: string) => {
    const response = await api.put<PropertyInquiry>(`/property-inquiries/${id}/respond`, null, { 
      params: { agentResponse } 
    });
    return response.data;
  },

  // Xóa yêu cầu
  deleteInquiry: async (id: string) => {
    const response = await api.delete(`/property-inquiries/${id}`);
    return response.data;
  },

  // Thống kê số lượng yêu cầu theo property
  countInquiriesByProperty: async (propertyId: string) => {
    const response = await api.get<number>(`/property-inquiries/property/${propertyId}/count`);
    return response.data;
  },

  // Thống kê số lượng yêu cầu theo trạng thái
  countInquiriesByStatus: async (status: 'NEW' | 'IN_PROGRESS' | 'RESPONDED' | 'CLOSED' | 'SPAM') => {
    const response = await api.get<number>(`/property-inquiries/status/${status}/count`);
    return response.data;
  },

  // Thống kê số lượng yêu cầu mới
  countNewInquiries: async () => {
    const response = await api.get<number>('/property-inquiries/new/count');
    return response.data;
  },

  // Lấy tất cả inquiries (STAFF/ADMIN)
  getAll: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
    status?: 'NEW' | 'IN_PROGRESS' | 'RESPONDED' | 'CLOSED' | 'SPAM';
    type?: 'GENERAL_INFO' | 'SCHEDULE_VIEWING' | 'PRICE_NEGOTIATION' | 'FINANCING_INFO' | 'PROPERTY_HISTORY' | 'NEIGHBORHOOD_INFO' | 'OTHER';
  }) => {
    const response = await api.get<PageResponse<PropertyInquiry>>('/property-inquiries', { params });
    return response.data;
  }
};