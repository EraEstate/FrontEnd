import React from 'react';
import type { StaffView, StaffStats } from './types';

// ─── Staff-specific pages ───
import PropertyModerationPage from './PropertyModerationPage';
import InquiryManagementPage from './InquiryManagementPage';
import StaffUserManagementPage from './StaffUserManagementPage';
import StaffDashboardHome from './StaffDashboardHome';

// ─── Reused user pages ───
import MyPropertiesPage from '../MyPropertiesPage';
import PostPropertyPage from '../PostPropertyPage';
import ProjectsPage from '../ProjectsPage';
import InquiryPage from '../InquiryPage';
import NotificationCenter from '../NotificationCenter';
import PaymentHistoryPage from '../PaymentHistoryPage';
import ProfilePage from '../ProfilePage';
import NewsPage from '../NewsPage';
import WikiPage from '../WikiPage';

// ─── Imported admin management pages ───
import KycManagement from '../admin/KycManagement';
import PropertyManagement from '../admin/PropertyManagement';
import NewsManagement from '../admin/NewsManagement';
import ProjectManagement from '../admin/ProjectManagement';
import AgencyManagement from '../admin/AgencyManagement';
import AgentManagement from '../admin/AgentManagement';
import PaymentManagement from '../admin/PaymentManagement';
import MarketAnalysisManagement from '../admin/MarketAnalysisManagement';

// ─── Content Router ───
interface StaffContentRouterProps {
  currentView: StaffView;
  stats: StaffStats | null;
  statsLoading: boolean;
  onNavigate: (view: StaffView) => void;
}

const StaffContentRouter: React.FC<StaffContentRouterProps> = ({ currentView, stats, statsLoading, onNavigate }) => {
  switch (currentView) {
    case 'dashboard':
      return <StaffDashboardHome stats={stats} statsLoading={statsLoading} onNavigate={onNavigate} />;
    // Kiểm duyệt
    case 'property-moderation': return <PropertyModerationPage />;
    case 'kyc-management': return <KycManagement />;
    case 'inquiry-management': return <InquiryManagementPage />;
    // Quản lý hệ thống
    case 'user-management': return <StaffUserManagementPage />;
    case 'property-management': return <PropertyManagement />;
    case 'agent-management': return <AgentManagement />;
    case 'agency-management': return <AgencyManagement />;
    case 'payment-management': return <PaymentManagement />;
    // Nội dung
    case 'news-management': return <NewsManagement />;
    case 'project-management': return <ProjectManagement />;
    case 'market-analysis': return <MarketAnalysisManagement />;
    case 'wiki': return <WikiPage />;
    // Cá nhân
    case 'properties': return <MyPropertiesPage />;
    case 'post-property': return <PostPropertyPage />;
    case 'projects': return <ProjectsPage />;
    case 'inquiries': return <InquiryPage />;
    case 'news': return <NewsPage />;
    case 'notifications': return <NotificationCenter />;
    case 'payments': return <PaymentHistoryPage />;
    case 'profile': return <ProfilePage />;
    default: return null;
  }
};

export default StaffContentRouter;
