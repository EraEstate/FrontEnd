import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, Clock, XCircle, Eye, Loader2, Filter } from 'lucide-react';
import { propertyTransactionAPI, type PropertyTransaction } from '../api/propertyTransaction';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';

const TransactionHistoryPage: React.FC = () => {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<PropertyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, filterStatus]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await propertyTransactionAPI.getMyTransactions(
        currentPage,
        20
      );
      setTransactions(response.content || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Không thể tải lịch sử giao dịch');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)} tỷ`;
    if (price >= 1000000) return `${(price / 1000000).toFixed(0)} triệu`;
    return price.toLocaleString('vi-VN');
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      PENDING: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: <Clock className="w-4 h-4" />
      },
      PROCESSING: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: <Loader2 className="w-4 h-4 animate-spin" />
      },
      PAID: {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        icon: <DollarSign className="w-4 h-4" />
      },
      COMPLETED: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: <CheckCircle className="w-4 h-4" />
      },
      FAILED: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: <XCircle className="w-4 h-4" />
      },
      CANCELLED: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: <XCircle className="w-4 h-4" />
      },
      REFUNDED: {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        icon: <DollarSign className="w-4 h-4" />
      }
    };
    return styles[status] || styles.PENDING;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Chờ thanh toán',
      PROCESSING: 'Đang xử lý',
      PAID: 'Đã thanh toán',
      COMPLETED: 'Hoàn thành',
      FAILED: 'Thất bại',
      CANCELLED: 'Đã hủy',
      REFUNDED: 'Đã hoàn tiền'
    };
    return labels[status] || status;
  };

  const filteredTransactions = filterStatus === 'ALL' 
    ? transactions 
    : transactions.filter(t => t.status === filterStatus);

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Lịch Sử Giao Dịch</h1>
        <p className="text-sm text-gray-500 mt-1">Xem lịch sử mua bán bất động sản của bạn</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <Filter className="w-4 h-4 text-gray-500" />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors text-sm"
        >
          <option value="ALL">Tất cả</option>
          <option value="PENDING">Chờ thanh toán</option>
          <option value="PROCESSING">Đang xử lý</option>
          <option value="PAID">Đã thanh toán</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="FAILED">Thất bại</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center border border-gray-200">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Chưa có giao dịch nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => {
            const statusStyle = getStatusBadge(transaction.status);
            const isBuyer = transaction.buyerId === user?.id;
            const isSeller = transaction.sellerId === user?.id;

            return (
              <div
                key={transaction.id}
                className="bg-white border border-gray-200 rounded-lg p-5 hover:border-red-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {transaction.property?.title || 'Bất động sản'}
                      </h3>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1 ${statusStyle.bg} ${statusStyle.text}`}>
                        {statusStyle.icon}
                        {getStatusLabel(transaction.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Tổng tiền</p>
                        <p className="text-base font-semibold text-gray-900">
                          {formatPrice(transaction.totalAmount)}
                        </p>
                      </div>
                      {isSeller && (
                        <>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Thuế</p>
                            <p className="text-sm text-gray-700">
                              -{formatPrice(transaction.taxAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Phí dịch vụ</p>
                            <p className="text-sm text-gray-700">
                              -{formatPrice(transaction.serviceFee)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Phí nền tảng</p>
                            <p className="text-sm text-gray-700">
                              -{formatPrice(transaction.platformFee)}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {isSeller && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded mb-4">
                        <p className="text-xs text-gray-600 mb-1">Số tiền bạn nhận được</p>
                        <p className="text-lg font-bold text-red-600">
                          {formatPrice(transaction.sellerAmount)}
                        </p>
                      </div>
                    )}

                    <div className="text-sm text-gray-600 space-y-1.5 pt-3 border-t border-gray-100">
                      <p>
                        <span className="text-gray-500">Phương thức:</span>{' '}
                        <span className="font-medium">{
                          transaction.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' :
                          transaction.paymentMethod === 'VNPAY' ? 'VNPay' :
                          transaction.paymentMethod === 'MOMO' ? 'MoMo' :
                          transaction.paymentMethod === 'ZALOPAY' ? 'ZaloPay' : 'Tiền mặt'
                        }</span>
                      </p>
                      {isBuyer && transaction.seller && (
                        <p>
                          <span className="text-gray-500">Người bán:</span>{' '}
                          <span className="font-medium">{transaction.seller.fullName}</span>
                        </p>
                      )}
                      {isSeller && transaction.buyer && (
                        <p>
                          <span className="text-gray-500">Người mua:</span>{' '}
                          <span className="font-medium">{transaction.buyer.fullName}</span>
                        </p>
                      )}
                      {transaction.bankTransactionId && (
                        <p>
                          <span className="text-gray-500">Mã giao dịch:</span>{' '}
                          <span className="font-medium">{transaction.bankTransactionId}</span>
                        </p>
                      )}
                      <p className="text-xs text-gray-400 pt-2">
                        {new Date(transaction.createdAt).toLocaleString('vi-VN')}
                        {transaction.completedAt && (
                          <> • Hoàn thành: {new Date(transaction.completedAt).toLocaleString('vi-VN')}</>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="ml-4">
                    <button
                      onClick={() => window.open(`/properties/${transaction.propertyId}`, '_blank')}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xem property"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:text-red-600 transition-colors text-sm font-medium"
          >
            Trước
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Trang {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:text-red-600 transition-colors text-sm font-medium"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionHistoryPage;

