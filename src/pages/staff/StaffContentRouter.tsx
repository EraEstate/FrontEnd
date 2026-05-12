import React from 'react';
import type { StaffView, StaffStats } from './types';

// ─── Staff-specific pages ───
import PropertyModerationPage from './PropertyModerationPage';
import InquiryManagementPage from './InquiryManagementPage';
import StaffUserManagementPage from './StaffUserManagementPage';
import StaffDashboardHome from './StaffDashboardHome';

// ─── Reused user pages ───
import NotificationCenter from '../NotificationCenter';
import ProfilePage from '../ProfilePage';

// ─── Imported admin management pages ───
import KycManagement from '../admin/KycManagement';
import NewsManagement from '../admin/NewsManagement';
import ProjectManagement from '../admin/ProjectManagement';

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
    // Nội dung
    case 'news-management': return <NewsManagement />;
    case 'project-management': return <ProjectManagement />;
    // Cá nhân
    case 'notifications': return <NotificationCenter />;
    case 'profile': return <ProfilePage />;
    default: return null;
  }
};

export default StaffContentRouter;
