import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import { bankAccountAPI, type CreateBankAccountRequest } from '../api/bankAccount';
import type { BankAccount } from '../types';
import { toast } from 'react-toastify';

const BankAccountManagementPage: React.FC = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [formData, setFormData] = useState<CreateBankAccountRequest>({
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    branchName: '',
    accountType: 'SAVINGS',
    isPrimary: false
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await bankAccountAPI.getMyAccounts();
      setAccounts(data);
    } catch (error: any) {
      console.error('Failed to fetch bank accounts:', error);
      toast.error('Không thể tải danh sách tài khoản ngân hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        await bankAccountAPI.update(editingAccount.id, formData);
        toast.success('Cập nhật tài khoản thành công');
      } else {
        await bankAccountAPI.create(formData);
        toast.success('Thêm tài khoản thành công');
      }
      setShowModal(false);
      resetForm();
      fetchAccounts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleRequestVerify = async (id: string) => {
    try {
      await bankAccountAPI.verify(id);
      toast.success('Tài khoản đã được đánh dấu xác minh (hoặc yêu cầu đã gửi).');
      fetchAccounts();
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('Chỉ quản trị viên mới xác minh được. Liên hệ hỗ trợ nếu bạn cần gấp.');
      } else {
        toast.error(error.response?.data?.message || 'Không xác minh được tài khoản.');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa tài khoản này?')) return;
    
    try {
      await bankAccountAPI.delete(id);
      toast.success('Xóa tài khoản thành công');
      fetchAccounts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData({
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      accountHolderName: account.accountHolderName,
      branchName: account.branchName || '',
      accountType: account.accountType,
      isPrimary: account.isPrimary
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingAccount(null);
    setFormData({
      bankName: '',
      accountNumber: '',
      accountHolderName: '',
      branchName: '',
      accountType: 'SAVINGS',
      isPrimary: false
    });
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber;
    return '****' + accountNumber.slice(-4);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tài Khoản Ngân Hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý thông tin tài khoản ngân hàng của bạn</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Thêm tài khoản
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center border border-gray-200">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4 text-sm">Chưa có tài khoản ngân hàng nào</p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Thêm tài khoản đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:border-red-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{account.bankName}</h3>
                    {account.isPrimary && (
                      <span className="px-2.5 py-1 text-xs font-medium bg-red-50 text-red-600 rounded">
                        Chính
                      </span>
                    )}
                    {account.isVerified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <p className="text-gray-700">
                      <span className="text-gray-500">Số tài khoản:</span>{' '}
                      <span className="font-medium">{maskAccountNumber(account.accountNumber)}</span>
                    </p>
                    <p className="text-gray-700">
                      <span className="text-gray-500">Chủ tài khoản:</span>{' '}
                      <span className="font-medium">{account.accountHolderName}</span>
                    </p>
                    {account.branchName && (
                      <p className="text-gray-700">
                        <span className="text-gray-500">Chi nhánh:</span>{' '}
                        <span className="font-medium">{account.branchName}</span>
                      </p>
                    )}
                    <p className="text-gray-500 text-xs">
                      {account.accountType === 'SAVINGS' ? 'Tiết kiệm' : 
                       account.accountType === 'CHECKING' ? 'Thanh toán' : 'Vãng lai'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  {!account.isVerified && (
                    <button
                      type="button"
                      onClick={() => handleRequestVerify(account.id)}
                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Yêu cầu xác minh (admin)"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(account)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Sửa"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal thêm/sửa tài khoản */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              {editingAccount ? 'Sửa tài khoản' : 'Thêm tài khoản ngân hàng'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tên ngân hàng *
                </label>
                <input
                  type="text"
                  required
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                  placeholder="VD: Vietcombank"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Số tài khoản *
                </label>
                <input
                  type="text"
                  required
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                  placeholder="Nhập số tài khoản"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tên chủ tài khoản *
                </label>
                <input
                  type="text"
                  required
                  value={formData.accountHolderName}
                  onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                  placeholder="Nhập tên chủ tài khoản"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Chi nhánh
                </label>
                <input
                  type="text"
                  value={formData.branchName}
                  onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                  placeholder="VD: Chi nhánh Hà Nội"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Loại tài khoản
                </label>
                <select
                  value={formData.accountType}
                  onChange={(e) => setFormData({ ...formData, accountType: e.target.value as any })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                >
                  <option value="SAVINGS">Tiết kiệm</option>
                  <option value="CHECKING">Thanh toán</option>
                  <option value="CURRENT">Vãng lai</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500 border-gray-300"
                />
                <label htmlFor="isPrimary" className="text-sm text-gray-700">
                  Đặt làm tài khoản chính
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  {editingAccount ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAccountManagementPage;

