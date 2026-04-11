import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
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
  CreditCard,
  Info,
  PenTool,
  FileText,
  Download,
  Hash,
  Eye,
} from 'lucide-react';
import { propertyTransactionAPI, type PropertyTransaction } from '../api/propertyTransaction';
import { propertyAPI } from '../api/property';
import { useAuthStore } from '../store/authStore';
import toast from '../utils/toast';
import { connectMetaMask, depositToEscrow } from '../utils/metamask';
import { escrowAPI } from '../api/escrow';
import { kycAPI, type KycVerification } from '../api/kyc';
import { REALESTATE_CONTRACT_ADDRESS, BLOCKCHAIN_EXPLORER_URL, BLOCKCHAIN_NETWORK_NAME } from '../config/blockchain';
import { createVnpayPaymentUrl } from '../config/vnpay';
import RealEstateEscrowAbi from '../blockchain/RealEstateEscrow.json';
import { useTranslation } from 'react-i18next';
import { TransactionStepper } from '../components/TransactionStepper';
import SignatureCanvas from '../components/SignatureCanvas';
import { generateContractPdf, computeContractHash } from '../utils/contractPdf';

const TransactionContractPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const [transaction, setTransaction] = useState<PropertyTransaction | null>(null);
  const [property, setProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [payingVnpay, setPayingVnpay] = useState(false);
  const [showSignConfirm, setShowSignConfirm] = useState(false);
  const [signConsent, setSignConsent] = useState(false);
  const [privacyMaskContact, setPrivacyMaskContact] = useState(false);
  const [privacyHideRealName, setPrivacyHideRealName] = useState(false);

  // === E-Signature States ===
  const [buyerSignature, setBuyerSignature] = useState<string | null>(null);
  const [sellerSignature, setSellerSignature] = useState<string | null>(null);
  const [buyerKyc, setBuyerKyc] = useState<KycVerification | null>(null);
  const [sellerKyc, setSellerKyc] = useState<KycVerification | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [contractHash, setContractHash] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [savingHash, setSavingHash] = useState(false);

  const fetchTransaction = async () => {
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
          toast.error('Kh�ng th? t?i th�ng tin B�S');
        }
      }
    } catch (error: any) {
      toast.error('Kh�ng th? t?i giao d?ch');
      toast.error(t('transaction.errors.notFound'));
      navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaction();
  }, [id, navigate]);

  // Xử lý return từ VNPay: ?payment=vnpay&vnp_ResponseCode=00&vnp_TxnRef=...&vnp_TransactionNo=...
  useEffect(() => {
    const payment = searchParams.get('payment');
    const vnpResponseCode = searchParams.get('vnp_ResponseCode');
    const vnpTxnRef = searchParams.get('vnp_TxnRef');
    const vnpTransactionNo = searchParams.get('vnp_TransactionNo');
    if (payment !== 'vnpay' || !vnpTxnRef || !id) return;
    if (vnpResponseCode === '00') {
      (async () => {
        try {
          await propertyTransactionAPI.confirmPayment(vnpTxnRef, vnpTransactionNo || vnpTxnRef);
          toast.success(t('transaction.success.vnpayPaid'));
          setSearchParams({}, { replace: true });
          await fetchTransaction();
        } catch (e: any) {
          toast.error(e?.response?.data?.error || t('transaction.errors.signFailed'));
        }
      })();
    } else {
      toast.error(t('transaction.errors.vnpayFailed'));
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  // Fetch KYC data for both parties (for PDF generation)
  useEffect(() => {
    if (!transaction) return;
    const fetchKyc = async (userId: string, setter: (v: KycVerification | null) => void) => {
      try {
        const status = await kycAPI.getStatus(userId);
        if ('cccdNumber' in status) setter(status as KycVerification);
      } catch { /* no KYC data */ }
    };
    if (transaction.buyerId) fetchKyc(transaction.buyerId, setBuyerKyc);
    if (transaction.sellerId) fetchKyc(transaction.sellerId, setSellerKyc);
  }, [transaction?.buyerId, transaction?.sellerId]);

  // Set existing contract hash from transaction
  useEffect(() => {
    if (transaction?.contractHash) setContractHash(transaction.contractHash);
  }, [transaction?.contractHash]);

  // === E-Sign Handlers ===
  const handleGeneratePdf = useCallback(async () => {
    if (!transaction || !property) return;
    setGeneratingPdf(true);
    try {
      const blob = await generateContractPdf({
        transactionId: transaction.id,
        propertyTitle: property?.title || transaction.property?.title || 'Bất động sản',
        propertyAddress: property?.address,
        propertyArea: property?.area,
        totalAmount: transaction.totalAmount,
        sellerAmount: transaction.sellerAmount,
        taxAmount: transaction.taxAmount,
        serviceFee: transaction.serviceFee,
        paymentMethod: transaction.paymentMethod,
        isRent: property?.transactionType === 'RENT',
        contractDate: new Date(transaction.createdAt).toLocaleDateString('vi-VN'),
        sellerName: transaction.seller?.fullName || property?.owner?.fullName || 'Bên A',
        sellerEmail: transaction.seller?.email || property?.owner?.email,
        sellerKyc: sellerKyc,
        buyerName: transaction.buyer?.fullName || (user?.fullName || 'Bên B'),
        buyerEmail: transaction.buyer?.email || user?.email,
        buyerKyc: buyerKyc,
        sellerSignature,
        buyerSignature,
        blockchainTxHash: transaction.blockchainTxHash,
        blockchainNetwork: transaction.blockchainNetwork || BLOCKCHAIN_NETWORK_NAME,
      });

      const hash = await computeContractHash(blob);
      setContractHash(hash);

      const url = URL.createObjectURL(blob);
      setPdfBlobUrl(url);

      toast.success('Đã tạo PDF hợp đồng thành công!');
    } catch (err: any) {
      toast.error('L?i t?o PDF h?p d?ng');
      toast.error('Không thể tạo PDF: ' + (err?.message || 'Lỗi không xác định'));
    } finally {
      setGeneratingPdf(false);
    }
  }, [transaction, property, sellerKyc, buyerKyc, sellerSignature, buyerSignature, user]);

  const handleSaveContractHash = useCallback(async () => {
    if (!transaction || !contractHash || !id) return;
    setSavingHash(true);
    try {
      const isBuyerUser = user && String(transaction.buyerId) === String(user.id);
      const role = isBuyerUser ? 'BUYER' : 'SELLER';
      const updated = await propertyTransactionAPI.saveContractHash(id, { contractHash, signedByRole: role });
      setTransaction(updated);
      toast.success(`Chữ ký ${role === 'BUYER' ? 'Bên mua' : 'Bên bán'} đã được lưu trên hệ thống!`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Không thể lưu chữ ký');
    } finally {
      setSavingHash(false);
    }
  }, [transaction, contractHash, id, user]);

  const handleDownloadPdf = useCallback(() => {
    if (!pdfBlobUrl || !transaction) return;
    const a = document.createElement('a');
    a.href = pdfBlobUrl;
    a.download = `HopDong_${transaction.id.slice(0, 8)}.pdf`;
    a.click();
  }, [pdfBlobUrl, transaction]);

  const formatPrice = (price: number | undefined) => {
    if (!price && price !== 0) return '-';
    if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)} ${t('transaction.contract.priceUnitBillion')}`;
    if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)} ${t('transaction.contract.priceUnitMillion')}`;
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
      toast.error(t('transaction.errors.noContract'));
      return;
    }

    if (transaction.blockchainTxHash) {
      toast.info(t('transaction.errors.alreadyCreated'));
      return;
    }

    try {
      setSigning(true);

      // KYC check: yêu cầu xác minh CCCD trước khi giao dịch blockchain
      if (user?.id) {
        const isKycVerified = await kycAPI.isVerified(String(user.id)).catch(() => false);
        if (!isKycVerified) {
          toast.error('Bạn cần xác minh CCCD trước khi thực hiện giao dịch blockchain. Vui lòng truy cập trang Xác minh CCCD.');
          setSigning(false);
          return;
        }
      }

      const buyerAddress = await connectMetaMask();
      // TODO: map ví on-chain của người bán; hiện tại dùng buyerAddress cho cả 2 để đánh dấu on-chain
      const sellerAddress = buyerAddress;

      const total = transaction.totalAmount;
      if (!total || Number.isNaN(total)) {
        toast.error(t('transaction.errors.noAmount'));
        return;
      }

      const priceBigInt = BigInt(Math.round(total));

      const result = await depositToEscrow({
        contractAddress: REALESTATE_CONTRACT_ADDRESS,
        abi: RealEstateEscrowAbi.abi as any[],
        sellerAddress: sellerAddress,
        propertyId: String(transaction.propertyId),
        price: priceBigInt,
        isRent: property?.transactionType === 'RENT',
      });

      if (!result) throw new Error('Không nhận được kết quả từ MetaMask');

      // Ghi log vào Backend Escrow Service
      await escrowAPI.logTransaction({
        txHash: result.txHash,
        propertyId: Number(transaction.propertyId),
        buyerAddress,
        sellerAddress,
        amount: total,
        status: 'LOCKED'
      });

      const updated = await propertyTransactionAPI.updateBlockchainTx(transaction.id, {
        txHash: result.txHash,
        contractAddress: REALESTATE_CONTRACT_ADDRESS,
        network: BLOCKCHAIN_NETWORK_NAME,
      });

      setTransaction(updated);
      toast.success(t('transaction.success.signed'));
      // Điều hướng người dùng tới Escrow Dashboard để xem trạng thái giao dịch
      navigate('/escrow');
    } catch (error: any) {
      toast.error('L?i k� h?p d?ng blockchain');
      
      // Detect specific error types
      let errorMessage = t('transaction.errors.signFailed');
      
      const errorMsg = error?.message || '';
      
      // RPC errors
      if (error?.code === -32002 || 
          errorMsg.includes('RPC endpoint') || 
          errorMsg.includes('too many errors') ||
          errorMsg.includes('RPC_ENDPOINT_ERROR')) {
        errorMessage = `${t('transaction.errors.rpcError')}\n${t('transaction.errors.rpcErrorDetails')}`;
      }
      // User rejected
      else if (error?.code === 4001 || 
               error?.code === 'ACTION_REJECTED' || 
               errorMsg.includes('USER_REJECTED') ||
               errorMsg.includes('rejected') || 
               errorMsg.includes('denied') ||
               errorMsg.includes('từ chối')) {
        errorMessage = t('transaction.errors.userRejected');
      }
      // Insufficient funds
      else if (error?.code === -32000 || 
               errorMsg.includes('INSUFFICIENT_FUNDS') ||
               errorMsg.includes('insufficient funds') || 
               errorMsg.includes('insufficient balance') ||
               errorMsg.includes('Số dư không đủ')) {
        errorMessage = t('transaction.errors.insufficientFunds');
      }
      // Network errors
      else if (error?.code === 'NETWORK_ERROR' || 
               errorMsg.includes('network') || 
               errorMsg.includes('connection') ||
               errorMsg.includes('ECONNREFUSED')) {
        errorMessage = t('transaction.errors.networkError');
      }
      // Other errors - try to extract meaningful message
      else if (error?.message) {
        // Remove error prefixes like "RPC_ENDPOINT_ERROR:" for cleaner display
        errorMessage = error.message.replace(/^(RPC_ENDPOINT_ERROR|USER_REJECTED|INSUFFICIENT_FUNDS):\s*/i, '');
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error(errorMessage, {
        duration: errorMessage.includes('\n') ? 10000 : 5000,
      });
    } finally {
      setSigning(false);
    }
  };

  const handlePayWithVnpay = async () => {
    if (!transaction || !id) return;
    const total = transaction.totalAmount;
    if (!total || Number.isNaN(total)) {
      toast.error(t('transaction.errors.noAmount'));
      return;
    }
    try {
      setPayingVnpay(true);
      const returnUrl = `${window.location.origin}/transactions/${id}/blockchain?payment=vnpay`;
      const paymentUrl = await createVnpayPaymentUrl({
        transactionId: id,
        amount: total,
        returnUrl,
      });
      window.location.href = paymentUrl;
    } catch (e: any) {
      toast.error(e?.message || t('transaction.errors.vnpayCreateFailed'));
      setPayingVnpay(false);
    }
  };

  if (loading || !transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  const isBuyer = user && String(transaction.buyerId) === String(user.id);
  const isSeller = user && String(transaction.sellerId) === String(user.id);
  const isParticipant = isBuyer || isSeller;

  const isRent = property?.transactionType === 'RENT';

  // Fallback thông tin các bên nếu backend không trả nested buyer/seller
  const sellerName =
    transaction.seller?.fullName ||
    property?.owner?.fullName ||
    property?.user?.fullName ||
    t('transaction.review.unknown');
  const sellerEmail =
    transaction.seller?.email ||
    property?.owner?.email ||
    property?.user?.email ||
    undefined;

  const buyerName =
    transaction.buyer?.fullName ||
    (isBuyer ? user?.fullName || user?.email : undefined) ||
    t('transaction.review.unknown');
  const buyerEmail =
    transaction.buyer?.email ||
    (isBuyer ? user?.email : undefined) ||
    undefined;

  const statusMap: Record<PropertyTransaction['status'], { label: string; color: string; icon: JSX.Element }> = {
    PENDING: { label: t('transaction.status.pending'), color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" /> },
    PROCESSING: { label: t('transaction.status.processing'), color: 'bg-blue-100 text-blue-800', icon: <Loader2 className="w-4 h-4 animate-spin" /> },
    PAID: { label: t('transaction.status.paid'), color: 'bg-purple-100 text-purple-800', icon: <DollarSign className="w-4 h-4" /> },
    COMPLETED: { label: t('transaction.status.completed'), color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
    FAILED: { label: t('transaction.status.failed'), color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> },
    CANCELLED: { label: t('transaction.status.cancelled'), color: 'bg-gray-100 text-gray-700', icon: <XCircle className="w-4 h-4" /> },
    REFUNDED: { label: t('transaction.status.refunded'), color: 'bg-orange-100 text-orange-800', icon: <DollarSign className="w-4 h-4" /> },
  };

  const blockchainStatus = transaction.blockchainStatus || 'NOT_CREATED';
  const blockchainMap: Record<
    NonNullable<PropertyTransaction['blockchainStatus']>,
    { label: string; color: string }
  > = {
    NOT_CREATED: { label: t('transaction.blockchainStatus.notCreated'), color: 'bg-gray-100 text-gray-600' },
    PENDING_ONCHAIN: { label: t('transaction.blockchainStatus.pending'), color: 'bg-yellow-100 text-yellow-800' },
    ONCHAIN_CONFIRMED: { label: t('transaction.blockchainStatus.confirmed'), color: 'bg-emerald-100 text-emerald-800' },
    ONCHAIN_FAILED: { label: t('transaction.blockchainStatus.failed'), color: 'bg-red-100 text-red-800' },
    ONCHAIN_CANCELLED: { label: t('transaction.blockchainStatus.cancelled'), color: 'bg-gray-100 text-gray-700' },
  };

  const txStatus = statusMap[transaction.status];
  const chainStatus = blockchainMap[blockchainStatus as NonNullable<PropertyTransaction['blockchainStatus']>];

  const contractDate = new Date(transaction.createdAt).toLocaleDateString('vi-VN');
  const isOnChainConfirmed = blockchainStatus === 'ONCHAIN_CONFIRMED';
  const isPaidOrCompleted = ['PAID', 'COMPLETED'].includes(transaction.status);
  const isVnpayPaid = transaction.paymentMethod === 'VNPAY' && isPaidOrCompleted;
  const isContractReady = isOnChainConfirmed || isVnpayPaid;
  // Demo mode: cho phép ký on-chain miễn là bạn là 1 trong hai bên và giao dịch chưa bị huỷ/thất bại,
  // chưa có txHash. Nếu muốn siết lại sau chỉ cần thêm điều kiện status (PAID/COMPLETED) ở đây.
  const canSignOnChain =
    isParticipant &&
    !transaction.blockchainTxHash &&
    !['CANCELLED', 'FAILED', 'REFUNDED'].includes(transaction.status) &&
    !isVnpayPaid; // Đã thanh toán VNPay thì không hiện nút ký MetaMask

  const canPayVnpay =
    isParticipant &&
    transaction.paymentMethod === 'VNPAY' &&
    transaction.status === 'PENDING' &&
    !['CANCELLED', 'FAILED', 'REFUNDED'].includes(transaction.status);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-gray-600 hover:text-red-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t('transaction.back')}
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
              {isRent ? t('transaction.rentContract') : t('transaction.saleContract')}
            </p>
            <h1 className="text-2xl font-bold text-gray-900">
              {transaction.property?.title || t('transaction.title')}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {t('transaction.transactionId')}: <span className="font-mono">{transaction.id}</span>
            </p>
            <div className="mt-3">
              <TransactionStepper current={3} />
            </div>
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
            {isContractReady && (
              <button
                type="button"
                onClick={() => navigate('/')}
                className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <span>{t('transaction.backToHome')}</span>
              </button>
            )}
          </div>
        </div>

        {/* VNPay: Các bước đã hoàn thành + thông báo hợp đồng có hiệu lực */}
        {isVnpayPaid && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t('transaction.vnpaySuccessTitle')}</h2>
                <p className="text-sm text-gray-600">{t('transaction.vnpaySuccessSubtitle')}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 rounded-lg bg-white/80 p-3 border border-blue-100">
                <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t('transaction.vnpayStep1')}</p>
                  <p className="text-xs text-gray-600">{t('transaction.vnpayStep1Desc')}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 ml-auto" />
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white/80 p-3 border border-blue-100">
                <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t('transaction.vnpayStep2')}</p>
                  <p className="text-xs text-gray-600">{t('transaction.vnpayStep2Desc')}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 ml-auto" />
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white/80 p-3 border border-blue-100">
                <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t('transaction.vnpayStep3')}</p>
                  <p className="text-xs text-gray-600">{t('transaction.vnpayStep3Desc')}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 ml-auto" />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-700 bg-white/60 rounded-lg px-4 py-2 border border-blue-100">
              {t('transaction.vnpayContractReady')}
            </p>
          </div>
        )}

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
                  {t('transaction.propertyInfo')}
                </h2>
              </div>
              <div className="space-y-1 text-sm text-gray-700">
                <p className="font-medium text-gray-900">
                  {property?.title || transaction.property?.title || t('transaction.contract.noTitle')}
                </p>
                <p className="text-gray-600">
                  {t('transaction.totalAmount')}:{' '}
                  <span className="font-semibold text-red-600">
                    {formatPrice(transaction.totalAmount)} VND
                    {isRent && <span className="text-gray-500"> / {t('common.month', 'tháng')}</span>}
                  </span>
                </p>
                {property?.address && <p className="text-gray-600">{t('common.address', 'Địa chỉ')}: {property.address}</p>}
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
                  {t('transaction.parties')}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    {t('transaction.seller')}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {sellerName}
                    {isSeller && <span className="ml-2 text-xs text-green-600">{t('transaction.you')}</span>}
                  </p>
                  {sellerEmail && <p className="text-gray-600 mt-1">{t('common.email')}: {sellerEmail}</p>}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    {t('transaction.buyer')}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {buyerName}
                    {isBuyer && <span className="ml-2 text-xs text-green-600">{t('transaction.you')}</span>}
                  </p>
                  {buyerEmail && <p className="text-gray-600 mt-1">{t('common.email')}: {buyerEmail}</p>}
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
                  {t('transaction.paymentTerms')}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-gray-600">
                    {t('transaction.totalAmount')}:{' '}
                    <span className="font-semibold text-gray-900">
                      {formatPrice(transaction.totalAmount)} VND
                    </span>
                  </p>
                  {transaction.taxAmount > 0 && (
                    <p className="text-gray-600">
                      {t('transaction.taxAmount')}:{' '}
                      <span className="font-semibold text-gray-900">
                        {formatPrice(transaction.taxAmount)} VND
                      </span>
                    </p>
                  )}
                  {transaction.serviceFee > 0 && (
                    <p className="text-gray-600">
                      {t('transaction.serviceFee')}:{' '}
                      <span className="font-semibold text-gray-900">
                        {formatPrice(transaction.serviceFee)} VND
                      </span>
                    </p>
                  )}
                  {transaction.platformFee > 0 && (
                    <p className="text-gray-600">
                      {t('transaction.platformFee')}:{' '}
                      <span className="font-semibold text-gray-900">
                        {formatPrice(transaction.platformFee)} VND
                      </span>
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600">
                    {t('transaction.sellerAmount')}:{' '}
                    <span className="font-semibold text-red-600">
                      {formatPrice(transaction.sellerAmount)} VND
                    </span>
                  </p>
                  <p className="text-gray-600">
                    {t('transaction.paymentMethod')}:{' '}
                    <span className="font-semibold text-gray-900">
                      {transaction.paymentMethod === 'BANK_TRANSFER'
                        ? t('transaction.bankTransfer')
                        : transaction.paymentMethod === 'VNPAY'
                        ? t('transaction.vnpay')
                        : transaction.paymentMethod === 'MOMO'
                        ? t('transaction.momo')
                        : transaction.paymentMethod === 'ZALOPAY'
                        ? t('transaction.zalopay')
                        : t('transaction.cash')}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    * {t('transaction.disclaimer')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Quy trình & Blockchain actions */}
          <div className="space-y-4">
            {/* Badge phân biệt VNPay / Blockchain */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-4 text-xs text-gray-700 flex items-start gap-2">
              <Info className="w-4 h-4 text-red-500 mt-0.5" />
              <div>
                {isVnpayPaid ? (
                  <>
                    <p className="font-semibold text-gray-900 mb-1">
                      Hợp đồng đã hiệu lực theo thanh toán VNPay
                    </p>
                    <p>
                      Thanh toán VNPay thành công là căn cứ chính trong hệ thống. Ký Blockchain là
                      <span className="font-semibold"> tuỳ chọn</span> nếu bạn muốn thêm lớp ghi nhận
                      on-chain.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-gray-900 mb-1">
                      Ký hợp đồng Blockchain bằng MetaMask
                    </p>
                    <p>
                      Giao dịch trên Blockchain giúp minh bạch hơn, nhưng{' '}
                      <span className="font-semibold">vẫn cần</span> hợp đồng công chứng và thủ tục
                      sang tên ngoài đời thực.
                    </p>
                  </>
                )}
              </div>
            </div>
            {/* Step overview: VNPay flow (3 bước) hoặc Blockchain flow (4 bước) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-sm text-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                {isVnpayPaid ? t('transaction.vnpayProcessTitle') : t('transaction.processTitle')}
              </h2>
              {isVnpayPaid ? (
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">1</div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{t('transaction.vnpayStep1')}</p>
                      <p className="text-gray-600 text-xs mt-0.5">{t('transaction.vnpayStep1Desc')}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">2</div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{t('transaction.vnpayStep2')}</p>
                      <p className="text-gray-600 text-xs mt-0.5">{t('transaction.vnpayStep2Desc')}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">3</div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{t('transaction.vnpayStep3')}</p>
                      <p className="text-gray-600 text-xs mt-0.5">{t('transaction.vnpayStep3Desc')}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  </li>
                </ol>
              ) : (
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 h-6 w-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-semibold">1</div>
                    <div>
                      <p className="font-semibold text-gray-900">{t('transaction.step1')}</p>
                      <p className="text-gray-600 text-xs mt-0.5">{t('transaction.step1Desc')}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 h-6 w-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-semibold">2</div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {t('transaction.step2')}{' '}
                        {isPaidOrCompleted ? (
                          <span className="ml-1 inline-flex px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-medium">
                            {t('transaction.step2Completed')}
                          </span>
                        ) : (
                          <span className="ml-1 inline-flex px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-[11px] font-medium">
                            {t('transaction.step2Pending')}
                          </span>
                        )}
                      </p>
                      <p className="text-gray-600 text-xs mt-0.5">{t('transaction.step2Desc')}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 h-6 w-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-semibold">3</div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {t('transaction.step3')}{' '}
                        {transaction.blockchainTxHash ? (
                          <span className="ml-1 inline-flex px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-medium">
                            {t('transaction.step3Sent')}
                          </span>
                        ) : canSignOnChain ? (
                          <span className="ml-1 inline-flex px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-medium">
                            {t('transaction.step3Ready')}
                          </span>
                        ) : (
                          <span className="ml-1 inline-flex px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-medium">
                            {t('transaction.step3NotReady')}
                          </span>
                        )}
                      </p>
                      <p className="text-gray-600 text-xs mt-0.5">
                        {t('transaction.step3Desc', { network: BLOCKCHAIN_NETWORK_NAME })}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 h-6 w-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-semibold">4</div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {t('transaction.step4')}{' '}
                        {isContractReady ? (
                          <span className="ml-1 inline-flex px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-medium">
                            {t('transaction.step4Ready')}
                          </span>
                        ) : (
                          <span className="ml-1 inline-flex px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-medium">
                            {t('transaction.step4Waiting')}
                          </span>
                        )}
                      </p>
                      <p className="text-gray-600 text-xs mt-0.5">{t('transaction.step4Desc')}</p>
                    </div>
                  </li>
                </ol>
              )}
            </div>

            {/* Nhật ký giao dịch (audit trail đơn giản) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-sm text-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Nhật ký giao dịch</h2>
              <ol className="relative border-l border-gray-200 ml-2 space-y-3 text-xs">
                <li className="ml-4">
                  <div className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-red-500 border border-white" />
                  <p className="font-semibold text-gray-900">Tạo giao dịch trên hệ thống</p>
                  <p className="text-gray-600">
                    ERA Estate ghi nhận thông tin bất động sản, giá trị giao dịch và các khoản phí dự kiến.
                  </p>
                </li>
                {isVnpayPaid && (
                  <li className="ml-4">
                    <div className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-blue-500 border border-white" />
                    <p className="font-semibold text-gray-900">Thanh toán VNPay thành công</p>
                    <p className="text-gray-600">
                      Cổng VNPay xác nhận thanh toán, hệ thống cập nhật trạng thái giao dịch là Đã thanh toán.
                    </p>
                  </li>
                )}
                {transaction.blockchainTxHash && (
                  <li className="ml-4">
                    <div className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-emerald-500 border border-white" />
                    <p className="font-semibold text-gray-900">Ghi nhận hợp đồng trên Blockchain</p>
                    <p className="text-gray-600">
                      Một giao dịch on-chain với Tx Hash {shortenHash(transaction.blockchainTxHash)} đã được gửi lên{' '}
                      {transaction.blockchainNetwork || BLOCKCHAIN_NETWORK_NAME}.
                    </p>
                  </li>
                )}
              </ol>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {isVnpayPaid ? (
                    <>
                      <CreditCard className="w-5 h-5 text-blue-500" />
                      {t('transaction.vnpayStatusTitle')}
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 text-red-500" />
                      {t('transaction.blockchainStatusTitle')}
                    </>
                  )}
                </h2>
              {isContractReady && (
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="hidden lg:inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <span>{t('transaction.printButton')}</span>
                  </button>
                )}
              </div>
              {isVnpayPaid ? (
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    {t('transaction.vnpayPaidAt')}:{' '}
                    <span className="font-semibold text-emerald-700">{t('transaction.status.paid')}</span>
                  </p>
                  {transaction.bankTransactionId && (
                    <p className="text-gray-600">
                      {t('transaction.vnpayTransactionId')}:{' '}
                      <span className="font-mono text-xs">{transaction.bankTransactionId}</span>
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">{t('transaction.vnpayContractNote')}</p>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-xs text-gray-600 border border-blue-100 bg-blue-50 rounded-lg p-2">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                    <p>
                      <span className="font-semibold">Blockchain</span> là sổ cái phân tán ghi lại giao dịch.
                      Ký bằng <span className="font-semibold">MetaMask</span> sẽ tạo một giao dịch on-chain (Tx Hash)
                      có thể tra cứu trên trình khám phá mạng (explorer).
                    </p>
                  </div>
                  <p className="text-gray-600">
                    {t('transaction.network')}:{' '}
                    <span className="font-semibold text-gray-900">
                      {transaction.blockchainNetwork || BLOCKCHAIN_NETWORK_NAME || t('common.unknown')}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    {t('transaction.contractAddress')}:{' '}
                    <span className="font-mono text-xs break-all">
                      {transaction.blockchainContractAddress || REALESTATE_CONTRACT_ADDRESS || t('common.notSelected')}
                    </span>
                  </p>
                  {transaction.blockchainTxHash ? (
                    <p className="text-gray-600 flex items-center gap-1">
                      {t('transaction.txHash')}:{' '}
                      <button
                        type="button"
                        onClick={() => {
                          const url = buildExplorerUrl(transaction.blockchainTxHash!);
                          if (url) {
                            window.open(url, '_blank');
                          } else {
                            navigator.clipboard.writeText(transaction.blockchainTxHash!);
                            toast.info(t('transaction.success.hashCopied'));
                          }
                        }}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        title="Tx Hash là mã giao dịch trên blockchain, dùng để tra cứu chi tiết giao dịch."
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span className="font-mono text-xs">{shortenHash(transaction.blockchainTxHash)}</span>
                      </button>
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm">{t('transaction.notCreated')}</p>
                  )}
                </div>
              )}

              {canPayVnpay && (
                <button
                  type="button"
                  onClick={handlePayWithVnpay}
                  disabled={payingVnpay}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {payingVnpay ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('transaction.vnpayRedirecting')}
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      {t('transaction.payWithVnpay')}
                    </>
                  )}
                </button>
              )}
              {canSignOnChain && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5" title="Không ký nếu bạn đang dùng máy công cộng hoặc mạng không tin tưởng.">
                    ⚠️ Không ký nếu bạn đang dùng máy công cộng / không tin tưởng network.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSignConsent(false);
                      setShowSignConfirm(true);
                    }}
                    disabled={signing}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    title="Không ký nếu bạn đang dùng máy công cộng hoặc mạng không tin tưởng."
                  >
                  {signing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('transaction.signing')}
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      {t('transaction.signButton')}
                    </>
                  )}
                </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-sm text-gray-600">
              <h3 className="font-semibold text-gray-900 mb-2">{t('transaction.legalNote')}</h3>
              <p>
                {t('transaction.legalNoteText')}
              </p>
              <p className="mt-2 text-xs">
                Tìm hiểu thêm tại{' '}
                <Link to="/legal" className="text-red-600 hover:underline font-medium">Trung tâm pháp lý</Link>
                {' '}và{' '}
                <Link to="/security" className="text-red-600 hover:underline font-medium">Trung tâm bảo mật</Link>.
              </p>
            </div>

            {/* Chuẩn bị pháp lý */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-sm text-gray-700">
              <h3 className="font-semibold text-gray-900 mb-2">Chuẩn bị pháp lý trước khi ký</h3>
              <p className="text-xs text-gray-500 mb-3">
                Danh sách bên dưới chỉ mang tính gợi ý. Bạn nên làm việc thêm với luật sư/văn phòng công chứng nếu giao dịch có giá trị lớn.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  <span>Đã xem bản scan sổ đỏ/sổ hồng và các giấy tờ pháp lý liên quan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  <span>Đã xác minh chủ sở hữu (CMND/CCCD, đối chiếu thông tin trên sổ).</span>
                </li>
                <li className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  <span>Đã thống nhất thời điểm bàn giao, bên chịu thuế/phí, chi phí công chứng, phí dịch vụ.</span>
                </li>
              </ul>
            </div>

            {/* Quyền riêng tư & hiển thị thông tin */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-sm text-gray-700">
              <h3 className="font-semibold text-gray-900 mb-2">Quyền riêng tư & hiển thị thông tin</h3>
              <p className="text-xs text-gray-500 mb-3">
                Tùy chọn dưới đây chỉ áp dụng cho giao diện và bản in (demo). Hệ thống có thể mở rộng lưu lựa chọn của bạn sau này.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    checked={privacyMaskContact}
                    onChange={(e) => setPrivacyMaskContact(e.target.checked)}
                  />
                  <span>Không hiển thị email/phone đầy đủ trong hợp đồng in ra (chỉ ẩn bớt).</span>
                </li>
                <li className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    checked={privacyHideRealName}
                    onChange={(e) => setPrivacyHideRealName(e.target.checked)}
                  />
                  <span>Ẩn tên thật trên lịch sử công khai, chỉ hiển thị mã giao dịch.</span>
                </li>
              </ul>
            </div>

            {/* Printable paper-style contract preview */}
            <div className="printable-contract bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-sm text-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">
                  {isVnpayPaid ? t('transaction.vnpayPaperContract') : t('transaction.paperContract')}
                </h3>
                {isContractReady && (
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 lg:hidden"
                  >
                    <span>{t('transaction.printButton')}</span>
                  </button>
                )}
              </div>
              <div className={`border border-gray-200 rounded-lg p-4 bg-white ${!isContractReady ? 'opacity-60' : ''}`}>
                <p className="text-center font-semibold text-gray-900 uppercase mb-1">
                  {t('transaction.contract.vietnamHeader')}
                </p>
                <p className="text-center text-gray-700 mb-4">{t('transaction.contract.vietnamMotto')}</p>

                <p className="text-center font-bold text-gray-900 mb-1 uppercase">
                  {isRent ? t('transaction.contract.contractTitleRent') : t('transaction.contract.contractTitleSale')}
                </p>
                <p className="text-center text-xs text-gray-500 mb-4">
                  ({t('transaction.contract.contractGenerated', { id: transaction.id })})
                </p>

                <p className="mb-2 text-xs text-gray-500 italic" title="Thông tin này có thể xuất hiện trong bản in, không nên dùng email/phone công việc nếu cần bảo mật cao.">
                  Lưu ý: Email và số điện thoại bên dưới có thể xuất hiện trong bản in. Nếu cần bảo mật cao, hãy dùng thông tin liên hệ riêng tư.
                </p>

                <p className="mb-2">
                  {t('transaction.contract.contractIntro', { date: contractDate })}
                </p>

                <p className="mb-1 font-semibold">{t('transaction.contract.partyA')}: {sellerName}</p>
                {sellerEmail && (
                  <p className="mb-1 text-gray-600 text-sm" title="Thông tin này có thể xuất hiện trong bản in. Không nên dùng email/phone công việc nếu cần bảo mật cao.">
                    {t('common.email')}: {privacyMaskContact ? `${sellerEmail.slice(0, 3)}***@${sellerEmail.split('@')[1] || ''}` : sellerEmail}
                  </p>
                )}
                <p className="mb-2 text-gray-600 text-xs italic">
                  ({t('transaction.contract.partyADetail')})
                </p>

                <p className="mb-1 font-semibold">{t('transaction.contract.partyB')}: {buyerName}</p>
                {buyerEmail && (
                  <p className="mb-2 text-gray-600 text-sm" title="Thông tin này có thể xuất hiện trong bản in. Không nên dùng email/phone công việc nếu cần bảo mật cao.">
                    {t('common.email')}: {privacyMaskContact ? `${buyerEmail.slice(0, 3)}***@${buyerEmail.split('@')[1] || ''}` : buyerEmail}
                  </p>
                )}

                <p className="mb-2 font-semibold">{t('transaction.contract.article1')}</p>
                <p className="mb-1">
                  1.1. {t('transaction.contract.article1_1')}:{' '}
                  <span className="font-medium">{property?.title || transaction.property?.title}</span>
                </p>
                {property?.address && <p className="mb-1">1.2. {t('transaction.contract.article1_2')}: {property.address}</p>}
                <p className="mb-1 text-gray-600 text-xs italic">
                  ({t('transaction.contract.article1_3Note')})
                </p>
                <p className="mb-1">
                  1.3. {t('transaction.contract.article1_3')}:{' '}
                  <span className="font-semibold text-red-600">
                    {formatPrice(transaction.totalAmount)} VND
                  </span>
                  {isRent && ` (${t('transaction.contract.article1_3RentNote')})`}
                  .
                </p>
                {property?.area && <p className="mb-1">1.4. {t('transaction.contract.article1_4')}: {property.area} m²</p>}
                <p className="mb-1">1.5. {t('transaction.contract.article1_5')}: {t('transaction.contract.article1_3Note')}</p>
                <p className="mb-1">1.6. {t('transaction.contract.article1_6')}: {t('transaction.contract.article1_3Note')}</p>
                <p className="mb-1">1.7. {t('transaction.contract.article1_7')}: {t('transaction.contract.article1_3Note')}</p>
                <p className="mb-1">1.8. {t('transaction.contract.article1_8')}: {t('transaction.contract.article1_3Note')}</p>
                <p className="mb-1">1.9. {t('transaction.contract.article1_9')}: {t('transaction.contract.article1_3Note')}</p>
                <p className="mb-1">1.10. {t('transaction.contract.article1_10')}: {t('transaction.contract.article1_3Note')}</p>
                <p className="mb-1">1.11. {t('transaction.contract.article1_11')}: {t('transaction.contract.article1_3Note')}</p>
                <p className="mb-3">1.12. {t('transaction.contract.article1_12')}: {t('transaction.contract.article1_3Note')}</p>

                <p className="mb-2 font-semibold">{t('transaction.contract.article2')}</p>
                <p className="mb-1">
                  2.1. {t('transaction.contract.article2_1', { amount: formatPrice(transaction.totalAmount) })}
                </p>
                <p className="mb-1">
                  2.2. {t('transaction.contract.article2_2')}:{' '}
                  <span className="font-semibold">
                    {transaction.paymentMethod === 'BANK_TRANSFER'
                      ? t('transaction.bankTransfer')
                      : transaction.paymentMethod === 'VNPAY'
                      ? t('transaction.vnpay')
                      : transaction.paymentMethod === 'MOMO'
                      ? t('transaction.momo')
                      : transaction.paymentMethod === 'ZALOPAY'
                      ? t('transaction.zalopay')
                      : t('transaction.cash')}
                  </span>
                  .
                </p>
                <p className="mb-1">
                  2.3. {t('transaction.contract.article2_3', { amount: formatPrice(transaction.sellerAmount) })}
                </p>
                <p className="mb-1">
                  2.4. {t('transaction.contract.article2_4')}
                </p>
                <p className="mb-1">2.5. {t('transaction.contract.article2_5')}: {t('transaction.contract.article2_4')}</p>
                <p className="mb-1">2.6. {t('transaction.contract.article2_6')}: {t('transaction.contract.article2_4')}</p>
                <p className="mb-1">2.7. {t('transaction.contract.article2_7')}</p>
                <p className="mb-1">2.8. {t('transaction.contract.article2_8')}</p>
                <p className="mb-1">2.9. {t('transaction.contract.article2_9')}</p>
                <p className="mb-1">2.10. {t('transaction.contract.article2_10')}</p>
                <p className="mb-1">2.11. {t('transaction.contract.article2_11')}</p>
                <p className="mb-3">2.12. {t('transaction.contract.article2_12')}</p>

                <p className="mb-2 font-semibold">{t('transaction.contract.article3')}</p>
                <p className="mb-1">
                  3.1. {t('transaction.contract.article3_1')}
                </p>
                <p className="mb-1">
                  3.2. {t('transaction.contract.article3_2')}
                </p>
                <p className="mb-1">
                  3.3. {t('transaction.contract.article3_3')}
                </p>
                <p className="mb-1">
                  3.4. {t('transaction.contract.article3_4')}
                </p>
                <p className="mb-1">3.5. {t('transaction.contract.article3_5')}</p>
                <p className="mb-1">3.6. {t('transaction.contract.article3_6')}</p>
                <p className="mb-1">3.7. {t('transaction.contract.article3_7')}</p>
                <p className="mb-1">3.8. {t('transaction.contract.article3_8')}</p>
                <p className="mb-1">3.9. {t('transaction.contract.article3_9')}</p>
                <p className="mb-1">3.10. {t('transaction.contract.article3_10')}</p>
                <p className="mb-1">3.11. {t('transaction.contract.article3_11')}</p>
                <p className="mb-3">3.12. {t('transaction.contract.article3_12')}</p>

                <p className="mb-2 font-semibold">{t('transaction.contract.article4')}</p>
                <p className="mb-1">
                  4.1. {t('transaction.contract.article4_1')}
                </p>
                <p className="mb-1">
                  4.2. {t('transaction.contract.article4_2')}
                </p>
                <p className="mb-1">4.3. {t('transaction.contract.article4_3')}</p>
                <p className="mb-1">4.4. {t('transaction.contract.article4_4')}</p>
                <p className="mb-1">4.5. {t('transaction.contract.article4_5')}</p>
                <p className="mb-1">4.6. {t('transaction.contract.article4_6')}</p>
                <p className="mb-1">4.7. {t('transaction.contract.article4_7')}</p>
                <p className="mb-3">4.8. {t('transaction.contract.article4_8')}</p>

                <p className="mb-2 font-semibold">{t('transaction.contract.article5')}</p>
                <p className="mb-1">
                  5.1. {t('transaction.contract.article5_1')}
                </p>
                <p className="mb-1">
                  5.2. {t('transaction.contract.article5_2')}
                </p>
                <p className="mb-1">5.3. {t('transaction.contract.article5_3')}</p>
                <p className="mb-1">5.4. {t('transaction.contract.article5_4')}</p>
                <p className="mb-1">5.5. {t('transaction.contract.article5_5')}</p>
                <p className="mb-1">5.6. {t('transaction.contract.article5_6')}</p>
                <p className="mb-1">5.7. {t('transaction.contract.article5_7')}</p>
                <p className="mb-1">5.8. {t('transaction.contract.article5_8')}</p>
                <p className="mb-3">5.9. {t('transaction.contract.article5_9')}</p>

                <p className="mb-2 font-semibold">{t('transaction.contract.article6')}</p>
                <p className="mb-1">
                  6.1. {t('transaction.contract.article6_1')}
                </p>
                <p className="mb-1">
                  6.2. {t('transaction.contract.article6_2')}
                </p>
                <p className="mb-1">
                  6.3. {t('transaction.contract.article6_3')}
                </p>
                <p className="mb-1">6.4. {t('transaction.contract.article6_4')}</p>
                <p className="mb-1">6.5. {t('transaction.contract.article6_5')}</p>
                <p className="mb-1">6.6. {t('transaction.contract.article6_6')}</p>
                <p className="mb-1">6.7. {t('transaction.contract.article6_7')}</p>
                <p className="mb-1">6.8. {t('transaction.contract.article6_8')}</p>
                <p className="mb-3">6.9. {t('transaction.contract.article6_9')}</p>

                <p className="mb-2 font-semibold">{t('transaction.contract.article7')}</p>
                <p className="mb-1">
                  7.1. {t('transaction.contract.article7_1')}
                </p>
                <p className="mb-1">
                  7.2. {t('transaction.contract.article7_2')}
                </p>
                <p className="mb-1">
                  7.3. {t('transaction.contract.article7_3')}
                </p>
                <p className="mb-1">7.4. {t('transaction.contract.article7_4')}</p>
                <p className="mb-3">7.5. {t('transaction.contract.article7_5')}</p>

                <p className="mb-2 font-semibold">{t('transaction.contract.article8')}</p>
                <p className="mb-1">8.1. {t('transaction.contract.article8_1')}</p>
                <p className="mb-1">8.2. {t('transaction.contract.article8_2')}</p>
                <p className="mb-3">8.3. {t('transaction.contract.article8_3')}</p>

                <p className="mb-2 font-semibold">{t('transaction.contract.article9')}</p>
                <p className="mb-1">9.1. {t('transaction.contract.article9_1')}</p>
                <p className="mb-1">9.2. {t('transaction.contract.article9_2')}</p>
                <p className="mb-3">9.3. {t('transaction.contract.article9_3')}</p>

                <p className="mb-2 font-semibold">{t('transaction.contract.article10')}</p>
                <p className="mb-1">10.1. {t('transaction.contract.article10_1')}</p>
                <p className="mb-1">10.2. {t('transaction.contract.article10_2')}</p>
                <p className="mb-3">10.3. {t('transaction.contract.article10_3')}</p>

                <p className="mb-2 font-semibold">{t('transaction.contract.article11')}</p>
                <p className="mb-1">11.1. {t('transaction.contract.article11_1')}</p>
                <p className="mb-1">11.2. {t('transaction.contract.article11_2')}</p>
                <p className="mb-3">11.3. {t('transaction.contract.article11_3')}</p>

                <p className="mb-2 font-semibold">{t('transaction.contract.article12')}</p>
                <p className="mb-1">12.1. {t('transaction.contract.article12_1')}</p>
                <p className="mb-1">12.2. {t('transaction.contract.article12_2')}</p>
                <p className="mb-3">12.3. {t('transaction.contract.article12_3')}</p>

                <p className="mb-2 font-semibold">{t('transaction.contract.article13')}</p>
                <p className="mb-1">13.1. {t('transaction.contract.article13_1')}</p>
                <p className="mb-1">13.2. {t('transaction.contract.article13_2')}</p>
                <p className="mb-1">13.3. {t('transaction.contract.article13_3')}</p>
                <p className="mb-3">13.4. {t('transaction.contract.article13_4')}</p>

                <p className="mb-2 font-semibold">{t('transaction.contract.article14')}</p>
                <p className="mb-1">14.1. {t('transaction.contract.article14_1')}</p>
                <p className="mb-1">14.2. {t('transaction.contract.article14_2')}</p>
                <p className="mb-1">14.3. {t('transaction.contract.article14_3')}</p>
                <p className="mb-3">14.4. {t('transaction.contract.article14_4')}</p>

                <p className="mb-2 font-semibold">{t('transaction.contract.article15')}</p>
                <p className="mb-1">15.1. {t('transaction.contract.article15_1')}</p>
                <p className="mb-1">15.2. {t('transaction.contract.article15_2')}</p>
                <p className="mb-1">15.3. {t('transaction.contract.article15_3')}</p>
                <p className="mb-1">15.4. {t('transaction.contract.article15_4')}</p>
                <p className="mb-3">15.5. {t('transaction.contract.article15_5')}</p>

                <p className="mb-2 font-semibold">{t('transaction.contract.article16')}</p>
                <p className="mb-1">16.1. {t('transaction.contract.article16_1')}</p>
                <p className="mb-1">16.2. {t('transaction.contract.article16_2')}</p>
                <p className="mb-1">16.3. {t('transaction.contract.article16_3')}</p>
                <p className="mb-1">16.4. {t('transaction.contract.article16_4')}</p>
                <p className="mb-3">16.5. {t('transaction.contract.article16_5')}</p>

                <p className="mb-2 font-semibold">{t('transaction.contract.article17')}</p>
                <p className="mb-1">17.1. {t('transaction.contract.article17_1')}</p>
                <p className="mb-1">17.2. {t('transaction.contract.article17_2')}</p>
                <p className="mb-1">17.3. {t('transaction.contract.article17_3')}</p>
                <p className="mb-3">17.4. {t('transaction.contract.article17_4')}</p>

                <p className="mb-2 font-semibold">{t('transaction.contract.article18')}</p>
                <p className="mb-1">18.1. {t('transaction.contract.article18_1')}</p>
                <p className="mb-1">18.2. {t('transaction.contract.article18_2')}</p>
                <p className="mb-1">18.3. {t('transaction.contract.article18_3')}</p>
                <p className="mb-3">18.4. {t('transaction.contract.article18_4')}</p>

                <p className="mb-2 font-semibold">{t('transaction.contract.article19')}</p>
                <p className="mb-1">19.1. {t('transaction.contract.article19_1')}</p>
                <p className="mb-1">19.2. {t('transaction.contract.article19_2')}</p>
                <p className="mb-1">19.3. {t('transaction.contract.article19_3')}</p>
                <p className="mb-3">19.4. {t('transaction.contract.article19_4')}</p>

                <p className="mb-2 font-semibold">{t('transaction.contract.article20')}</p>
                <p className="mb-1">20.1. {t('transaction.contract.article20_1')}</p>
                <p className="mb-1">20.2. {t('transaction.contract.article20_2')}</p>
                <p className="mb-1">20.3. {t('transaction.contract.article20_3')}</p>
                <p className="mb-3">20.4. {t('transaction.contract.article20_4')}</p>

                <p className="mb-2 font-semibold">{t('transaction.contract.article21')}</p>
                <p className="mb-1">21.1. {t('transaction.contract.article21_1')}</p>
                <p className="mb-1">21.2. {t('transaction.contract.article21_2')}</p>
                <p className="mb-3">21.3. {t('transaction.contract.article21_3')}</p>

                <p className="mb-2 font-semibold">{t('transaction.contract.article22')}</p>
                <p className="mb-1">22.1. {t('transaction.contract.article22_1')}</p>
                <p className="mb-1">22.2. {t('transaction.contract.article22_2')}</p>
                <p className="mb-3">22.3. {t('transaction.contract.article22_3')}</p>

                <p className="mb-2 font-semibold">{t('transaction.contract.article23')}</p>
                <p className="mb-1">23.1. {t('transaction.contract.article23_1')}</p>
                <p className="mb-1">23.2. {t('transaction.contract.article23_2')}</p>
                <p className="mb-1">23.3. {t('transaction.contract.article23_3')}</p>
                <p className="mb-3">23.4. {t('transaction.contract.article23_4')}</p>

                <p className="mb-2 font-semibold">{t('transaction.contract.article24')}</p>
                <p className="mb-1">24.1. {t('transaction.contract.article24_1')}</p>
                <p className="mb-1">24.2. {t('transaction.contract.article24_2')}</p>
                <p className="mb-1">24.3. {t('transaction.contract.article24_3')}</p>
                <p className="mb-3">24.4. {t('transaction.contract.article24_4')}</p>

                <p className="mb-2 font-semibold">{t('transaction.contract.article25')}</p>
                <p className="mb-1">25.1. {t('transaction.contract.article25_1')}</p>
                <p className="mb-1">25.2. {t('transaction.contract.article25_2')}</p>
                <p className="mb-1">25.3. {t('transaction.contract.article25_3')}</p>
                <p className="mb-1">25.4. {t('transaction.contract.article25_4')}</p>
                <p className="mb-3">25.5. {t('transaction.contract.article25_5')}</p>

                <p className="mb-2 font-semibold">Điều 26. Bảo mật & dữ liệu cá nhân</p>
                <p className="mb-1">26.1. Các bên cam kết không được chia sẻ dữ liệu hợp đồng (nội dung, giá trị, thông tin các bên) cho bên thứ ba, trừ khi pháp luật yêu cầu hoặc cơ quan nhà nước có thẩm quyền yêu cầu.</p>
                <p className="mb-1">26.2. Dữ liệu lưu trên ERA Estate và trên blockchain chủ yếu ở dạng mã hóa hoặc ẩn bớt thông tin định danh; không lưu đầy đủ CMND/CCCD, số sổ đỏ, số tài khoản ngân hàng trên giao diện công khai hay bản in mặc định.</p>
                <p className="mb-3">26.3. Mỗi bên tự chịu trách nhiệm bảo mật tài khoản ERA Estate, ví MetaMask, email, mã OTP và thiết bị sử dụng. ERA Estate không lưu mật khẩu hay seed phrase của người dùng.</p>

                {transaction.blockchainTxHash && (
                  <>
                    <p className="mb-2 font-semibold text-sm">{t('transaction.contract.blockchainInfo')}</p>
                    <p className="mb-1 text-xs text-gray-600">
                      {t('transaction.contract.blockchainInfoDesc')}
                    </p>
                    <p className="mb-1 text-xs">
                      <span className="font-medium">Transaction Hash:</span>{' '}
                      <span className="font-mono text-gray-700">{transaction.blockchainTxHash}</span>
                    </p>
                    {transaction.blockchainNetwork && (
                      <p className="mb-3 text-xs">
                        <span className="font-medium">Network:</span>{' '}
                        <span className="text-gray-700">{transaction.blockchainNetwork}</span>
                      </p>
                    )}
                  </>
                )}

                <p className="mb-2 text-xs text-gray-500 mt-4">
                  * {t('transaction.contract.contractFooter')}
                </p>
                {!isContractReady && (
                  <p className="mb-4 text-xs text-red-500 font-medium">
                    ** {t('transaction.contract.contractFooterWarning')}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-8 mt-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">{t('transaction.contract.partyALabel')}</p>
                    <p className="text-gray-600 text-xs">({t('transaction.seller').split(' - ')[1]})</p>
                    {transaction.sellerSigned ? (
                      <div className="mt-3 flex flex-col items-center gap-1">
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Đã ký điện tử
                        </span>
                      </div>
                    ) : (
                      <p className="mt-10 text-gray-500 text-xs italic">{t('transaction.contract.partyASign')}</p>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">{t('transaction.contract.partyBLabel')}</p>
                    <p className="text-gray-600 text-xs">({t('transaction.buyer').split(' - ')[1]})</p>
                    {transaction.buyerSigned ? (
                      <div className="mt-3 flex flex-col items-center gap-1">
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Đã ký điện tử
                        </span>
                      </div>
                    ) : (
                      <p className="mt-10 text-gray-500 text-xs italic">{t('transaction.contract.partyASign')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* === E-SIGNATURE SECTION === */}
            {isParticipant && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <PenTool className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Ký hợp đồng điện tử</h3>
                    <p className="text-xs text-gray-500">Ký tên bằng chuột hoặc màn hình cảm ứng</p>
                  </div>
                  {transaction.buyerSigned && transaction.sellerSigned && (
                    <span className="ml-auto inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full font-medium border border-emerald-200">
                      <CheckCircle className="w-4 h-4" /> Cả hai bên đã ký
                    </span>
                  )}
                </div>

                {/* Signature pads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <SignatureCanvas
                      label={`Bên A (${sellerName})`}
                      onSignatureChange={setSellerSignature}
                      disabled={!isSeller || !!transaction.sellerSigned}
                      existingSignature={null}
                      height={140}
                    />
                    {!isSeller && (
                      <p className="text-[10px] text-gray-400 mt-1 text-center">
                        {transaction.sellerSigned ? '✅ Bên bán đã ký' : '⏳ Chờ bên bán ký'}
                      </p>
                    )}
                  </div>
                  <div>
                    <SignatureCanvas
                      label={`Bên B (${buyerName})`}
                      onSignatureChange={setBuyerSignature}
                      disabled={!isBuyer || !!transaction.buyerSigned}
                      existingSignature={null}
                      height={140}
                    />
                    {!isBuyer && (
                      <p className="text-[10px] text-gray-400 mt-1 text-center">
                        {transaction.buyerSigned ? '✅ Bên mua đã ký' : '⏳ Chờ bên mua ký'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <button
                    type="button"
                    onClick={handleGeneratePdf}
                    disabled={generatingPdf || (isBuyer && !buyerSignature) || (isSeller && !sellerSignature)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    {generatingPdf ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Đang tạo PDF...</>
                    ) : (
                      <><FileText className="w-4 h-4" /> Xem trước & Tạo PDF</>
                    )}
                  </button>

                  {pdfBlobUrl && (
                    <>
                      <button
                        type="button"
                        onClick={handleDownloadPdf}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        <Download className="w-4 h-4" /> Tải PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => window.open(pdfBlobUrl, '_blank')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" /> Xem PDF
                      </button>
                    </>
                  )}
                </div>

                {/* Contract Hash Display */}
                {contractHash && (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-semibold text-gray-700">SHA-256 Hash hợp đồng</span>
                    </div>
                    <p className="font-mono text-[10px] text-gray-600 break-all select-all">{contractHash}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Mã hash này đảm bảo tính toàn vẹn — bất kỳ thay đổi nào trên PDF sẽ tạo ra hash khác.
                    </p>
                  </div>
                )}

                {/* Save signature button */}
                {contractHash && (
                  <button
                    type="button"
                    onClick={handleSaveContractHash}
                    disabled={savingHash || (isBuyer && !!transaction.buyerSigned) || (isSeller && !!transaction.sellerSigned)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm font-semibold hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    {savingHash ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu chữ ký...</>
                    ) : (isBuyer && transaction.buyerSigned) || (isSeller && transaction.sellerSigned) ? (
                      <><CheckCircle className="w-4 h-4" /> Bạn đã ký hợp đồng này</>
                    ) : (
                      <><Shield className="w-4 h-4" /> Xác nhận ký & Lưu Hash hợp đồng</>
                    )}
                  </button>
                )}

                {/* Both signed success message */}
                {transaction.buyerSigned && transaction.sellerSigned && transaction.contractSignedAt && (
                  <div className="mt-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <span className="font-semibold text-emerald-800">Hợp đồng đã được ký bởi cả hai bên</span>
                    </div>
                    <p className="text-xs text-emerald-700">
                      Thời điểm ký: {new Date(transaction.contractSignedAt).toLocaleString('vi-VN')}
                    </p>
                    {transaction.contractHash && (
                      <p className="text-xs text-emerald-600 mt-1 font-mono break-all">
                        Hash: {transaction.contractHash.slice(0, 16)}...{transaction.contractHash.slice(-16)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Modal xác nhận trước khi ký MetaMask */}
      {showSignConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Xác nhận ký hợp đồng trên Blockchain</h2>
                <p className="text-xs text-gray-500">
                  MetaMask sẽ mở cửa sổ mới để bạn xác nhận giao dịch on-chain.
                </p>
              </div>
            </div>
            <div className="px-5 py-4 space-y-3 text-xs text-gray-700">
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                <p className="font-semibold text-gray-900 mb-1">Tóm tắt giao dịch</p>
                <p>
                  <span className="text-gray-600">Bất động sản:</span>{' '}
                  <span className="font-medium">
                    {property?.title || transaction.property?.title || t('transaction.contract.noTitle')}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Giá trị:</span>{' '}
                  <span className="font-semibold text-red-600">
                    {formatPrice(transaction.totalAmount)} VND
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Mạng Blockchain:</span>{' '}
                  <span className="font-medium">
                    {transaction.blockchainNetwork || BLOCKCHAIN_NETWORK_NAME || t('common.unknown')}
                  </span>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  checked={signConsent}
                  onChange={(e) => setSignConsent(e.target.checked)}
                />
                <p>
                  Tôi hiểu rằng ký trên Blockchain chỉ là bước ghi nhận giao dịch trên mạng{' '}
                  <span className="font-semibold">{transaction.blockchainNetwork || BLOCKCHAIN_NETWORK_NAME}</span>,{' '}
                  <span className="font-semibold">không thay thế</span> cho hợp đồng công chứng và thủ tục sang tên theo quy định pháp luật.
                </p>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button
                type="button"
                onClick={() => !signing && setShowSignConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50"
                disabled={signing}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!signConsent || signing) return;
                  await handleSignOnChain();
                  setShowSignConfirm(false);
                }}
                disabled={!signConsent || signing}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {signing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('transaction.signing')}
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Xác nhận & mở MetaMask
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionContractPage;


