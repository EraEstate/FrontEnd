import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, Clock, XCircle, Eye, Loader2, Filter, Link as LinkIcon, FileText } from 'lucide-react';
import { propertyTransactionAPI, type PropertyTransaction } from '../api/propertyTransaction';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';
import { connectMetaMask, sendCreateDealTx } from '../utils/metamask';
import { REALESTATE_CONTRACT_ADDRESS, BLOCKCHAIN_EXPLORER_URL, BLOCKCHAIN_NETWORK_NAME } from '../config/blockchain';
import RealEstateEscrowAbi from '../abi/RealEstateEscrow.json';
import { useNavigate } from 'react-router-dom';

const TransactionHistoryPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<PropertyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [signingId, setSigningId] = useState<string | null>(null);

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

  const getBlockchainStatusBadge = (status?: PropertyTransaction['blockchainStatus']) => {
    if (!status || status === 'NOT_CREATED') {
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        label: 'Chưa có hợp đồng blockchain'
      };
    }

    const map: Record<NonNullable<PropertyTransaction['blockchainStatus']>, { bg: string; text: string; label: string }> = {
      NOT_CREATED: {
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        label: 'Chưa có hợp đồng blockchain'
      },
      PENDING_ONCHAIN: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Đang gửi lên blockchain'
      },
      ONCHAIN_CONFIRMED: {
        bg: 'bg-emerald-100',
        text: 'text-emerald-800',
        label: 'Đã ghi nhận trên blockchain'
      },
      ONCHAIN_FAILED: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Ghi nhận blockchain thất bại'
      },
      ONCHAIN_CANCELLED: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        label: 'Hợp đồng blockchain đã huỷ'
      }
    };
    return map[status];
  };

  const shortenHash = (hash: string) => {
    if (!hash) return '';
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const buildExplorerUrl = (txHash: string) => {
    if (!BLOCKCHAIN_EXPLORER_URL) return '';
    return `${BLOCKCHAIN_EXPLORER_URL.replace(/\/$/, '')}/tx/${txHash}`;
  };

  const handleSignOnChain = async (transaction: PropertyTransaction, isRent: boolean) => {
    try {
      if (!transaction.totalAmount) {
        toast.error('Không tìm thấy giá trị giao dịch để tạo hợp đồng blockchain');
        return;
      }

      if (!REALESTATE_CONTRACT_ADDRESS || REALESTATE_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
        toast.error('Chưa cấu hình địa chỉ smart contract bất động sản');
        return;
      }

      setSigningId(transaction.id);

      const buyerAddress = await connectMetaMask();

      // Demo: tạm thời dùng buyerAddress làm cả seller & buyer để đánh dấu on-chain.
      // Khi bạn mapping ví on-chain cho owner, hãy thay sellerAddress bằng ví chủ nhà.
      const sellerAddress = buyerAddress;

      const priceBigInt = BigInt(Math.round(transaction.totalAmount));

      const txHash = await sendCreateDealTx({
        contractAddress: REALESTATE_CONTRACT_ADDRESS,
        abi: RealEstateEscrowAbi as any[],
        sellerAddress,
        buyerAddress,
        propertyId: transaction.propertyId,
        price: priceBigInt,
        isRent
      });

      await propertyTransactionAPI.updateBlockchainTx(transaction.id, {
        txHash,
        contractAddress: REALESTATE_CONTRACT_ADDRESS,
        network: BLOCKCHAIN_NETWORK_NAME
      });

      toast.success('Đã tạo hợp đồng blockchain thành công');
      await fetchTransactions();
      // Điều hướng sang trang hợp đồng chi tiết để người dùng xem/in/lưu
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
            const blockchainBadge = getBlockchainStatusBadge(transaction.blockchainStatus);

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

                      {/* Blockchain section */}
                      <div className="pt-3 border-t border-dashed border-gray-200 mt-2 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${blockchainBadge.bg} ${blockchainBadge.text}`}>
                              {blockchainBadge.label}
                            </span>
                            {transaction.blockchainNetwork && (
                              <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                {transaction.blockchainNetwork}
                              </span>
                            )}
                          </div>
                          {transaction.blockchainTxHash && (
                            <button
                              type="button"
                              onClick={() => {
                                const url = buildExplorerUrl(transaction.blockchainTxHash!);
                                if (url) {
                                  window.open(url, '_blank');
                                } else {
                                  navigator.clipboard.writeText(transaction.blockchainTxHash!);
                                  toast.info('Đã copy transaction hash');
                                }
                              }}
                              className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700"
                            >
                              <LinkIcon className="w-3 h-3" />
                              <span>{shortenHash(transaction.blockchainTxHash)}</span>
                            </button>
                          )}
                        </div>

                        {/* Nút ký hợp đồng blockchain chỉ cho người mua, khi chưa có txHash và giao dịch chưa bị hủy/thất bại */}
                        {isBuyer &&
                          !transaction.blockchainTxHash &&
                          !['CANCELLED', 'FAILED', 'REFUNDED'].includes(transaction.status) && (
                            <button
                              type="button"
                              onClick={() =>
                                handleSignOnChain(
                                  transaction,
                                  transaction.paymentMethod === 'CASH' ? false : false
                                )
                              }
                              disabled={signingId === transaction.id}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                            >
                              {signingId === transaction.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3 h-3" />
                              )}
                              <span>Ký hợp đồng blockchain (MetaMask)</span>
                            </button>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    <button
                      onClick={() => window.open(`/properties/${transaction.propertyId}`, '_blank')}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xem tin bất động sản"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => navigate(`/transactions/${transaction.id}/contract`)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs flex items-center justify-center gap-1"
                      title="Xem hợp đồng giao dịch"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Hợp đồng</span>
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

