import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { propertyTransactionAPI, type PropertyTransaction } from '../api/propertyTransaction';
import { propertyAPI } from '../api/property';
import toast from '../utils/toast';
import { useTranslation } from 'react-i18next';
import { TransactionStepper } from '../components/TransactionStepper';

const TransactionContractReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [transaction, setTransaction] = useState<PropertyTransaction | null>(null);
  const [property, setProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);

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
            console.error('Failed to load property for contract review page:', e);
          }
        }
      } catch (error) {
        console.error('Failed to load transaction for contract review:', error);
        toast.error(t('transaction.review.notFound'));
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

  if (loading || !transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  const contractDate = new Date(transaction.createdAt).toLocaleDateString('vi-VN');

  const goNext = () => {
    if (!agreed) {
      toast.warning(t('transaction.review.agreeRequired'));
      return;
    }
    navigate(`/transactions/${transaction.id}/blockchain`);
  };

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('transaction.review.step2')}</h1>
          <p className="text-sm text-gray-500">
            {t('transaction.review.contractDate')}: <span className="font-medium">{contractDate}</span> · {t('transaction.transactionId')}:{' '}
            <span className="font-mono">{transaction.id}</span>
          </p>

          <div className="mt-4">
            <TransactionStepper current={2} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-sm text-gray-700 mb-4">
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <p className="text-center font-semibold text-gray-900 uppercase mb-1">
              {t('transaction.review.vietnamHeader')}
            </p>
            <p className="text-center text-gray-700 mb-4">{t('transaction.review.vietnamMotto')}</p>

            <p className="text-center font-bold text-gray-900 mb-4 uppercase">
              {property?.transactionType === 'RENT' ? t('transaction.review.contractTitleRent') : t('transaction.review.contractTitleSale')}
            </p>

            <p className="mb-2">{t('transaction.review.contractIntro', { date: contractDate })}</p>

            <p className="mb-1 font-semibold">
              {t('transaction.review.sellerLabel')}: {transaction.seller?.fullName || t('transaction.review.unknown')}
            </p>
            {transaction.seller?.email && (
              <p className="mb-2 text-gray-600">{t('common.email')}: {transaction.seller.email}</p>
            )}

            <p className="mb-1 font-semibold">
              {t('transaction.review.buyerLabel')}: {transaction.buyer?.fullName || t('transaction.review.unknown')}
            </p>
            {transaction.buyer?.email && (
              <p className="mb-4 text-gray-600">{t('common.email')}: {transaction.buyer.email}</p>
            )}

            <p className="mb-2 font-semibold">{t('transaction.review.article1')}</p>
            <p className="mb-1">
              1.1. {t('transaction.review.article1_1')}:{' '}
              <span className="font-medium">{property?.title || transaction.property?.title}</span>
            </p>
            {property?.address && <p className="mb-1">1.2. {t('transaction.review.article1_2')}: {property.address}</p>}
            <p className="mb-3">
              1.3. {t('transaction.review.article1_3')}:{' '}
              <span className="font-semibold text-red-600">
                {formatPrice(transaction.totalAmount)} VND
              </span>
            </p>

            <p className="mb-2 font-semibold">{t('transaction.review.article2')}</p>
            <p className="mb-1">
              2.1. {t('transaction.review.article2_1', { amount: formatPrice(transaction.totalAmount) })}
            </p>
            <p className="mb-1">
              2.2. {t('transaction.review.article2_2', {
                method: transaction.paymentMethod === 'BANK_TRANSFER'
                  ? t('transaction.bankTransfer')
                  : transaction.paymentMethod === 'VNPAY'
                  ? t('transaction.vnpay')
                  : transaction.paymentMethod === 'MOMO'
                  ? t('transaction.momo')
                  : transaction.paymentMethod === 'ZALOPAY'
                  ? t('transaction.zalopay')
                  : t('transaction.cash')
              })}
            </p>

            <p className="mb-2 font-semibold">{t('transaction.review.article3')}</p>
            <p className="mb-1">
              3.1. {t('transaction.review.article3_1')}
            </p>
            <p className="mb-3">
              3.2. {t('transaction.review.article3_2')}
            </p>

            <p className="mb-2 text-xs text-gray-500">
              * {t('transaction.review.disclaimer')}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-3">
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <p className="font-semibold mb-1">Lưu ý pháp lý quan trọng</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Hợp đồng trên hệ thống và trên blockchain <span className="font-semibold">không thay thế</span> cho hợp đồng công chứng ngoài đời.</li>
                <li>Bạn cần tự kiểm tra pháp lý BĐS (sổ đỏ/sổ hồng, quy hoạch, thế chấp, tranh chấp) trước khi thanh toán và ký kết chính thức.</li>
              </ul>
            </div>
            <label className="flex items-start gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span>
                {t('transaction.review.agreeCheckbox')}
              </span>
            </label>
          </div>

          <button
            type="button"
            onClick={goNext}
            disabled={!agreed}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {t('transaction.review.continueButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionContractReviewPage;


