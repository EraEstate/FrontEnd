import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Home, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from '../utils/toast';

const PaymentSuccessPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId');

  useEffect(() => {
    // Show success toast
    toast.success('Thanh toán thành công! Gói dịch vụ đã được kích hoạt.');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Thanh toán thành công!
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          Gói dịch vụ của bạn đã được kích hoạt thành công. Bạn có thể bắt đầu đăng tin ngay bây giờ.
        </p>

        {/* Payment ID */}
        {paymentId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Mã giao dịch</p>
            <p className="text-sm font-mono text-gray-900">{paymentId}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/post-property')}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <Package className="w-5 h-5" />
            Đăng tin ngay
          </button>

          <button
            onClick={() => navigate('/my-properties')}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            Xem gói dịch vụ của tôi
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full text-gray-600 py-2 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;

