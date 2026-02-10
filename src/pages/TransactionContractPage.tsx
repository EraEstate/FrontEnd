import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Home,
  User,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Link as LinkIcon,
} from 'lucide-react';
import { propertyTransactionAPI, type PropertyTransaction } from '../api/propertyTransaction';
import { propertyAPI } from '../api/property';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import { connectMetaMask, sendCreateDealTx } from '../utils/metamask';
import { REALESTATE_CONTRACT_ADDRESS, BLOCKCHAIN_EXPLORER_URL, BLOCKCHAIN_NETWORK_NAME } from '../config/blockchain';
import RealEstateEscrowAbi from '../abi/RealEstateEscrow.json';

const TransactionContractPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [transaction, setTransaction] = useState<PropertyTransaction | null>(null);
  const [property, setProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const tx = await propertyTransactionAPI.getById(id);
        setTransaction(tx);
        if (tx.propertyId) {
          try {
            const prop = await propertyAPI.getById(tx.propertyId);
            setProperty(prop);
          } catch (e) {
            console.error('Failed to load property for contract page:', e);
          }
        }
      } catch (error: any) {
        console.error('Failed to load transaction:', error);
        toast.error('Không tìm thấy thông tin hợp đồng giao dịch.');
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const formatPrice = (price: number | undefined) => {
    if (!price && price !== 0) return '-';
    if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)} tỷ`;
    if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)} triệu`;
    return price.toLocaleString('vi-VN');
  };

  const buildExplorerUrl = (txHash: string) => {
    if (!BLOCKCHAIN_EXPLORER_URL) return '';
    return `${BLOCKCHAIN_EXPLORER_URL.replace(/\/$/, '')}/tx/${txHash}`;
  };

  const shortenHash = (hash: string) => {
    if (!hash) return '';
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const handleSignOnChain = async () => {
    if (!transaction || !user) return;

    if (!REALESTATE_CONTRACT_ADDRESS || REALESTATE_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      toast.error('Chưa cấu hình địa chỉ smart contract bất động sản.');
      return;
    }

    if (transaction.blockchainTxHash) {
      toast.info('Hợp đồng blockchain đã được tạo cho giao dịch này.');
      return;
    }

    try {
      setSigning(true);

      const buyerAddress = await connectMetaMask();
      // TODO: map ví on-chain của người bán; hiện tại dùng buyerAddress cho cả 2 để đánh dấu on-chain
      const sellerAddress = buyerAddress;

      const total = transaction.totalAmount;
      if (!total || Number.isNaN(total)) {
        toast.error('Không tìm thấy giá trị giao dịch để tạo hợp đồng blockchain.');
        return;
      }

      const priceBigInt = BigInt(Math.round(total));

      const txHash = await sendCreateDealTx({
        contractAddress: REALESTATE_CONTRACT_ADDRESS,
        abi: RealEstateEscrowAbi as any[],
        sellerAddress,
        buyerAddress,
        propertyId: transaction.propertyId,
        price: priceBigInt,
        isRent: property?.transactionType === 'RENT',
      });

      const updated = await propertyTransactionAPI.updateBlockchainTx(transaction.id, {
        txHash,
        contractAddress: REALESTATE_CONTRACT_ADDRESS,
        network: BLOCKCHAIN_NETWORK_NAME,
      });

      setTransaction(updated);
      toast.success('Đã ký hợp đồng blockchain thành công.');
    } catch (error: any) {
      console.error('Failed to sign on-chain from contract page:', error);
      const msg =
        error?.message ||
        error?.response?.data?.error ||
        'Không thể ký hợp đồng blockchain. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setSigning(false);
    }
  };

  if (loading || !transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  const isBuyer = user && transaction.buyerId === user.id;
  const isSeller = user && transaction.sellerId === user.id;
  const isParticipant = isBuyer || isSeller;

  const isRent = property?.transactionType === 'RENT';

  // Fallback thông tin các bên nếu backend không trả nested buyer/seller
  const sellerName =
    transaction.seller?.fullName ||
    property?.owner?.fullName ||
    property?.user?.fullName ||
    'Không rõ';
  const sellerEmail =
    transaction.seller?.email ||
    property?.owner?.email ||
    property?.user?.email ||
    undefined;

  const buyerName =
    transaction.buyer?.fullName ||
    (isBuyer ? user?.fullName || user?.email : undefined) ||
    'Không rõ';
  const buyerEmail =
    transaction.buyer?.email ||
    (isBuyer ? user?.email : undefined) ||
    undefined;

  const statusMap: Record<PropertyTransaction['status'], { label: string; color: string; icon: JSX.Element }> = {
    PENDING: { label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" /> },
    PROCESSING: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800', icon: <Loader2 className="w-4 h-4 animate-spin" /> },
    PAID: { label: 'Đã thanh toán', color: 'bg-purple-100 text-purple-800', icon: <DollarSign className="w-4 h-4" /> },
    COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
    FAILED: { label: 'Thất bại', color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> },
    CANCELLED: { label: 'Đã huỷ', color: 'bg-gray-100 text-gray-700', icon: <XCircle className="w-4 h-4" /> },
    REFUNDED: { label: 'Đã hoàn tiền', color: 'bg-orange-100 text-orange-800', icon: <DollarSign className="w-4 h-4" /> },
  };

  const blockchainStatus = transaction.blockchainStatus || 'NOT_CREATED';
  const blockchainMap: Record<
    NonNullable<PropertyTransaction['blockchainStatus']>,
    { label: string; color: string }
  > = {
    NOT_CREATED: { label: 'Chưa tạo', color: 'bg-gray-100 text-gray-600' },
    PENDING_ONCHAIN: { label: 'Đang gửi lên chain', color: 'bg-yellow-100 text-yellow-800' },
    ONCHAIN_CONFIRMED: { label: 'Đã ghi nhận on-chain', color: 'bg-emerald-100 text-emerald-800' },
    ONCHAIN_FAILED: { label: 'Ghi nhận thất bại', color: 'bg-red-100 text-red-800' },
    ONCHAIN_CANCELLED: { label: 'Hợp đồng on-chain đã huỷ', color: 'bg-gray-100 text-gray-700' },
  };

  const txStatus = statusMap[transaction.status];
  const chainStatus = blockchainMap[blockchainStatus as NonNullable<PropertyTransaction['blockchainStatus']>];

  const contractDate = new Date(transaction.createdAt).toLocaleDateString('vi-VN');
  const isOnChainConfirmed = blockchainStatus === 'ONCHAIN_CONFIRMED';

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-gray-600 hover:text-red-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Quay lại
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
              {isRent ? 'Hợp đồng thuê bất động sản' : 'Hợp đồng mua bán bất động sản'}
            </p>
            <h1 className="text-2xl font-bold text-gray-900">
              {transaction.property?.title || 'Hợp đồng giao dịch bất động sản'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Mã giao dịch: <span className="font-mono">{transaction.id}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${txStatus.color}`}
            >
              {txStatus.icon}
              {txStatus.label}
            </span>
            {chainStatus && (
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${chainStatus.color}`}
              >
                <Shield className="w-4 h-4" />
                {chainStatus.label}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main contract content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Property info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Home className="w-5 h-5 text-red-500" />
                  Thông tin bất động sản
                </h2>
              </div>
              <div className="space-y-1 text-sm text-gray-700">
                <p className="font-medium text-gray-900">
                  {property?.title || transaction.property?.title || 'Chưa có tiêu đề'}
                </p>
                <p className="text-gray-600">
                  Giá giao dịch:{' '}
                  <span className="font-semibold text-red-600">
                    {formatPrice(transaction.totalAmount)} VND
                    {isRent && <span className="text-gray-500"> / tháng</span>}
                  </span>
                </p>
                {property?.address && <p className="text-gray-600">Địa chỉ: {property.address}</p>}
              </div>
            </div>

            {/* Step 2: Parties */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-red-500" />
                  Các bên tham gia
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    Bên A - Người bán / cho thuê
                  </p>
                  <p className="font-semibold text-gray-900">
                    {sellerName}
                    {isSeller && <span className="ml-2 text-xs text-green-600">(Bạn)</span>}
                  </p>
                  {sellerEmail && <p className="text-gray-600 mt-1">Email: {sellerEmail}</p>}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    Bên B - Người mua / thuê
                  </p>
                  <p className="font-semibold text-gray-900">
                    {buyerName}
                    {isBuyer && <span className="ml-2 text-xs text-green-600">(Bạn)</span>}
                  </p>
                  {buyerEmail && <p className="text-gray-600 mt-1">Email: {buyerEmail}</p>}
                </div>
              </div>
            </div>

            {/* Step 3: Payment & terms */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-red-500" />
                  Điều khoản thanh toán
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-gray-600">
                    Tổng giá trị giao dịch:{' '}
                    <span className="font-semibold text-gray-900">
                      {formatPrice(transaction.totalAmount)} VND
                    </span>
                  </p>
                  {transaction.taxAmount > 0 && (
                    <p className="text-gray-600">
                      Thuế dự kiến:{' '}
                      <span className="font-semibold text-gray-900">
                        {formatPrice(transaction.taxAmount)} VND
                      </span>
                    </p>
                  )}
                  {transaction.serviceFee > 0 && (
                    <p className="text-gray-600">
                      Phí dịch vụ:{' '}
                      <span className="font-semibold text-gray-900">
                        {formatPrice(transaction.serviceFee)} VND
                      </span>
                    </p>
                  )}
                  {transaction.platformFee > 0 && (
                    <p className="text-gray-600">
                      Phí nền tảng:{' '}
                      <span className="font-semibold text-gray-900">
                        {formatPrice(transaction.platformFee)} VND
                      </span>
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600">
                    Dự kiến bên bán nhận:{' '}
                    <span className="font-semibold text-red-600">
                      {formatPrice(transaction.sellerAmount)} VND
                    </span>
                  </p>
                  <p className="text-gray-600">
                    Phương thức thanh toán:{' '}
                    <span className="font-semibold text-gray-900">
                      {transaction.paymentMethod === 'BANK_TRANSFER'
                        ? 'Chuyển khoản'
                        : transaction.paymentMethod === 'VNPAY'
                        ? 'VNPay'
                        : transaction.paymentMethod === 'MOMO'
                        ? 'MoMo'
                        : transaction.paymentMethod === 'ZALOPAY'
                        ? 'ZaloPay'
                        : 'Tiền mặt'}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    * Hợp đồng này chỉ mang tính chất ghi nhận giao dịch trong hệ thống và trên blockchain, không thay
                    thế cho hợp đồng công chứng hoặc văn bản pháp lý chính thức giữa hai bên.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Blockchain & actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  Trạng thái blockchain
                </h2>
                {isOnChainConfirmed && (
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="hidden lg:inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <span>In / Lưu PDF</span>
                  </button>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  Mạng:{' '}
                  <span className="font-semibold text-gray-900">
                    {transaction.blockchainNetwork || BLOCKCHAIN_NETWORK_NAME || 'Chưa xác định'}
                  </span>
                </p>
                <p className="text-gray-600">
                  Địa chỉ contract:{' '}
                  <span className="font-mono text-xs break-all">
                    {transaction.blockchainContractAddress || REALESTATE_CONTRACT_ADDRESS || 'Chưa thiết lập'}
                  </span>
                </p>
                {transaction.blockchainTxHash ? (
                  <p className="text-gray-600 flex items-center gap-1">
                    Tx hash:{' '}
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
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span className="font-mono text-xs">{shortenHash(transaction.blockchainTxHash)}</span>
                    </button>
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm">Hợp đồng chưa được ghi nhận trên blockchain.</p>
                )}
              </div>

              {isParticipant && !transaction.blockchainTxHash && !['CANCELLED', 'FAILED', 'REFUNDED'].includes(transaction.status) && (
                <button
                  type="button"
                  onClick={handleSignOnChain}
                  disabled={signing}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {signing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang ký hợp đồng bằng MetaMask...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Ký hợp đồng blockchain bằng MetaMask
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-sm text-gray-600">
              <h3 className="font-semibold text-gray-900 mb-2">Lưu ý pháp lý</h3>
              <p>
                Nền tảng hỗ trợ ghi nhận giao dịch trên blockchain để tăng tính minh bạch. Tuy nhiên, để hoàn tất mua
                bán/thuê bất động sản, hai bên vẫn cần thực hiện đầy đủ thủ tục pháp lý theo quy định (công chứng, sang
                tên, hợp đồng thuê, v.v.).
              </p>
            </div>

            {/* Printable paper-style contract preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-sm text-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Bản hợp đồng dạng giấy (rút gọn)</h3>
                {isOnChainConfirmed && (
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 lg:hidden"
                  >
                    <span>In / Lưu PDF</span>
                  </button>
                )}
              </div>
              <div className={`border border-gray-200 rounded-lg p-4 bg-white ${!isOnChainConfirmed ? 'opacity-60' : ''}`}>
                <p className="text-center font-semibold text-gray-900 uppercase mb-1">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </p>
                <p className="text-center text-gray-700 mb-4">Độc lập - Tự do - Hạnh phúc</p>

                <p className="text-center font-bold text-gray-900 mb-4 uppercase">
                  HỢP ĐỒNG {isRent ? 'THUÊ' : 'MUA BÁN'} BẤT ĐỘNG SẢN
                </p>

                <p className="mb-2">Hôm nay, ngày {contractDate}, tại ERA Estate Platform, chúng tôi gồm có:</p>

                <p className="mb-1 font-semibold">Bên A (Bên bán/Cho thuê): {sellerName}</p>
                {sellerEmail && <p className="mb-2 text-gray-600">Email: {sellerEmail}</p>}

                <p className="mb-1 font-semibold">Bên B (Bên mua/Thuê): {buyerName}</p>
                {buyerEmail && <p className="mb-4 text-gray-600">Email: {buyerEmail}</p>}

                <p className="mb-2 font-semibold">Điều 1. Thông tin bất động sản</p>
                <p className="mb-1">
                  1.1. Bất động sản giao dịch: <span className="font-medium">{property?.title || transaction.property?.title}</span>
                </p>
                {property?.address && (
                  <p className="mb-1">1.2. Địa chỉ: {property.address}</p>
                )}
                <p className="mb-3">
                  1.3. Giá trị giao dịch: <span className="font-semibold text-red-600">{formatPrice(transaction.totalAmount)} VND</span>
                  {isRent && ' (giá thuê dự kiến mỗi tháng)'}
                </p>

                <p className="mb-2 font-semibold">Điều 2. Giá trị hợp đồng và phương thức thanh toán</p>
                <p className="mb-1">
                  2.1. Giá trị tạm tính của hợp đồng là{' '}
                  <span className="font-semibold text-red-600">
                    {formatPrice(transaction.totalAmount)} VND
                  </span>
                  {isRent && ' (giá thuê dự kiến mỗi tháng)'}.{' '}
                  Mức giá này có thể được hai bên điều chỉnh, nhưng mọi thay đổi phải được lập thành văn bản.
                </p>
                <p className="mb-1">
                  2.2. Bên B thanh toán cho Bên A theo phương thức:{' '}
                  <span className="font-semibold">
                    {transaction.paymentMethod === 'BANK_TRANSFER'
                      ? 'Chuyển khoản ngân hàng'
                      : transaction.paymentMethod === 'VNPAY'
                      ? 'Thanh toán VNPay'
                      : transaction.paymentMethod === 'MOMO'
                      ? 'Thanh toán ví MoMo'
                      : transaction.paymentMethod === 'ZALOPAY'
                      ? 'Thanh toán ví ZaloPay'
                      : 'Tiền mặt'}
                  </span>
                  .
                </p>
                <p className="mb-3">
                  2.3. Các đợt thanh toán chi tiết, thời điểm bàn giao, nghĩa vụ thuế và phí khác sẽ do hai bên thống
                  nhất và thể hiện trong phụ lục hợp đồng/biên bản riêng hoặc hợp đồng công chứng.
                </p>

                <p className="mb-2 font-semibold">Điều 3. Quyền và nghĩa vụ của các bên</p>
                <p className="mb-1">
                  3.1. Bên A cam kết thông tin về bất động sản là trung thực, hợp pháp, đủ điều kiện giao dịch theo quy
                  định pháp luật; phối hợp cung cấp hồ sơ pháp lý, thực hiện thủ tục chuyển nhượng/cho thuê theo quy định.
                </p>
                <p className="mb-1">
                  3.2. Bên B cam kết đã xem xét kỹ hiện trạng bất động sản, đồng ý mua/thuê theo các thông tin đã được
                  cung cấp trên nền tảng ERA Estate; thanh toán đúng tiến độ, đủ số tiền theo thoả thuận.
                </p>
                <p className="mb-3">
                  3.3. Hai bên cam kết bảo mật các thông tin giao dịch, trừ trường hợp phải cung cấp theo yêu cầu của cơ
                  quan nhà nước có thẩm quyền.
                </p>

                <p className="mb-2 font-semibold">Điều 4. Bàn giao bất động sản và xử lý tranh chấp</p>
                <p className="mb-1">
                  4.1. Thời điểm, địa điểm bàn giao bất động sản, hiện trạng bàn giao và các trang thiết bị đi kèm sẽ
                  được ghi nhận trong biên bản bàn giao riêng giữa hai bên.
                </p>
                <p className="mb-3">
                  4.2. Mọi tranh chấp phát sinh từ hợp đồng này trước hết được giải quyết bằng thương lượng. Trường hợp
                  không đạt được thoả thuận, một trong hai bên có quyền khởi kiện tại Toà án có thẩm quyền theo quy định
                  pháp luật Việt Nam.
                </p>

                <p className="mb-2 text-xs text-gray-500">
                  * Bản hợp đồng này chỉ là bản rút gọn được sinh tự động từ hệ thống để tham khảo và lưu trữ trên
                  blockchain. Hợp đồng có giá trị pháp lý cuối cùng giữa hai bên là hợp đồng công chứng hoặc văn bản
                  pháp lý khác được ký trực tiếp ngoài hệ thống.
                </p>
                {!isOnChainConfirmed && (
                  <p className="mb-4 text-xs text-red-500 font-medium">
                    ** Để in/lưu hợp đồng chính thức, vui lòng ký hợp đồng blockchain bằng MetaMask ở khung bên phải.
                    Sau khi giao dịch on-chain được xác nhận, nút In/Lưu PDF sẽ được kích hoạt.
                  </p>
                )}

                <div className="grid grid-cols-2 gap-8 mt-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">BÊN A</p>
                    <p className="text-gray-600 text-xs">(Người bán/Cho thuê)</p>
                    <p className="mt-10 text-gray-500 text-xs italic">Ký, ghi rõ họ tên</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">BÊN B</p>
                    <p className="text-gray-600 text-xs">(Người mua/Thuê)</p>
                    <p className="mt-10 text-gray-500 text-xs italic">Ký, ghi rõ họ tên</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionContractPage;


