import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Loader2,
  FileText,
  Home,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { propertyTransactionAPI, type PropertyTransaction } from '../api/propertyTransaction';
import toast from '../utils/toast';
import { useAuthStore } from '../store/authStore';
import { connectMetaMask, depositToEscrow } from '../utils/metamask';
import {
  REALESTATE_CONTRACT_ADDRESS,
  BLOCKCHAIN_EXPLORER_URL,
  BLOCKCHAIN_NETWORK_NAME,
} from '../config/blockchain';
import RealEstateEscrowAbi from '../blockchain/RealEstateEscrow.json';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; label: string; icon: React.ReactNode }
> = {
  PENDING: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    label: 'Chờ thanh toán',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  PROCESSING: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    label: 'Đang xử lý',
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
  },
  PAID: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    label: 'Đã thanh toán',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  COMPLETED: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    label: 'Hoàn thành',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  FAILED: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    label: 'Thất bại',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
  CANCELLED: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    label: 'Đã hủy',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
  REFUNDED: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    label: 'Đã hoàn tiền',
    icon: <DollarSign className="w-3.5 h-3.5" />,
  },
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  BANK_TRANSFER: 'Chuyển khoản',
  VNPAY: 'VNPay',
  MOMO: 'MoMo',
  ZALOPAY: 'ZaloPay',
  CASH: 'Tiền mặt',
};

type PerspectiveFilter = 'ALL' | 'BUYER' | 'SELLER';

interface TransactionHistoryPageProps {
  /** Khi true: hiển thị link mở trang /my-transactions (dùng trong Profile) */
  embedded?: boolean;
}

