import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, BookOpen, Newspaper, TrendingUp, 
  Settings, Bell, Eye, Edit, Plus,
  ChevronRight, LogOut, Menu, X, CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import NewsPage from './NewsPage';
import WikiPage from './WikiPage';
import NotificationCenter from './NotificationCenter';
import ProfilePage from './ProfilePage';

// Editor Stats Cards Component
const EditorStatsCard: React.FC<{
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

type EditorView = 
  | 'dashboard'
  | 'news'
  | 'wiki'
  | 'notifications'
  | 'profile';

const EditorDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<EditorView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard' as EditorView, icon: <TrendingUp className="w-5 h-5" />, label: 'Tổng quan' },
    { id: 'news' as EditorView, icon: <Newspaper className="w-5 h-5" />, label: 'Tin tức' },
    { id: 'wiki' as EditorView, icon: <BookOpen className="w-5 h-5" />, label: 'Wiki' },
    { id: 'notifications' as EditorView, icon: <Bell className="w-5 h-5" />, label: 'Thông báo' },
    { id: 'profile' as EditorView, icon: <Settings className="w-5 h-5" />, label: 'Hồ sơ' },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng, {user?.fullName}!</h1>
              <p className="text-gray-600">Quản lý nội dung tin tức và wiki</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <EditorStatsCard
                icon={<Newspaper className="w-6 h-6 text-blue-600" />}
                title="Tổng bài viết"
                value="0"
                change="+0"
                changeType="up"
                color="bg-blue-50"
              />
              <EditorStatsCard
                icon={<BookOpen className="w-6 h-6 text-green-600" />}
                title="Wiki articles"
                value="0"
                change="+0"
                changeType="up"
                color="bg-green-50"
              />
              <EditorStatsCard
                icon={<Eye className="w-6 h-6 text-purple-600" />}
                title="Tổng lượt xem"
                value="0"
                change="+0"
                changeType="up"
                color="bg-purple-50"
              />
              <EditorStatsCard
                icon={<CheckCircle className="w-6 h-6 text-orange-600" />}
                title="Đã publish"
                value="0"
                change="+0"
                changeType="up"
                color="bg-orange-50"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Tin tức gần đây</h3>
                  <button
                    onClick={() => setCurrentView('news')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Xem tất cả →
                  </button>
                </div>
                <div className="text-center py-8 text-gray-500">
                  <Newspaper className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Chưa có tin tức nào</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Wiki articles gần đây</h3>
                  <button
                    onClick={() => setCurrentView('wiki')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Xem tất cả →
                  </button>
                </div>
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Chưa có bài viết nào</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'news':
        return <NewsPage />;
      case 'wiki':
        return <WikiPage />;
      case 'notifications':
        return <NotificationCenter />;
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
            <Edit className="w-8 h-8 text-blue-600" />
            {sidebarOpen && (
              <span className="ml-2 text-xl font-bold text-gray-900">Editor Panel</span>
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

export default EditorDashboard;

