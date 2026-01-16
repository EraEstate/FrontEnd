import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Home, Building, FileText, MessageSquare,
  Settings, Bell, DollarSign, Eye, Heart,
  Briefcase, BarChart3, BookOpen, Newspaper, TrendingUp,
  LogOut, Menu, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import MyPropertiesPage from './MyPropertiesPage';
import PostPropertyPage from './PostPropertyPage';
import ProjectsPage from './ProjectsPage';
import InquiryPage from './InquiryPage';
import NotificationCenter from './NotificationCenter';
import PaymentHistoryPage from './PaymentHistoryPage';
import ProfilePage from './ProfilePage';
import NewsPage from './NewsPage';
import WikiPage from './WikiPage';
import PropertyModerationPage from './staff/PropertyModerationPage';
import InquiryManagementPage from './staff/InquiryManagementPage';

// Staff Stats Cards Component
const StaffStatsCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'up' | 'down';
  color: string;
}> = ({ icon, title, value, change, changeType, color }) => (
  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
      {change && (
        <span className={`text-sm font-medium ${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      )}
    </div>
    <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

// Sidebar Menu Item Component
const MenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  collapsed: boolean;
}> = ({ icon, label, active, onClick, collapsed }) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`w-full flex items-center rounded-lg transition-all duration-200 ${
      collapsed 
        ? 'justify-center px-3 py-3' 
        : 'px-4 py-3'
    } ${
      active
        ? 'bg-red-50 text-red-700 font-medium'
        : 'text-gray-700 hover:bg-gray-50'
    }`}
  >
    <span className={collapsed ? '' : 'mr-3'}>{icon}</span>
    {!collapsed && <span className="whitespace-nowrap">{label}</span>}
  </button>
);

type StaffView = 
  | 'dashboard'
  | 'properties'
  | 'post-property'
  | 'property-moderation'
  | 'projects'
  | 'inquiries'
  | 'inquiry-management'
  | 'news'
  | 'wiki'
  | 'notifications'
  | 'payments'
  | 'profile';

const StaffDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<StaffView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard' as StaffView, icon: <BarChart3 className="w-5 h-5" />, label: 'Tổng quan' },
    { id: 'properties' as StaffView, icon: <Home className="w-5 h-5" />, label: 'Tin đăng của tôi' },
    { id: 'post-property' as StaffView, icon: <FileText className="w-5 h-5" />, label: 'Đăng tin mới' },
    { id: 'property-moderation' as StaffView, icon: <Eye className="w-5 h-5" />, label: 'Duyệt tin đăng' },
    { id: 'projects' as StaffView, icon: <Building className="w-5 h-5" />, label: 'Dự án' },
    { id: 'inquiries' as StaffView, icon: <MessageSquare className="w-5 h-5" />, label: 'Yêu cầu của tôi' },
    { id: 'inquiry-management' as StaffView, icon: <MessageSquare className="w-5 h-5" />, label: 'Quản lý yêu cầu' },
    { id: 'news' as StaffView, icon: <Newspaper className="w-5 h-5" />, label: 'Tin tức' },
    { id: 'wiki' as StaffView, icon: <BookOpen className="w-5 h-5" />, label: 'Wiki' },
    { id: 'notifications' as StaffView, icon: <Bell className="w-5 h-5" />, label: 'Thông báo' },
    { id: 'payments' as StaffView, icon: <DollarSign className="w-5 h-5" />, label: 'Thanh toán' },
    { id: 'profile' as StaffView, icon: <Settings className="w-5 h-5" />, label: 'Hồ sơ' },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng, {user?.fullName}!</h1>
              <p className="text-gray-600">Quản lý tin đăng, dự án và nội dung</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StaffStatsCard
                icon={<Home className="w-6 h-6 text-red-600" />}
                title="Tổng tin đăng"
                value="0"
                change="+0"
                changeType="up"
                color="bg-red-50"
              />
              <StaffStatsCard
                icon={<Newspaper className="w-6 h-6 text-green-600" />}
                title="Bài viết tin tức"
                value="0"
                change="+0"
                changeType="up"
                color="bg-green-50"
              />
              <StaffStatsCard
                icon={<BookOpen className="w-6 h-6 text-purple-600" />}
                title="Wiki articles"
                value="0"
                change="+0"
                changeType="up"
                color="bg-purple-50"
              />
              <StaffStatsCard
                icon={<MessageSquare className="w-6 h-6 text-orange-600" />}
                title="Yêu cầu tư vấn"
                value="0"
                change="+0"
                changeType="up"
                color="bg-orange-50"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Tin đăng gần đây</h3>
                  <button
                    onClick={() => setCurrentView('properties')}
                    className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                  >
                    Xem tất cả →
                  </button>
                </div>
                <div className="text-center py-8 text-gray-500">
                  <Home className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Chưa có tin đăng nào</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Tin tức gần đây</h3>
                  <button
                    onClick={() => setCurrentView('news')}
                    className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                  >
                    Xem tất cả →
                  </button>
                </div>
                <div className="text-center py-8 text-gray-500">
                  <Newspaper className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Chưa có tin tức nào</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'properties':
        return <MyPropertiesPage />;
      case 'post-property':
        return <PostPropertyPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'inquiries':
        return <InquiryPage />;
      case 'inquiry-management':
        return <InquiryManagementPage />;
      case 'property-moderation':
        return <PropertyModerationPage />;
      case 'news':
        return <NewsPage />;
      case 'wiki':
        return <WikiPage />;
      case 'notifications':
        return <NotificationCenter />;
      case 'payments':
        return <PaymentHistoryPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-white shadow-lg transition-all duration-300 flex flex-col h-full relative ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}>
        <div className={`border-b border-gray-200 flex items-center justify-between flex-shrink-0 z-10 bg-white ${
          sidebarOpen ? 'p-4' : 'p-3'
        }`}>
          <div className={`flex items-center ${sidebarOpen ? '' : 'justify-center w-full'}`}>
            <Briefcase className={`text-red-600 ${sidebarOpen ? 'w-8 h-8' : 'w-6 h-6'}`} />
            {sidebarOpen && (
              <span className="ml-2 text-xl font-bold text-gray-900">Staff Panel</span>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Thu gọn sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Toggle button khi collapsed */}
        {!sidebarOpen && (
          <div className="p-2 border-b border-gray-200 flex justify-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Mở rộng sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        )}

        <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-4 space-y-1">
          <div className={sidebarOpen ? 'px-4' : 'px-2'}>
            {menuItems.map((item) => (
              <MenuItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={currentView === item.id}
                onClick={() => setCurrentView(item.id)}
                collapsed={!sidebarOpen}
              />
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-white z-10">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${sidebarOpen ? 'justify-start px-4' : 'justify-center px-2'} py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors`}
          >
            <LogOut className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : ''}`} />
            {sidebarOpen && <span className="text-sm font-medium">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-full">
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;

