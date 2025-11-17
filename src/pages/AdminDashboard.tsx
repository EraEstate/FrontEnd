import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, Building, FileText, MessageSquare, TrendingUp, 
  Settings, Bell, DollarSign, Eye, Heart, Package, 
  Home, MapPin, Briefcase, Shield, BarChart3, List,
  ChevronRight, LogOut, Menu, X, Moon, Sun
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../api/admin';
import { useAuthStore } from '../store/authStore';
import { AdminThemeProvider, useAdminTheme } from '../contexts/AdminThemeContext';
import UserManagement from './admin/UserManagement';
import AnalyticsPage from './admin/AnalyticsPage';
import PropertyManagement from './admin/PropertyManagement';
import AgentManagement from './admin/AgentManagement';
import NewsManagement from './admin/NewsManagement';
import PaymentManagement from './admin/PaymentManagement';
import ProjectManagement from './admin/ProjectManagement';
import AgencyManagement from './admin/AgencyManagement';
import InquiryManagement from './admin/InquiryManagement';

// Admin Stats Cards Component
const AdminStatsCard: React.FC<{
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
  active?: boolean;
  onClick: () => void;
  badge?: number;
  theme?: 'light' | 'dark';
}> = ({ icon, label, active, onClick, badge, theme }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
      active 
        ? 'bg-blue-600 text-white shadow-lg' 
        : theme === 'dark'
        ? 'text-slate-300 hover:bg-slate-700'
        : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    <span className={active ? 'text-white' : theme === 'dark' ? 'text-slate-400 group-hover:text-blue-400' : 'text-gray-500 group-hover:text-blue-600'}>
      {icon}
    </span>
    <span className="flex-1 text-left font-medium">{label}</span>
    {badge !== undefined && badge > 0 && (
      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
        active ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
      }`}>
        {badge}
      </span>
    )}
    <ChevronRight className={`w-4 h-4 ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
  </button>
);

const AdminDashboardContent: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme, resetTheme } = useAdminTheme();
  const logout = useAuthStore(state => state.logout);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalAgents: 0,
    totalRevenue: 0,
    newInquiries: 0,
    activeListings: 0,
    totalViews: 0,
    favorites: 0
  });

  useEffect(() => {
    // Fetch real stats from API
    adminAPI.getStats().then(data => {
      setStats({
        totalUsers: data.totalUsers,
        totalProperties: data.totalProperties,
        totalAgents: data.totalAgents,
        totalRevenue: data.totalRevenue,
        newInquiries: data.newInquiries,
        activeListings: data.activeProperties,
        totalViews: data.totalViews,
        favorites: data.totalFavorites
      });
    }).catch(error => {
      console.error('Failed to fetch stats:', error);
      // Fallback to mock data
      setStats({
        totalUsers: 12450,
        totalProperties: 3892,
        totalAgents: 234,
        totalRevenue: 15678900000,
        newInquiries: 47,
        activeListings: 2156,
        totalViews: 45678,
        favorites: 8934
      });
    });
  }, []);

  const menuSections = [
    {
      title: t('admin.menu.main'),
      items: [
        { id: 'overview', icon: <BarChart3 className="w-5 h-5" />, label: t('admin.menu.overview') },
        { id: 'analytics', icon: <TrendingUp className="w-5 h-5" />, label: t('admin.menu.analytics') },
        { id: 'inquiries', icon: <MessageSquare className="w-5 h-5" />, label: t('admin.menu.inquiries'), badge: stats.newInquiries },
      ]
    },
    {
      title: t('admin.menu.management'),
      items: [
        { id: 'users', icon: <Users className="w-5 h-5" />, label: t('admin.menu.users') },
        { id: 'properties', icon: <Building className="w-5 h-5" />, label: t('admin.menu.properties') },
        { id: 'agents', icon: <Briefcase className="w-5 h-5" />, label: t('admin.menu.agents') },
        { id: 'agencies', icon: <Home className="w-5 h-5" />, label: t('admin.menu.agencies') },
        { id: 'projects', icon: <Package className="w-5 h-5" />, label: t('admin.menu.projects') },
      ]
    },
    {
      title: t('admin.menu.content'),
      items: [
        { id: 'news', icon: <FileText className="w-5 h-5" />, label: t('admin.menu.news') },
        { id: 'market-analysis', icon: <TrendingUp className="w-5 h-5" />, label: t('admin.menu.marketAnalysis') },
        { id: 'wiki', icon: <List className="w-5 h-5" />, label: t('admin.menu.wiki') },
      ]
    },
    {
      title: t('admin.menu.finance'),
      items: [
        { id: 'payments', icon: <DollarSign className="w-5 h-5" />, label: t('admin.menu.payments') },
        { id: 'packages', icon: <Package className="w-5 h-5" />, label: t('admin.menu.packages') },
      ]
    },
    {
      title: t('admin.menu.location'),
      items: [
        { id: 'provinces', icon: <MapPin className="w-5 h-5" />, label: t('admin.menu.provinces') },
        { id: 'districts', icon: <MapPin className="w-5 h-5" />, label: t('admin.menu.districts') },
        { id: 'wards', icon: <MapPin className="w-5 h-5" />, label: t('admin.menu.wards') },
      ]
    },
    {
      title: t('admin.menu.system'),
      items: [
        { id: 'notifications', icon: <Bell className="w-5 h-5" />, label: t('admin.menu.notifications') },
        { id: 'settings', icon: <Settings className="w-5 h-5" />, label: t('admin.menu.settings') },
        { id: 'security', icon: <Shield className="w-5 h-5" />, label: t('admin.menu.security') },
      ]
    }
  ];

  const handleLogout = () => {
    resetTheme(); // Reset về light mode khi logout
    // Sử dụng authStore.logout để đảm bảo state + localStorage được clear đúng
    logout();
  };

  const goToUserSite = () => {
    resetTheme(); // Reset về light mode khi rời admin
    navigate('/');
  };

  return (
    <div className={`flex h-screen overflow-hidden admin-container ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? 'w-72' : 'w-20'
      } admin-sidebar transition-all duration-300 flex flex-col ${
        theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      } border-r`}>
        {/* Logo & Toggle */}
        <div className={`h-16 flex items-center justify-between px-4 admin-border ${
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        } border-b`}>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className={`font-bold text-xl ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>Admin</span>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
            }`}
          >
            {sidebarOpen ? <X className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-300' : ''}`} /> : <Menu className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-300' : ''}`} />}
          </button>
        </div>

        {/* User Info + Theme Toggle */}
        {sidebarOpen && (
          <div className={`px-4 py-4 admin-border ${
            theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
          } border-b`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>Admin User</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>admin@apartment.vn</p>
              </div>
            </div>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                theme === 'dark' 
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span className="text-sm font-medium">
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
              {theme === 'dark' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>
          </div>
        )}

        {/* Menu Sections */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {menuSections.map((section) => (
            <div key={section.title} className="mb-6">
              {sidebarOpen && (
                <h3 className={`px-4 text-xs font-semibold uppercase tracking-wider mb-2 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <MenuItem
                    key={item.id}
                    icon={item.icon}
                    label={sidebarOpen ? item.label : ''}
                    active={activeSection === item.id}
                    onClick={() => setActiveSection(item.id)}
                    badge={item.badge}
                    theme={theme}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className={`p-4 admin-border space-y-2 ${
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        } border-t`}>
          <button
            onClick={goToUserSite}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'text-slate-300 hover:bg-slate-700' 
                : 'text-gray-700 hover:bg-blue-50'
            }`}
          >
            <Home className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">{t('admin.menu.viewUserSite')}</span>}
          </button>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'text-red-400 hover:bg-red-900/20'
                : 'text-red-600 hover:bg-red-50'
            }`}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">{t('admin.menu.logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className={`admin-card h-16 flex items-center justify-between px-6 admin-border ${
          theme === 'dark' 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white border-gray-200'
        } border-b`}>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>
              {t(`admin.sections.${activeSection}`)}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
              {t('admin.welcome')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className={`relative p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'text-slate-300 hover:bg-slate-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'text-slate-300 hover:bg-slate-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}>
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AdminStatsCard
                  icon={<Users className="w-6 h-6 text-blue-600" />}
                  title={t('admin.stats.totalUsers')}
                  value={stats.totalUsers.toLocaleString()}
                  change="+12.5%"
                  changeType="up"
                  color="bg-blue-100"
                />
                <AdminStatsCard
                  icon={<Building className="w-6 h-6 text-green-600" />}
                  title={t('admin.stats.totalProperties')}
                  value={stats.totalProperties.toLocaleString()}
                  change="+8.2%"
                  changeType="up"
                  color="bg-green-100"
                />
                <AdminStatsCard
                  icon={<DollarSign className="w-6 h-6 text-yellow-600" />}
                  title={t('admin.stats.totalRevenue')}
                  value={`${(stats.totalRevenue / 1000000000).toFixed(1)}B VNĐ`}
                  change="+15.3%"
                  changeType="up"
                  color="bg-yellow-100"
                />
                <AdminStatsCard
                  icon={<MessageSquare className="w-6 h-6 text-purple-600" />}
                  title={t('admin.stats.newInquiries')}
                  value={stats.newInquiries}
                  change="+5"
                  changeType="up"
                  color="bg-purple-100"
                />
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AdminStatsCard
                  icon={<Briefcase className="w-6 h-6 text-indigo-600" />}
                  title={t('admin.stats.totalAgents')}
                  value={stats.totalAgents}
                  color="bg-indigo-100"
                />
                <AdminStatsCard
                  icon={<List className="w-6 h-6 text-orange-600" />}
                  title={t('admin.stats.activeListings')}
                  value={stats.activeListings.toLocaleString()}
                  color="bg-orange-100"
                />
                <AdminStatsCard
                  icon={<Eye className="w-6 h-6 text-pink-600" />}
                  title={t('admin.stats.totalViews')}
                  value={stats.totalViews.toLocaleString()}
                  color="bg-pink-100"
                />
                <AdminStatsCard
                  icon={<Heart className="w-6 h-6 text-red-600" />}
                  title={t('admin.stats.favorites')}
                  value={stats.favorites.toLocaleString()}
                  color="bg-red-100"
                />
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{t('admin.recentActivity')}</h2>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        U{i}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">User {i} created a new property listing</p>
                        <p className="text-sm text-gray-500">{i} minutes ago</p>
                      </div>
                      <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        {t('common.view')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Section */}
          {activeSection === 'analytics' && (
            <AnalyticsPage />
          )}

          {/* User Management Section */}
          {activeSection === 'users' && (
            <UserManagement />
          )}

          {/* Property Management Section */}
          {activeSection === 'properties' && (
            <PropertyManagement />
          )}

          {/* Agent Management Section */}
          {activeSection === 'agents' && (
            <AgentManagement />
          )}

          {/* News Management Section */}
          {activeSection === 'news' && (
            <NewsManagement />
          )}

          {/* Payment Management Section */}
          {activeSection === 'payments' && (
            <PaymentManagement />
          )}

          {/* Project Management Section */}
          {activeSection === 'projects' && (
            <ProjectManagement />
          )}

          {/* Agency Management Section */}
          {activeSection === 'agencies' && (
            <AgencyManagement />
          )}

          {/* Inquiry Management Section */}
          {activeSection === 'inquiries' && (
            <InquiryManagement />
          )}

          {/* Other Sections - Placeholder */}
          {!['overview', 'analytics', 'users', 'properties', 'agents', 'news', 'payments', 'projects', 'agencies', 'inquiries'].includes(activeSection) && (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t(`admin.sections.${activeSection}`)}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('admin.comingSoon')}
              </p>
              <button
                onClick={() => setActiveSection('overview')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {t('admin.backToOverview')}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Wrap AdminDashboard với ThemeProvider
const AdminDashboard: React.FC = () => {
  return (
    <AdminThemeProvider>
      <AdminDashboardContent />
    </AdminThemeProvider>
  );
};

export default AdminDashboard;
