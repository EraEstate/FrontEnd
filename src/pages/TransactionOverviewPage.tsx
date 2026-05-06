import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Home, DollarSign, User, ArrowLeft, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { propertyTransactionAPI, type PropertyTransaction } from '../api/propertyTransaction';
import { propertyAPI } from '../api/property';
import { paymentMilestoneApi, type PaymentMilestone } from '../api/paymentMilestone';
import toast from '../utils/toast';
import { useTranslation } from 'react-i18next';
import { TransactionStepper } from '../components/TransactionStepper';
import { useAuthStore } from '../store/authStore';
import MilestoneManagerModal from '../components/MilestoneManagerModal';
import { Settings } from 'lucide-react';

const TransactionOverviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [transaction, setTransaction] = useState<PropertyTransaction | null>(null);
  const [property, setProperty] = useState<any | null>(null);
  const [milestones, setMilestones] = useState<PaymentMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const tx = await propertyTransactionAPI.getById(id);
        setTransaction(tx);
        
        if (tx.paymentMethod === 'MILESTONE') {
            try {
                const ms = await paymentMilestoneApi.getMilestonesByTransaction(id);
                setMilestones(ms.data);
            } catch (e) {
                console.error("Could not load milestones");
            }
        }
        
        if (tx.propertyId) {
          try {
            const prop = await propertyAPI.getById(tx.propertyId);
            setProperty(prop);
          } catch (e) {
            toast.error('Không thể tải thông tin BĐS');
          }
        }
      } catch (error) {
        toast.error('Không thể tải tổng quan giao dịch');
        toast.error(t('transaction.overview.notFound'));
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, t]);

  const formatPrice = (price: number | undefined) => {
    if (!price && price !== 0) return '-';
    if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)} tỷ`;
    if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)} triệu`;
    return price.toLocaleString('vi-VN');
  };

  if (loading || !transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  const contractDate = new Date(transaction.createdAt).toLocaleDateString('vi-VN');
  
  const isSeller = user && String(transaction.sellerId) === String(user.id);
  const isBuyer = user && String(transaction.buyerId) === String(user.id);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-gray-600 hover:text-red-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t('transaction.back')}
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{t('transaction.overview.processTitle')}</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('transaction.overview.step1')}</h1>
          <p className="text-sm text-gray-500">
            {t('transaction.overview.createdDate')}: <span className="font-medium">{contractDate}</span> • {t('transaction.transactionId')}:{' '}
            <span className="font-mono">{transaction.id}</span>
          </p>

          <div className="mt-4">
            <TransactionStepper current={1} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Home className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900">{t('transaction.overview.property')}</h2>
            </div>
            <p className="font-medium text-gray-900">
              {property?.title || transaction.property?.title || t('transaction.overview.noTitle')}
            </p>
            {property?.address && <p className="text-gray-600 text-sm">{t('transaction.overview.address')}: {property.address}</p>}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900">{t('transaction.overview.finance')}</h2>
            </div>
            <p className="text-gray-700 text-sm">
              {t('transaction.totalAmount')}:{' '}
              <span className="font-semibold text-red-600">{formatPrice(transaction.totalAmount)} VND</span>
            </p>
            {transaction.taxAmount > 0 && (
              <p className="text-gray-600 text-sm">
                {t('transaction.taxAmount')}:{' '}
                <span className="font-semibold">{formatPrice(transaction.taxAmount)} VND</span>
              </p>
            )}
            {transaction.serviceFee > 0 && (
              <p className="text-gray-600 text-sm">
                {t('transaction.serviceFee')}:{' '}
                <span className="font-semibold">{formatPrice(transaction.serviceFee)} VND</span>
              </p>
            )}
            {transaction.platformFee > 0 && (
              <p className="text-gray-600 text-sm">
                {t('transaction.platformFee')}:{' '}
                <span className="font-semibold">{formatPrice(transaction.platformFee)} VND</span>
              </p>
            )}
            <p className="text-gray-700 text-sm">
              {t('transaction.sellerAmount')}:{' '}
              <span className="font-semibold text-emerald-600">
                {formatPrice(transaction.sellerAmount)} VND
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900">{t('transaction.parties')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{t('transaction.seller')}</p>
              <p className="font-semibold text-gray-900">
                {transaction.seller?.fullName || t('transaction.review.unknown')}
              </p>
              {transaction.seller?.email && (
                <p className="text-gray-600 mt-1">{t('common.email')}: {transaction.seller.email}</p>
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{t('transaction.buyer')}</p>
              <p className="font-semibold text-gray-900">
                {transaction.buyer?.fullName || t('transaction.review.unknown')}
              </p>
              {transaction.buyer?.email && (
                <p className="text-gray-600 mt-1">{t('common.email')}: {transaction.buyer.email}</p>
              )}
            </div>
          </div>
        </div>

        {transaction.paymentMethod === 'MILESTONE' && (milestones.length > 0 || isSeller) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-semibold text-gray-900">Tiến độ thanh toán</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium px-3 py-1 bg-red-50 text-red-600 rounded-full">
                  {milestones.filter(m => m.status === 'PAID').length} / {milestones.length} đợt đã xong
                </span>
                {isSeller && (
                  <button 
                    onClick={() => setIsMilestoneModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Quản lý
                  </button>
                )}
              </div>
            </div>
            
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {milestones.map((m, idx) => (
                <div key={m.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${m.status === 'PAID' ? 'bg-green-500 text-white' : m.status === 'OVERDUE' ? 'bg-red-500 text-white' : 'text-slate-500'}`}>
                    {m.status === 'PAID' ? <CheckCircle className="w-5 h-5" /> : m.status === 'OVERDUE' ? <AlertCircle className="w-5 h-5" /> : <span className="font-bold">{idx + 1}</span>}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-slate-900">{m.title}</h3>
                      <span className="font-bold text-red-600">{formatPrice(m.amount)} đ</span>
                    </div>
                    <div className="text-sm text-slate-500 mb-3">Hạn: {new Date(m.dueDate).toLocaleDateString('vi-VN')}</div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <div>
                        {m.status === 'PAID' ? (
                          <span className="inline-flex items-center gap-1.5 py-1 px-2 rounded-md text-xs font-medium bg-green-50 text-green-700">
                            Đã thanh toán {m.paidAt ? `(${new Date(m.paidAt).toLocaleDateString('vi-VN')})` : ''}
                          </span>
                        ) : m.status === 'OVERDUE' ? (
                          <span className="inline-flex items-center gap-1.5 py-1 px-2 rounded-md text-xs font-medium bg-red-50 text-red-700">
                            Quá hạn thanh toán
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 py-1 px-2 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                            Chờ thanh toán
                          </span>
                        )}
                      </div>
                      
                      {m.status !== 'PAID' && (
                        <button className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded shadow-sm transition-colors">
                          Thanh toán đợt này
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {milestones.length === 0 && (
              <div className="py-8 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="mb-2">Chưa có tiến độ thanh toán nào được thiết lập.</p>
                {isSeller && (
                  <button 
                    onClick={() => setIsMilestoneModalOpen(true)}
                    className="text-red-600 font-medium hover:underline"
                  >
                    Thiết lập ngay
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {t('transaction.overview.nextStepDesc')}
          </p>
          <button
            type="button"
            onClick={() => navigate(`/transactions/${transaction.id}/contract`)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
          >
            {t('transaction.overview.continueButton')}
          </button>
        </div>
      </div>
      
      {transaction && (
        <MilestoneManagerModal
          isOpen={isMilestoneModalOpen}
          onClose={() => setIsMilestoneModalOpen(false)}
          transactionId={transaction.id}
          totalAmount={transaction.totalAmount}
          onSuccess={() => {
            // Reload milestones
            paymentMilestoneApi.getMilestonesByTransaction(transaction.id)
              .then(res => setMilestones(res.data))
              .catch(console.error);
          }}
        />
      )}
    </div>
  );
};

export default TransactionOverviewPage;
