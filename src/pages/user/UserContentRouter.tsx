import React, { Suspense } from 'react';
import type { UserView } from './types';

// ─── Lazy-loaded pages (code-splitting) ───
const DashboardPage = React.lazy(() => import('../DashboardPage'));
const MyPropertiesPage = React.lazy(() => import('../MyPropertiesPage'));
const FavoritesPage = React.lazy(() => import('../FavoritesPage'));
const InquiryPage = React.lazy(() => import('../InquiryPage'));
const MyViewingsPage = React.lazy(() => import('../MyViewingsPage'));
const RentalManagementPage = React.lazy(() => import('../RentalManagementPage'));
const RentalContractsPage = React.lazy(() => import('../RentalContractsPage'));
const PaymentHistoryPage = React.lazy(() => import('../PaymentHistoryPage'));
const TransactionHistoryPage = React.lazy(() => import('../TransactionHistoryPage'));
const BankAccountManagementPage = React.lazy(() => import('../BankAccountManagementPage'));
const LandlordAnalyticsPage = React.lazy(() => import('../LandlordAnalyticsPage'));
const CalendarPage = React.lazy(() => import('../CalendarPage'));
const ActivityLogPage = React.lazy(() => import('../ActivityLogPage'));
const SettingsPage = React.lazy(() => import('../SettingsPage'));

// ─── Loading fallback ───
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-sm text-gray-400">Đang tải...</p>
    </div>
  </div>
);

interface UserContentRouterProps {
  currentView: UserView;
}

const UserContentRouter: React.FC<UserContentRouterProps> = ({ currentView }) => {
  const renderView = () => {
    switch (currentView) {
      case 'overview': return <DashboardPage embedded />;
      case 'my-properties': return <MyPropertiesPage />;
      case 'favorites': return <FavoritesPage />;
      case 'inquiries': return <InquiryPage />;
      case 'viewings': return <MyViewingsPage />;
      case 'rental-management': return <RentalManagementPage />;
      case 'contracts': return <RentalContractsPage />;
      case 'payments': return <PaymentHistoryPage />;
      case 'transaction-history': return <TransactionHistoryPage />;
      case 'bank-accounts': return <BankAccountManagementPage />;
      case 'analytics': return <LandlordAnalyticsPage />;
      case 'calendar': return <CalendarPage />;
      case 'activity-log': return <ActivityLogPage />;
      case 'settings': return <SettingsPage />;
      default: return null;
    }
  };

  return (
    <Suspense fallback={<PageLoader />}>
      {renderView()}
    </Suspense>
  );
};

export default UserContentRouter;
