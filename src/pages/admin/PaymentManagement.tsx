import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, Plus, Edit2, Eye, Download,
  DollarSign, CreditCard, Calendar, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { paymentAPI } from '../../api/payment';
import toast from '../../utils/toast';

const PaymentManagement: React.FC = () => {
  const { t } = useTranslation();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState({
    revenue: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalCount: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, [currentPage, filterStatus]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [revenueRaw, completed, pending, failed, totalCount] = await Promise.all([
          paymentAPI.getTotalRevenue().catch(() => 0),
          paymentAPI.getPaymentsByStatus('COMPLETED', 0, 1).then((p: any) => p.totalElements ?? 0).catch(() => 0),
          paymentAPI.getPaymentsByStatus('PENDING', 0, 1).then((p: any) => p.totalElements ?? 0).catch(() => 0),
          paymentAPI.getPaymentsByStatus('FAILED', 0, 1).then((p: any) => p.totalElements ?? 0).catch(() => 0),
          paymentAPI.countPayments().catch(() => 0),
        ]);
        if (!alive) return;
        const revenueNum = typeof revenueRaw === 'string' ? parseFloat(revenueRaw) : Number(revenueRaw);
        setStats({
          revenue: Number.isFinite(revenueNum) ? revenueNum : 0,
          completed: Number(completed) || 0,
          pending: Number(pending) || 0,
          failed: Number(failed) || 0,
          totalCount: Number(totalCount) || 0,
        });
      } catch {
        if (alive) setStats({ revenue: 0, completed: 0, pending: 0, failed: 0, totalCount: 0 });
      } finally {
        if (alive) setStatsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response =
        filterStatus === 'ALL'
          ? await paymentAPI.getAllPayments(currentPage, 20)
          : await paymentAPI.getPaymentsByStatus(
              filterStatus as 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED',
              currentPage,
              20
            );
      setPayments(response.content || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      toast.error('Không thể tải danh sách thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: any }> = {
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      FAILED: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      REFUNDED: { bg: 'bg-blue-100', text: 'text-blue-800', icon: DollarSign },
      CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
    };
    return badges[status] || badges.PENDING;
  };

  const formatVnd = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(
      amount || 0
    );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.menu.payments')}</h1>
          <p className="text-sm text-gray-500 mt-1">Manage payment transactions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Payment
        </button>
      </div>

      {/* Stats Cards — từ API */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 opacity-80" />
            <span className="text-xs opacity-80">Doanh thu</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold mb-1 break-words">
            {statsLoading ? '…' : formatVnd(stats.revenue)}
          </div>
          <div className="text-sm opacity-80">Tổng (payments/revenue/total)</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 opacity-80" />
            <span className="text-xs opacity-80">Hoàn thành</span>
          </div>
          <div className="text-3xl font-bold mb-1">{statsLoading ? '…' : stats.completed}</div>
          <div className="text-sm opacity-80">Giao dịch COMPLETED</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 opacity-80" />
            <span className="text-xs opacity-80">Đang xử lý</span>
          </div>
          <div className="text-3xl font-bold mb-1">{statsLoading ? '…' : stats.pending}</div>
          <div className="text-sm opacity-80">Giao dịch PENDING</div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <XCircle className="w-8 h-8 opacity-80" />
            <span className="text-xs opacity-80">Thất bại</span>
          </div>
          <div className="text-3xl font-bold mb-1">{statsLoading ? '…' : stats.failed}</div>
          <div className="text-sm opacity-80">Tổng ghi nhận: {statsLoading ? '…' : stats.totalCount}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by transaction ID, user, or property..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(0);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Transaction ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Property</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Method</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((payment) => {
                  const status = getStatusBadge(payment.status);
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm text-gray-900">{payment.transactionId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{payment.userName || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{payment.userEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-[200px] truncate">
                          {payment.propertyTitle || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{formatVnd(Number(payment.amount))}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{payment.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {formatDate(payment.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm font-medium">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
