import React, { Suspense } from 'react';
import type { AdminView, AdminStats } from './types';

// ─── Lazy-loaded Admin pages (code-splitting for performance) ───
const AdminOverview = React.lazy(() => import('./AdminOverview'));
const AnalyticsPage = React.lazy(() => import('./AnalyticsPage'));
const UserManagement = React.lazy(() => import('./UserManagement'));
const KycManagement = React.lazy(() => import('./KycManagement'));
const PropertyManagement = React.lazy(() => import('./PropertyManagement'));
const AgentManagement = React.lazy(() => import('./AgentManagement'));
const AgencyManagement = React.lazy(() => import('./AgencyManagement'));
const ProjectManagement = React.lazy(() => import('./ProjectManagement'));
const NewsManagement = React.lazy(() => import('./NewsManagement'));
const MarketAnalysisManagement = React.lazy(() => import('./MarketAnalysisManagement'));
const InquiryManagement = React.lazy(() => import('./InquiryManagement'));
const PaymentManagement = React.lazy(() => import('./PaymentManagement'));

// ─── Reused pages ───
const WikiPage = React.lazy(() => import('../WikiPage'));
const NotificationCenter = React.lazy(() => import('../NotificationCenter'));
const ProfilePage = React.lazy(() => import('../ProfilePage'));

// ─── Staff pages Admin can access (override) ───
const PropertyModerationPage = React.lazy(() => import('../staff/PropertyModerationPage'));

// ─── New Admin pages ───
const AdminReportCenter = React.lazy(() => import('./AdminReportCenter'));
const AdminSystemConfig = React.lazy(() => import('./AdminSystemConfig'));
const AdminAuditTrail = React.lazy(() => import('./AdminAuditTrail'));

// ─── Loading fallback ───
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-sm text-gray-400">Đang tải...</p>
    </div>
  </div>
);

interface AdminContentRouterProps {
  currentView: AdminView;
  stats: AdminStats | null;
  statsLoading: boolean;
  recentActivities: any[];
  activitiesLoading: boolean;
  onNavigate: (view: AdminView) => void;
}

const AdminContentRouter: React.FC<AdminContentRouterProps> = ({
  currentView, stats, statsLoading, recentActivities, activitiesLoading, onNavigate,
}) => {
  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <AdminOverview stats={stats} statsLoading={statsLoading}
          recentActivities={recentActivities} activitiesLoading={activitiesLoading} onNavigate={onNavigate} />;
      case 'analytics': return <AnalyticsPage />;
      // Kiểm duyệt (Admin override)
      case 'moderation': return <PropertyModerationPage />;
      // Quản lý
      case 'users': return <UserManagement />;
      case 'kyc': return <KycManagement />;
      case 'properties': return <PropertyManagement />;
      case 'agents': return <AgentManagement />;
      case 'agencies': return <AgencyManagement />;
      case 'projects': return <ProjectManagement />;
      case 'inquiries': return <InquiryManagement />;
      // Nội dung
      case 'news': return <NewsManagement />;
      case 'market-analysis': return <MarketAnalysisManagement />;
      case 'wiki': return <WikiPage />;
      case 'payments': return <PaymentManagement />;
      // Hệ thống
      case 'notifications': return <NotificationCenter />;
      case 'settings': return <ProfilePage />;
      // Giám sát
      case 'reports': return <AdminReportCenter />;
      case 'audit-trail': return <AdminAuditTrail />;
      // Cấu hình
      case 'system-config': return <AdminSystemConfig />;
      default: return null;
    }
  };

  return (
    <Suspense fallback={<PageLoader />}>
      {renderView()}
    </Suspense>
  );
};

export default AdminContentRouter;
