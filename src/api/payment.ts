import api from './index';
import type { Payment, PageResponse } from './types';

export const paymentAPI = {
  // Lấy thanh toán theo ID
  getPaymentById: async (id: string) => {
    const response = await api.get<Payment>(`/payments/${id}`);
    return response.data;
  },

  // Lấy thanh toán của người dùng hiện tại
  getUserPayments: async (page = 0, size = 10) => {
    const response = await api.get<PageResponse<Payment>>('/payments/user', {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy tất cả thanh toán (admin only)
  getAllPayments: async (page = 0, size = 10) => {
    const response = await api.get<PageResponse<Payment>>('/payments/all', {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy thanh toán theo trạng thái (khớp Payment.PaymentStatus trên BE)
  getPaymentsByStatus: async (
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED',
    page = 0,
    size = 10
  ) => {
    const response = await api.get<PageResponse<Payment>>(`/payments/status/${status}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Tạo thanh toán mới
  createPayment: async (packageId: string, paymentMethod: string) => {
    const response = await api.post<Payment>('/payments', null, { 
      params: { packageId, paymentMethod } 
    });
    return response.data;
  },

  // Xử lý thanh toán
  processPayment: async (id: string, success: boolean, gatewayResponse?: string) => {
    const response = await api.put<Payment>(`/payments/${id}/process`, null, { 
      params: { success, gatewayResponse } 
    });
    return response.data;
  },

  // Thống kê tổng doanh thu
  getTotalRevenue: async () => {
    const response = await api.get<number | string>('/payments/revenue/total');
    return response.data;
  },

  /** Tổng số giao dịch thanh toán */
  countPayments: async () => {
    const response = await api.get<number>('/payments/count');
    return response.data;
  },
};