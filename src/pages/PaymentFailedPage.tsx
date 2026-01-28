import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, RefreshCw, Home, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const PaymentFailedPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  useEffect(() => {
    // Show error toast
    toast.error(error || 'Thanh toán thất bại. Vui lòng thử lại.');
  }, [error]);

  const getErrorMessage = () => {
    if (error) return error;
    
    switch (code) {
      case '07':
        return 'Giao dịch bị từ chối. Vui lòng kiểm tra thông tin thẻ.';
      case '09':
        return 'Thẻ chưa được đăng ký sử dụng dịch vụ.';
      case '10':
        return 'Xác thực thông tin thẻ thất bại.';
      case '11':
        return 'Đã hết hạn chờ thanh toán. Vui lòng thử lại.';
      case '12':
        return 'Thẻ bị khóa. Vui lòng liên hệ ngân hàng.';
      case '51':
        return 'Không đủ số dư để thực hiện giao dịch.';
      default:
        return 'Thanh toán thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-100 p-4">
            <XCircle className="w-16 h-16 text-red-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Thanh toán thất bại
        </h1>

        {/* Error Message */}
        <p className="text-gray-600 mb-6">
          {getErrorMessage()}
        </p>

        {/* Error Code */}
        {code && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Mã lỗi</p>
            <p className="text-sm font-mono text-gray-900">{code}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/pricing')}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Thử lại thanh toán
          </button>

          <button
            onClick={() => navigate('/payments')}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            Xem lịch sử thanh toán
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

export default PaymentFailedPage;

