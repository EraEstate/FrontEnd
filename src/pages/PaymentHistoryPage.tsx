import React from 'react';
import { CreditCard, Calendar, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useNewUserPayments } from '../api/hooks';
import { useTranslation } from 'react-i18next';

const priceFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

const PaymentHistoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: payments, loading, error, refetch } = useNewUserPayments(0, 20);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'FAILED':
        return 'Thất bại';
      case 'PENDING':
        return t('common.processing');
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const formatPrice = (price: number) => {
    return priceFormatter.format(price);
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'BANK_TRANSFER':
        return 'Chuyển khoản ngân hàng';
      case 'CREDIT_CARD':
        return 'Thẻ tín dụng';
      case 'E_WALLET':
        return 'Ví điện tử';
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 mt-10 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 text-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 mt-10 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-10">
      <div className="w-full max-w-6xl mx-auto px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center gap-x-3 mb-4">
            <CreditCard className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-semibold text-gray-900">Lịch sử thanh toán</h1>
          </div>
          <p className="text-gray-600">
            Theo dõi tất cả các giao dịch thanh toán của bạn trên nền tảng.
          </p>
        </div>

        {/* Payment History */}
        <div className="gap-y-4">
          {payments?.content?.length ? (
            payments.content.map((payment: any) => (
              <div key={payment.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-x-3">
                    {getStatusIcon(payment.paymentStatus)}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Gói {payment.packageId}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Mã giao dịch: {payment.transactionId || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">
                      {formatPrice(payment.amount)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {getPaymentMethodText(payment.paymentMethod)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {new Date(payment.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-x-2" suppressHydrationWarning>
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      Trạng thái: {getStatusText(payment.paymentStatus)}
                    </span>
                  </div>

                  <div className="flex items-center gap-x-2">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      Phương thức: {getPaymentMethodText(payment.paymentMethod)}
                    </span>
                  </div>
                </div>

                {payment.updatedAt && payment.updatedAt !== payment.createdAt && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      Cập nhật lần cuối: {new Date(payment.updatedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center" suppressHydrationWarning>
              <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chưa có giao dịch nào
              </h3>
              <p className="text-gray-600">
                Bạn chưa thực hiện bất kỳ giao dịch thanh toán nào trên nền tảng.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {payments && payments.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-x-2">
              {Array.from({ length: payments.totalPages }, (_, pageNumber) => pageNumber).map((pageNumber) => (
                <button
                  key={`page-btn-${pageNumber}`}
                  className={`px-3 py-2 rounded-lg ${
                    pageNumber === payments.number
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {pageNumber + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {payments?.content?.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Tóm tắt</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {payments.content.filter((p: any) => p.paymentStatus === 'COMPLETED').length}
                </div>
                <div className="text-sm text-gray-600">Giao dịch thành công</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {payments.content.filter((p: any) => p.paymentStatus === 'PENDING').length}
                </div>
                <div className="text-sm text-gray-600">Đang xử lý</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {payments.content.filter((p: any) => p.paymentStatus === 'FAILED').length}
                </div>
                <div className="text-sm text-gray-600">Thất bại</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatPrice(
                    payments.content
                      .filter((p: any) => p.paymentStatus === 'COMPLETED')
                      .reduce((sum: number, p: any) => sum + p.amount, 0)
                  )}
                </div>
                <div className="text-sm text-gray-600">Tổng tiền đã thanh toán</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
