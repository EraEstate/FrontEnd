import React, { useState, useEffect } from 'react';
import { X, CreditCard, Building2, Loader2, CheckCircle } from 'lucide-react';
import { listingPackageAPI } from '../api/misc';
import { bankAccountAPI } from '../api/bankAccount';
import toast from '../utils/toast';
import type { BankAccount } from '../types';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageData: {
    id: string;
    name: string;
    price: number;
  };
  billingPeriod: 'monthly' | 'yearly';
  onSuccess: () => void;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  packageData,
  billingPeriod,
  onSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'VNPAY' | 'MOMO'>('BANK_TRANSFER');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>('');
  const [bankTransactionId, setBankTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [step, setStep] = useState<'payment' | 'confirm'>('payment');

  useEffect(() => {
    if (isOpen) {
      // Luôn load bank accounts khi mở modal để check xem user có tài khoản chưa
      loadBankAccounts();
    }
  }, [isOpen]);

  const loadBankAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const accounts = await bankAccountAPI.getMyAccounts();
      setBankAccounts(accounts);
      const primary = accounts.find(acc => acc.isPrimary);
      if (primary) {
        setSelectedBankAccountId(primary.id);
      } else if (accounts.length > 0) {
        setSelectedBankAccountId(accounts[0].id);
      }
    } catch (error: any) {
      toast.error('Không thể tải danh sách tài khoản ngân hàng');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const calculatePrice = () => {
    if (billingPeriod === 'yearly') {
      return packageData.price * 12 * 0.8; // 12 tháng, giảm 20%
    }
    return packageData.price;
  };

  const handlePurchase = async () => {
    // Kiểm tra bắt buộc phải có tài khoản ngân hàng
    if (bankAccounts.length === 0) {
      toast.error('Vui lòng thêm tài khoản ngân hàng trước khi mua gói dịch vụ');
      return;
    }

    if (paymentMethod === 'BANK_TRANSFER' && !selectedBankAccountId) {
      toast.error('Vui lòng chọn tài khoản ngân hàng');
      return;
    }

    // Nếu dùng VNPay/MoMo nhưng chưa có bank account, vẫn yêu cầu thêm
    // (vì có thể cần để nhận tiền hoàn lại hoặc xác minh)
    if ((paymentMethod === 'VNPAY' || paymentMethod === 'MOMO') && bankAccounts.length === 0) {
      toast.error('Vui lòng thêm tài khoản ngân hàng trước khi thanh toán');
      return;
    }

    setLoading(true);
    try {
      const result = await listingPackageAPI.purchase(
        packageData.id,
        paymentMethod,
        selectedBankAccountId || bankAccounts[0]?.id, // Dùng selected hoặc tài khoản đầu tiên
        billingPeriod
      );

      setPaymentId(result.payment?.id || result.id);

      if (paymentMethod === 'BANK_TRANSFER') {
        // Chuyển sang bước xác nhận thanh toán
        setStep('confirm');
        toast.info('Vui lòng chuyển khoản và nhập mã giao dịch');
      } else {
        // VNPay/MoMo - redirect đến gateway
        const paymentUrl = result.paymentUrl || result.payment?.paymentUrl;
        if (paymentUrl) {
          toast.info('Đang chuyển hướng đến cổng thanh toán...');
          // Redirect đến payment gateway
          window.location.href = paymentUrl;
        } else {
          toast.error('Không thể tạo URL thanh toán. Vui lòng thử lại.');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể tạo đơn thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!bankTransactionId.trim()) {
      toast.error('Vui lòng nhập mã giao dịch');
      return;
    }

    if (!paymentId) {
      toast.error('Không tìm thấy thông tin thanh toán');
      return;
    }

    setLoading(true);
    try {
      await listingPackageAPI.confirmPayment(paymentId, bankTransactionId);
      toast.success('Thanh toán thành công! Gói dịch vụ đã được kích hoạt.');
      onSuccess();
      onClose();
      setStep('payment');
      setBankTransactionId('');
      setPaymentId(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Xác nhận thanh toán thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 'payment' ? 'Thanh toán gói dịch vụ' : 'Xác nhận thanh toán'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {step === 'payment' ? (
            <>
              {/* Package Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{packageData.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-red-600">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                      minimumFractionDigits: 0,
                    }).format(calculatePrice())}
                  </span>
                  <span className="text-gray-600 text-sm">
                    /{billingPeriod === 'yearly' ? 'năm' : 'tháng'}
                  </span>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-xs text-red-600 mt-1">
                    Tiết kiệm {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                      minimumFractionDigits: 0,
                    }).format(packageData.price * 12 * 0.2)} mỗi năm
                  </p>
                )}
              </div>

              {/* Bank Account Requirement Check */}
              {loadingAccounts ? (
                <div className="flex items-center justify-center p-4 border border-gray-200 rounded-lg">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Đang kiểm tra tài khoản ngân hàng...</span>
                </div>
              ) : bankAccounts.length === 0 ? (
                <div className="border-2 border-red-200 bg-red-50 rounded-lg p-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Building2 className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900 mb-1">
                        Chưa có tài khoản ngân hàng
                      </h4>
                      <p className="text-sm text-red-700 mb-4">
                        Bạn cần thêm tài khoản ngân hàng để có thể mua gói dịch vụ và thanh toán.
                      </p>
                      <button
                        onClick={() => {
                          onClose();
                          window.location.href = '/profile?tab=bank-accounts';
                        }}
                        className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                      >
                        Thêm tài khoản ngân hàng ngay
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Bank Account Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn tài khoản ngân hàng để thanh toán
                    </label>
                    <select
                      value={selectedBankAccountId}
                      onChange={(e) => setSelectedBankAccountId(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
                    >
                      {bankAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.bankName} - {account.accountNumber} ({account.accountHolderName})
                          {account.isPrimary && ' - Mặc định'}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Tài khoản này sẽ được sử dụng để thanh toán và nhận hoàn tiền (nếu có)
                    </p>
                  </div>
                </>
              )}

              {/* Payment Method - Chỉ hiển thị nếu đã có bank account */}
              {bankAccounts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Phương thức thanh toán
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setPaymentMethod('BANK_TRANSFER')}
                      className={`w-full p-4 border-2 rounded-lg transition-colors text-left ${
                        paymentMethod === 'BANK_TRANSFER'
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-900">Chuyển khoản ngân hàng</div>
                          <div className="text-xs text-gray-500">Thanh toán qua tài khoản ngân hàng</div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('VNPAY')}
                      className={`w-full p-4 border-2 rounded-lg transition-colors text-left ${
                        paymentMethod === 'VNPAY'
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-900">VNPay</div>
                          <div className="text-xs text-gray-500">Thanh toán online qua VNPay</div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('MOMO')}
                      className={`w-full p-4 border-2 rounded-lg transition-colors text-left ${
                        paymentMethod === 'MOMO'
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-900">MoMo</div>
                          <div className="text-xs text-gray-500">Thanh toán qua ví MoMo</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy
                </button>
                {bankAccounts.length > 0 ? (
                  <button
                    onClick={handlePurchase}
                    disabled={loading || !selectedBankAccountId}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      'Thanh toán'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onClose();
                      window.location.href = '/profile?tab=bank-accounts';
                    }}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Thêm tài khoản ngân hàng
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Confirmation Step */}
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Đã tạo đơn thanh toán
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Vui lòng chuyển khoản và nhập mã giao dịch để xác nhận
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã giao dịch ngân hàng
                </label>
                <input
                  type="text"
                  value={bankTransactionId}
                  onChange={(e) => setBankTransactionId(e.target.value)}
                  placeholder="Nhập mã giao dịch từ ngân hàng"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mã giao dịch thường có dạng: NAPAS-XXXXX hoặc số tham chiếu từ ngân hàng
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setStep('payment');
                    setBankTransactionId('');
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={loading || !bankTransactionId.trim()}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang xác nhận...
                    </>
                  ) : (
                    'Xác nhận thanh toán'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;