const TransactionHistoryPage: React.FC<TransactionHistoryPageProps> = ({ embedded = false }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<PropertyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [perspectiveFilter, setPerspectiveFilter] = useState<PerspectiveFilter>('ALL');
  const [signingId, setSigningId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, filterStatus]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await propertyTransactionAPI.getMyTransactions(currentPage, 20);
      setTransactions(response.content || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      toast.error('Kh�ng th? t?i l?ch s? giao d?ch');
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

  const handleSignOnChain = async (transaction: PropertyTransaction, isRent: boolean) => {
    try {
      if (!transaction.totalAmount) {
        toast.error('Không tìm thấy giá trị giao dịch để tạo hợp đồng blockchain');
        return;
      }
      if (
        !REALESTATE_CONTRACT_ADDRESS ||
        REALESTATE_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000'
      ) {
        toast.error('Chưa cấu hình địa chỉ smart contract bất động sản');
        return;
      }
      setSigningId(transaction.id);
      const buyerAddress = await connectMetaMask();
      const sellerAddress = buyerAddress;
      const priceBigInt = BigInt(Math.round(transaction.totalAmount));
      const result = await depositToEscrow({
        contractAddress: REALESTATE_CONTRACT_ADDRESS,
        abi: RealEstateEscrowAbi.abi as any[],
        sellerAddress,
        propertyId: String(transaction.propertyId),
        price: priceBigInt,
        isRent,
      });
      const txHash = result.txHash;
      await propertyTransactionAPI.updateBlockchainTx(transaction.id, {
        txHash,
        contractAddress: REALESTATE_CONTRACT_ADDRESS,
        network: BLOCKCHAIN_NETWORK_NAME,
      });
      toast.success('Đã tạo hợp đồng blockchain thành công');
      await fetchTransactions();
      navigate(`/transactions/${transaction.id}/blockchain`);
    } catch (error: any) {
      toast.error('L?i k� giao d?ch blockchain');
      const msg =
        error?.message ||
        error?.data?.message ||
        'Không thể tạo hợp đồng blockchain. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setSigningId(null);
    }
  };

  const byPerspective = useMemo(() => {
    if (!user?.id) return transactions;
    if (perspectiveFilter === 'ALL') return transactions;
    if (perspectiveFilter === 'BUYER') {
      return transactions.filter((tx) => String(tx.buyerId) === String(user.id));
    }
    return transactions.filter((tx) => String(tx.sellerId) === String(user.id));
  }, [transactions, perspectiveFilter, user?.id]);

  const filteredTransactions = useMemo(() => {
    if (filterStatus === 'ALL') return byPerspective;
    return byPerspective.filter((tx) => tx.status === filterStatus);
  }, [byPerspective, filterStatus]);

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[320px] bg-white rounded-xl border border-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {embedded && (
        <div className="px-6 py-2.5 bg-red-50/70 border-b border-red-100 flex justify-end">
          <Link
            to="/my-transactions"
            className="text-sm font-medium text-red-700 hover:text-red-800 hover:underline"
          >
            {t('transaction.historyList.fullscreenLink')} →
          </Link>
        </div>
      )}
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h1 className="text-xl font-semibold text-gray-900">{t('transaction.historyList.title')}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{t('transaction.historyList.subtitle')}</p>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">{t('transaction.historyList.perspectiveLabel')}</span>
          <select
            value={perspectiveFilter}
            onChange={(e) => setPerspectiveFilter(e.target.value as PerspectiveFilter)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none min-w-[140px]"
          >
            <option value="ALL">{t('transaction.historyList.perspectiveAll')}</option>
            <option value="BUYER">{t('transaction.historyList.perspectiveBuyer')}</option>
            <option value="SELLER">{t('transaction.historyList.perspectiveSeller')}</option>
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">{t('transaction.historyList.statusLabel')}</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none min-w-[160px]"
          >
            <option value="ALL">{t('transaction.historyList.statusAll')}</option>
            {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">
              {transactions.length === 0 ? t('transaction.historyList.empty') : t('transaction.historyList.emptyFiltered')}
            </p>
            <p className="text-sm text-gray-500 mt-1">{t('transaction.historyList.emptyHint')}</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const statusCfg = STATUS_CONFIG[tx.status] || STATUS_CONFIG.PENDING;
            const isBuyer = String(tx.buyerId) === String(user?.id);
            const isSeller = String(tx.sellerId) === String(user?.id);
            const isRent = tx.property?.listingType === 'RENT';
            const showBlockchainBtn =
              isBuyer &&
              !tx.blockchainTxHash &&
              !['CANCELLED', 'FAILED', 'REFUNDED'].includes(tx.status);
            const isExpanded = expandedId === tx.id;

            return (
              <div
                key={tx.id}
                className="px-6 py-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <a
                    href={`/properties/${tx.propertyId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 w-20 h-20 rounded-lg bg-gray-100 overflow-hidden border border-gray-100"
                  >
                    {tx.property?.thumbnailUrl ? (
                      <img
                        src={tx.property.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Home className="w-8 h-8" />
                      </div>
                    )}
                  </a>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <a
                        href={`/properties/${tx.propertyId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-gray-900 hover:text-red-600 truncate max-w-[280px]"
                      >
                        {tx.property?.title || 'Bất động sản'}
                      </a>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.bg} ${statusCfg.text}`}
                      >
                        {statusCfg.icon}
                        {statusCfg.label}
                      </span>
                      {tx.property?.listingType && (
                        <span
                          className={
                            isRent
                              ? 'px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700'
                              : 'px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700'
                          }
                        >
                          {isRent ? 'Cho thuê' : 'Mua bán'}
                        </span>
                      )}
                      {perspectiveFilter === 'ALL' && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            isBuyer ? 'bg-violet-50 text-violet-800' : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {isBuyer ? t('transaction.historyList.roleBuyer') : t('transaction.historyList.roleSeller')}
                        </span>
                      )}
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mt-0.5">
                      {formatPrice(Number(tx.totalAmount))}
                      {isRent && (
                        <span className="text-sm font-normal text-gray-500">/tháng</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {PAYMENT_METHOD_LABEL[tx.paymentMethod] || tx.paymentMethod}
                      {tx.bankTransactionId && ` · ${tx.bankTransactionId}`}
                      {' · '}
                      <span suppressHydrationWarning>{new Date(tx.createdAt).toLocaleDateString('vi-VN')}</span>
                    </p>

                    {/* Blockchain: one line, optional sign button */}
                    {showBlockchainBtn && (
                      <div className="mt-2 flex items-center gap-2" suppressHydrationWarning>
                        <span className="text-xs text-gray-500">{t('transaction.historyList.notSignedBlockchain')}</span>
                        <button
                          type="button"
                          onClick={() => handleSignOnChain(tx, isRent)}
                          disabled={signingId === tx.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-60"
                        >
                          {signingId === tx.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <ExternalLink className="w-3 h-3" />
                          )}
                          {t('transaction.historyList.signMetamask')}
                        </button>
                      </div>
                    )}
                    {tx.blockchainTxHash && (
                      <a
                        href={
                          BLOCKCHAIN_EXPLORER_URL
                            ? `${BLOCKCHAIN_EXPLORER_URL.replace(/\/$/, '')}/tx/${tx.blockchainTxHash}`
                            : '#'
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                      >
                        {t('transaction.historyList.onChainRecorded')}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/transactions/${tx.id}/contract`)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      {t('transaction.historyList.viewContract')}
                    </button>
                    <a
                      href={`/properties/${tx.propertyId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      {t('transaction.historyList.viewProperty')}
                    </a>
                  </div>
                </div>

                {/* Expand: chi tiết (seller: thuế/phí/số tiền nhận; buyer: người bán) */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : tx.id)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                    {isExpanded ? t('transaction.historyList.collapse') : t('transaction.historyList.expandDetails')}
                  </button>
                  {isExpanded && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        {isSeller && (
                          <>
                            <div>
                              <p className="text-gray-500">Thuế</p>
                              <p className="font-medium text-gray-700">
                                -{formatPrice(Number(tx.taxAmount || 0))}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Phí dịch vụ</p>
                              <p className="font-medium text-gray-700">
                                -{formatPrice(Number(tx.serviceFee || 0))}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Phí nền tảng</p>
                              <p className="font-medium text-gray-700">
                                -{formatPrice(Number(tx.platformFee || 0))}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Bạn nhận</p>
                              <p className="font-semibold text-red-600">
                                {formatPrice(Number(tx.sellerAmount))}
                              </p>
                            </div>
                          </>
                        )}
                        {isBuyer && tx.seller && (
                          <p className="text-gray-600">
                            Người bán: <span className="font-medium">{tx.seller.fullName}</span>
                          </p>
                        )}
                        {isSeller && tx.buyer && (
                          <p className="text-gray-600">
                            Người mua: <span className="font-medium">{tx.buyer.fullName}</span>
                          </p>
                        )}
                      </div>
                    )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-center gap-2 border-t border-gray-100 bg-gray-50/30">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
          >
            {t('transaction.historyList.prevPage')}
          </button>
          <span className="text-sm text-gray-600">
            {t('transaction.historyList.pageOf', { current: currentPage + 1, total: totalPages })}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
          >
            {t('transaction.historyList.nextPage')}
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionHistoryPage;
