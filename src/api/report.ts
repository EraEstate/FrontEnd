import api from './index';

export interface ReportRequest {
  targetId: string;
  targetType: 'PROPERTY' | 'USER' | 'REVIEW';
  reason: 'SCAM' | 'FAKE_INFO' | 'FAKE_PRICE' | 'DUPLICATE' | 'INAPPROPRIATE' | 'SPAM' | 'OTHER';
  description?: string;
}

export interface ReportResponse {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: string;
  reason: string;
  description: string;
  status: 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED';
  adminNote?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  reporter?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export const reportAPI = {
  create: async (data: ReportRequest): Promise<ReportResponse> => {
    const response = await api.post<ReportResponse>('/reports', data);
    return response.data;
  },

  getMyReports: async (page = 0, size = 20) => {
    const response = await api.get('/reports/my', { params: { page, size } });
    return response.data;
  },

  // Admin
  getAll: async (page = 0, size = 20, status?: string) => {
    const params: any = { page, size };
    if (status) params.status = status;
    const response = await api.get('/reports', { params });
    return response.data;
  },

  updateStatus: async (id: string, status: string, adminNote?: string) => {
    const response = await api.put(`/reports/${id}/status`, { status, adminNote });
    return response.data;
  },

  getStats: async (): Promise<Record<string, number>> => {
    const response = await api.get('/reports/stats');
    return response.data;
  },
};
