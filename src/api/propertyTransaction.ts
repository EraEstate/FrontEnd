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
  /** Ngày kết thúc thuê (giao dịch cho thuê) */
  leaseEndDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
  // Blockchain fields
  blockchainContractAddress?: string;
  blockchainNetwork?: string;
  blockchainTxHash?: string;
  blockchainStatus?: 'NOT_CREATED' | 'PENDING_ONCHAIN' | 'ONCHAIN_CONFIRMED' | 'ONCHAIN_FAILED' | 'ONCHAIN_CANCELLED';
  // E-Signature & Contract fields
  contractHash?: string;
  contractSignedAt?: string;
  buyerSigned?: boolean;
  sellerSigned?: boolean;
  property?: {
    id: string;
    title: string;
    listingType?: string;
    thumbnailUrl?: string;
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

export interface UpdateBlockchainTxRequest {
  txHash: string;
  contractAddress?: string;
  network?: string;
  status?: PropertyTransaction['blockchainStatus'];
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

  // Hoàn thành giao dịch (STAFF/ADMIN). Với tin cho thuê nên truyền leaseEndDate (YYYY-MM-DD).
  complete: async (id: string, leaseEndDate?: string) => {
    const response = await api.put<PropertyTransaction>(`/property-transactions/${id}/complete`, null, {
      params: leaseEndDate ? { leaseEndDate } : {},
    });
    return response.data;
  },

  // Hủy giao dịch
  cancel: async (id: string, reason?: string) => {
    const response = await api.put<PropertyTransaction>(`/property-transactions/${id}/cancel`, null, {
      params: reason ? { reason } : {}
    });
    return response.data;
  },

  // FE (MetaMask) gửi transaction hash + info blockchain cho giao dịch
  updateBlockchainTx: async (id: string, data: UpdateBlockchainTxRequest) => {
    const response = await api.post<PropertyTransaction>(`/property-transactions/${id}/blockchain-tx`, data);
    return response.data;
  },

  // E-Signature: lưu contract hash (SHA-256 của PDF đã ký)
  saveContractHash: async (id: string, data: { contractHash: string; signedByRole: 'BUYER' | 'SELLER' }) => {
    const response = await api.post<PropertyTransaction>(`/property-transactions/${id}/contract-hash`, data);
    return response.data;
  },
};

