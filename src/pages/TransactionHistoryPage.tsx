import React, { useState, useEffect } from 'react';
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
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';
import { connectMetaMask, sendCreateDealTx } from '../utils/metamask';
import {
  REALESTATE_CONTRACT_ADDRESS,
  BLOCKCHAIN_EXPLORER_URL,
  BLOCKCHAIN_NETWORK_NAME,
} from '../config/blockchain';
import RealEstateEscrowAbi from '../abi/RealEstateEscrow.json';
import { useNavigate } from 'react-router-dom';

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

const TransactionHistoryPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<PropertyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
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
      const txHash = await sendCreateDealTx({
        contractAddress: REALESTATE_CONTRACT_ADDRESS,
        abi: RealEstateEscrowAbi as any[],
        sellerAddress,
        buyerAddress,
        propertyId: transaction.propertyId,
        price: priceBigInt,
        isRent,
      });
      await propertyTransactionAPI.updateBlockchainTx(transaction.id, {
        txHash,
        contractAddress: REALESTATE_CONTRACT_ADDRESS,
        network: BLOCKCHAIN_NETWORK_NAME,
      });
      toast.success('Đã tạo hợp đồng blockchain thành công');
      await fetchTransactions();
      navigate(`/transactions/${transaction.id}/contract`);
    } catch (error: any) {
      console.error('Error signing on-chain deal:', error);
      const msg =
        error?.message ||
        error?.data?.message ||
        'Không thể tạo hợp đồng blockchain. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setSigningId(null);
    }
  };

  const filteredTransactions =
    filterStatus === 'ALL'
      ? transactions
      : transactions.filter((t) => t.status === filterStatus);

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[320px] bg-white rounded-xl border border-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h1 className="text-xl font-semibold text-gray-900">Lịch sử giao dịch</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Xem và quản lý các giao dịch mua bán, cho thuê BĐS của bạn
        </p>
      </div>

      {/* Filter */}
      <div className="px-6 py-3 flex items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/50">
        <span className="text-sm text-gray-600">Trạng thái</span>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none min-w-[160px]"
        >
          <option value="ALL">Tất cả</option>
          {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">Chưa có giao dịch nào</p>
            <p className="text-sm text-gray-500 mt-1">Các giao dịch của bạn sẽ hiển thị tại đây</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const statusCfg = STATUS_CONFIG[tx.status] || STATUS_CONFIG.PENDING;
            const isBuyer = tx.buyerId === user?.id;
            const isSeller = tx.sellerId === user?.id;
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
                      {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                    </p>

                    {/* Blockchain: one line, optional sign button */}
                    {showBlockchainBtn && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-gray-500">Chưa ký blockchain</span>
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
                          Ký MetaMask
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
                        Đã ghi blockchain
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
                      Xem hợp đồng
                    </button>
                    <a
                      href={`/properties/${tx.propertyId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Xem BĐS
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
                    {isExpanded ? 'Thu gọn' : 'Chi tiết giao dịch'}
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
            Trước
          </button>
          <span className="text-sm text-gray-600">
            Trang {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionHistoryPage;
