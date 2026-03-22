import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TransactionHistoryPage from './TransactionHistoryPage';

const MyTransactionsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          to="/profile"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('transaction.historyList.backProfile')}
        </Link>
        <TransactionHistoryPage />
      </div>
    </div>
  );
};

export default MyTransactionsPage;
