import api from './index';
import type { BankAccount } from '../types';

export interface CreateBankAccountRequest {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  branchName?: string;
  accountType?: 'SAVINGS' | 'CHECKING' | 'CURRENT';
  isPrimary?: boolean;
}

export interface UpdateBankAccountRequest {
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  branchName?: string;
  accountType?: 'SAVINGS' | 'CHECKING' | 'CURRENT';
  isPrimary?: boolean;
}

export const bankAccountAPI = {
  // Tạo tài khoản ngân hàng mới
  create: async (data: CreateBankAccountRequest) => {
    const response = await api.post<BankAccount>('/bank-accounts', data);
    return response.data;
  },

  // Lấy danh sách tài khoản ngân hàng của user hiện tại
  getMyAccounts: async () => {
    const response = await api.get<BankAccount[]>('/bank-accounts');
    return response.data;
  },

  // Lấy tài khoản theo ID
  getById: async (id: string) => {
    const response = await api.get<BankAccount>(`/bank-accounts/${id}`);
    return response.data;
  },

  // Cập nhật tài khoản ngân hàng
  update: async (id: string, data: UpdateBankAccountRequest) => {
    const response = await api.put<BankAccount>(`/bank-accounts/${id}`, data);
    return response.data;
  },

  // Xóa tài khoản ngân hàng (soft delete)
  delete: async (id: string) => {
    const response = await api.delete(`/bank-accounts/${id}`);
    return response.data;
  },

  // Xác thực tài khoản (chỉ ADMIN)
  verify: async (id: string) => {
    const response = await api.put<BankAccount>(`/bank-accounts/${id}/verify`);
    return response.data;
  },
};

