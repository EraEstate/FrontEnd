import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Home, DollarSign, User, ArrowLeft } from 'lucide-react';
import { propertyTransactionAPI, type PropertyTransaction } from '../api/propertyTransaction';
import { propertyAPI } from '../api/property';
import toast from '../utils/toast';
import { useTranslation } from 'react-i18next';
import { TransactionStepper } from '../components/TransactionStepper';

const TransactionOverviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [transaction, setTransaction] = useState<PropertyTransaction | null>(null);
  const [property, setProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

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
            toast.error('Không th? t?i thông tin BÐS');
          }
        }
      } catch (error) {
        toast.error('Không th? t?i t?ng quan giao d?ch');
        toast.error(t('transaction.overview.notFound'));
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const formatPrice = (price: number | undefined) => {
    if (!price && price !== 0) return '-';
    if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)} tá»·`;
    if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)} triá»‡u`;
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
            {t('transaction.overview.createdDate')}: <span className="font-medium">{contractDate}</span> Â· {t('transaction.transactionId')}:{' '}
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
    </div>
  );
};

export default TransactionOverviewPage;


