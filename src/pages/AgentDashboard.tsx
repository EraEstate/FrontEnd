import React, { useState } from 'react';
import { 
  Home, Building, FileText, MessageSquare,
  Settings, Bell, DollarSign, Eye, Heart,
  Briefcase, BarChart3,
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

// Agent Stats Cards Component
const AgentStatsCard: React.FC<{
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
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
      active
        ? 'bg-blue-50 text-blue-700 font-medium'
        : 'text-gray-700 hover:bg-gray-50'
    }`}
  >
    <span className="mr-3">{icon}</span>
    <span>{label}</span>
  </button>
);

type AgentView = 
  | 'dashboard'
  | 'properties'
  | 'post-property'
  | 'projects'
  | 'inquiries'
  | 'notifications'
  | 'payments'
  | 'profile';

const AgentDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<AgentView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard' as AgentView, icon: <BarChart3 className="w-5 h-5" />, label: 'Tổng quan' },
    { id: 'properties' as AgentView, icon: <Home className="w-5 h-5" />, label: 'Tin đăng của tôi' },
    { id: 'post-property' as AgentView, icon: <FileText className="w-5 h-5" />, label: 'Đăng tin mới' },
    { id: 'projects' as AgentView, icon: <Building className="w-5 h-5" />, label: 'Dự án' },
    { id: 'inquiries' as AgentView, icon: <MessageSquare className="w-5 h-5" />, label: 'Yêu cầu tư vấn' },
    { id: 'notifications' as AgentView, icon: <Bell className="w-5 h-5" />, label: 'Thông báo' },
    { id: 'payments' as AgentView, icon: <DollarSign className="w-5 h-5" />, label: 'Thanh toán' },
    { id: 'profile' as AgentView, icon: <Settings className="w-5 h-5" />, label: 'Hồ sơ' },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng, {user?.fullName}!</h1>
              <p className="text-gray-600">Quản lý tin đăng và dự án của bạn</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AgentStatsCard
                icon={<Home className="w-6 h-6 text-blue-600" />}
                title="Tổng tin đăng"
                value="0"
                change="+0"
                changeType="up"
                color="bg-blue-50"
              />
              <AgentStatsCard
                icon={<Eye className="w-6 h-6 text-green-600" />}
                title="Lượt xem"
                value="0"
                change="+0"
                changeType="up"
                color="bg-green-50"
              />
              <AgentStatsCard
                icon={<MessageSquare className="w-6 h-6 text-purple-600" />}
                title="Yêu cầu tư vấn"
                value="0"
                change="+0"
                changeType="up"
                color="bg-purple-50"
              />
              <AgentStatsCard
                icon={<Heart className="w-6 h-6 text-red-600" />}
                title="Lượt yêu thích"
                value="0"
                change="+0"
                changeType="up"
                color="bg-red-50"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tin đăng gần đây</h3>
                <div className="text-center py-8 text-gray-500">
                  <Home className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Chưa có tin đăng nào</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Yêu cầu tư vấn mới</h3>
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Chưa có yêu cầu nào</p>
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`bg-white shadow-lg transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className={`flex items-center ${sidebarOpen ? '' : 'justify-center w-full'}`}>
            <Briefcase className="w-8 h-8 text-blue-600" />
            {sidebarOpen && (
              <span className="ml-2 text-xl font-bold text-gray-900">Agent Panel</span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <MenuItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={currentView === item.id}
              onClick={() => setCurrentView(item.id)}
            />
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AgentDashboard;

