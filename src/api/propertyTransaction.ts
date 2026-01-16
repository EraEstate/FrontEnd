import api from './index';
import type { PageResponse } from './types';

export interface PropertyTransaction {
  id: string;
  propertyId: string;
  buyerId: string;
  sellerId: string;
  totalAmount: number;
  taxAmount: number;
  serviceFee: number;
  platformFee: number;
  sellerAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  paymentMethod: 'BANK_TRANSFER' | 'VNPAY' | 'MOMO' | 'ZALOPAY' | 'CASH';
  paymentReference?: string;
  bankTransactionId?: string;
  buyerBankAccountId?: string;
  sellerBankAccountId?: string;
  notes?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
  property?: {
    id: string;
    title: string;
    price: number;
  };
  buyer?: {
    id: string;
    fullName: string;
    email: string;
  };
  seller?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface CreateTransactionRequest {
  propertyId: string;
  buyerId: string;
  paymentMethod: 'BANK_TRANSFER' | 'VNPAY' | 'MOMO' | 'ZALOPAY' | 'CASH';
  buyerBankAccountId?: string;
  sellerBankAccountId?: string;
}

export const propertyTransactionAPI = {
  // Tạo giao dịch mua bán
  create: async (data: CreateTransactionRequest) => {
    const response = await api.post<PropertyTransaction>('/property-transactions', null, {
      params: data
    });
    return response.data;
  },

  // Lấy giao dịch theo ID
  getById: async (id: string) => {
    const response = await api.get<PropertyTransaction>(`/property-transactions/${id}`);
    return response.data;
  },

  // Lấy giao dịch của user hiện tại
  getMyTransactions: async (page = 0, size = 20) => {
    const response = await api.get<PageResponse<PropertyTransaction>>('/property-transactions/my-transactions', {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy tất cả giao dịch (STAFF/ADMIN)
  getAll: async (status?: string, page = 0, size = 20) => {
    const response = await api.get<PageResponse<PropertyTransaction>>('/property-transactions', {
      params: { ...(status && { status }), page, size }
    });
    return response.data;
  },

  // Xác nhận thanh toán
  confirmPayment: async (id: string, bankTransactionId: string) => {
    const response = await api.put<PropertyTransaction>(`/property-transactions/${id}/confirm-payment`, null, {
      params: { bankTransactionId }
    });
    return response.data;
  },

  // Hoàn thành giao dịch (STAFF/ADMIN)
  complete: async (id: string) => {
    const response = await api.put<PropertyTransaction>(`/property-transactions/${id}/complete`);
    return response.data;
  },

  // Hủy giao dịch
  cancel: async (id: string, reason?: string) => {
    const response = await api.put<PropertyTransaction>(`/property-transactions/${id}/cancel`, null, {
      params: reason ? { reason } : {}
    });
    return response.data;
  },
};

