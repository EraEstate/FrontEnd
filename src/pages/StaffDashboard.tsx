import React, { useState, useEffect, useCallback } from 'react';
import { 
  Home, Building, FileText, MessageSquare,
  Settings, Bell, DollarSign, Eye,
  Briefcase, BarChart3, BookOpen, Newspaper,
  LogOut, Menu, X, ExternalLink, Clock,
  CheckCircle, XCircle, AlertTriangle, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { staffDashboardAPI } from '../api/staffDashboard';
import { relativeTime } from '../utils/relativeTime';
import toast from '../utils/toast';
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

// ─── Stats Card ───
const StaffStatsCard: React.FC<{
  icon: React.ReactNode; title: string; value: string | number; color: string; bgColor: string; loading?: boolean;
}> = ({ icon, title, value, color, bgColor, loading }) => (
  <div className={`${bgColor} rounded-2xl p-5 border border-white/20 hover:scale-[1.02] transition-transform duration-200`}>
    <div className="flex items-center gap-3 mb-3">
      <div className={`p-2.5 rounded-xl ${color} bg-white/80 shadow-sm`}>{icon}</div>
    </div>
    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
    {loading ? <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" /> : <p className="text-2xl font-bold text-gray-900">{value}</p>}
  </div>
);

// ─── Sidebar Item ───
const MenuItem: React.FC<{
  icon: React.ReactNode; label: string; active: boolean; onClick: () => void; collapsed: boolean; badge?: number;
}> = ({ icon, label, active, onClick, collapsed, badge }) => (
  <button onClick={onClick} title={collapsed ? label : undefined}
    className={`w-full flex items-center rounded-xl transition-all duration-200 ${
      collapsed ? 'justify-center px-3 py-3' : 'px-4 py-2.5'
    } ${active ? 'bg-gradient-to-r from-red-50 to-red-100/80 text-red-700 font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
    <span className={collapsed ? '' : 'mr-3 flex-shrink-0'}>{icon}</span>
    {!collapsed && <span className="whitespace-nowrap flex-1 text-left text-sm">{label}</span>}
    {!collapsed && badge != null && badge > 0 && (
      <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full min-w-[20px] text-center">
        {badge > 99 ? '99+' : badge}
      </span>
    )}
    {collapsed && badge != null && badge > 0 && (
      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
    )}
  </button>
);

type StaffView = 'dashboard' | 'properties' | 'post-property' | 'property-moderation' | 'projects' | 'inquiries' | 'inquiry-management' | 'news' | 'wiki' | 'notifications' | 'payments' | 'profile';

interface StaffStats { pendingCount: number; activeCount: number; rejectedCount: number; totalCount: number; recentPending: any[]; }

const StaffDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<StaffView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await staffDashboardAPI.getStats();
      setStats(data);
    } catch {
      toast.error('Không thể tải thống kê');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Refresh stats khi quay lại dashboard + auto-refresh 60s
  useEffect(() => {
    if (currentView === 'dashboard') {
      fetchStats();
      const interval = setInterval(fetchStats, 60000);
      return () => clearInterval(interval);
    }
  }, [currentView, fetchStats]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleMenuClick = (view: StaffView) => {
    setCurrentView(view);
    setMobileMenuOpen(false); // Close mobile menu on select
  };

  const formatPrice = (price: number) => {
    if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)} tỷ`;
    if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)} triệu`;
    return price.toLocaleString('vi-VN');
  };

  const menuItems = [
    { id: 'dashboard' as StaffView, icon: <BarChart3 className="w-5 h-5" />, label: 'Tổng quan' },
    { id: 'property-moderation' as StaffView, icon: <Eye className="w-5 h-5" />, label: 'Duyệt tin đăng', badge: stats?.pendingCount },
    { id: 'inquiry-management' as StaffView, icon: <MessageSquare className="w-5 h-5" />, label: 'Quản lý yêu cầu' },
    { id: 'properties' as StaffView, icon: <Home className="w-5 h-5" />, label: 'Tin đăng của tôi' },
    { id: 'post-property' as StaffView, icon: <FileText className="w-5 h-5" />, label: 'Đăng tin mới' },
    { id: 'projects' as StaffView, icon: <Building className="w-5 h-5" />, label: 'Dự án' },
    { id: 'inquiries' as StaffView, icon: <MessageSquare className="w-5 h-5" />, label: 'Yêu cầu của tôi' },
    { id: 'news' as StaffView, icon: <Newspaper className="w-5 h-5" />, label: 'Tin tức' },
    { id: 'wiki' as StaffView, icon: <BookOpen className="w-5 h-5" />, label: 'Wiki' },
    { id: 'notifications' as StaffView, icon: <Bell className="w-5 h-5" />, label: 'Thông báo' },
    { id: 'payments' as StaffView, icon: <DollarSign className="w-5 h-5" />, label: 'Thanh toán' },
    { id: 'profile' as StaffView, icon: <Settings className="w-5 h-5" />, label: 'Hồ sơ' },
  ];

  // ── Sidebar Content (shared between desktop & mobile) ──
  const renderSidebarContent = (collapsed: boolean) => (
    <>
      <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-3">
        <div className={`space-y-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>
          {menuItems.map((item) => (
            <div key={item.id} className="relative">
              <MenuItem icon={item.icon} label={item.label} active={currentView === item.id}
                onClick={() => handleMenuClick(item.id)} collapsed={collapsed} badge={item.badge} />
            </div>
          ))}
        </div>
      </nav>
      <div className="border-t border-gray-100 flex-shrink-0 bg-white">
        <div className={`${collapsed ? 'px-2 pt-2' : 'px-3 pt-3'}`}>
          <button onClick={() => navigate('/')}
            className={`w-full flex items-center ${collapsed ? 'justify-center px-3 py-2.5' : 'px-4 py-2.5'} rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors`} title="Về trang chủ">
            <ExternalLink className={`w-4 h-4 ${collapsed ? '' : 'mr-3'}`} />
            {!collapsed && <span className="text-sm">Về trang chủ</span>}
          </button>
        </div>
        <div className={`${collapsed ? 'p-2' : 'p-3'}`}>
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
                <p className="text-xs text-gray-500">Kiểm duyệt viên</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout}
            className={`w-full flex items-center ${collapsed ? 'justify-center px-2' : 'justify-start px-4'} py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors`} title="Đăng xuất">
            <LogOut className={`w-4 h-4 ${collapsed ? '' : 'mr-3'}`} />
            {!collapsed && <span className="text-sm font-medium">Đăng xuất</span>}
          </button>
        </div>
      </div>
    </>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Xin chào, {user?.fullName || 'Staff'}</h1>
        <p className="text-gray-500 text-sm mt-1">Bảng điều khiển kiểm duyệt viên</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StaffStatsCard icon={<Clock className="w-5 h-5 text-amber-600" />} title="Chờ duyệt" value={stats?.pendingCount ?? 0}
          color="text-amber-600" bgColor="bg-gradient-to-br from-amber-50 to-orange-50" loading={statsLoading} />
        <StaffStatsCard icon={<CheckCircle className="w-5 h-5 text-emerald-600" />} title="Đang hiển thị" value={stats?.activeCount ?? 0}
          color="text-emerald-600" bgColor="bg-gradient-to-br from-emerald-50 to-green-50" loading={statsLoading} />
        <StaffStatsCard icon={<XCircle className="w-5 h-5 text-red-600" />} title="Đã từ chối" value={stats?.rejectedCount ?? 0}
          color="text-red-600" bgColor="bg-gradient-to-br from-red-50 to-rose-50" loading={statsLoading} />
        <StaffStatsCard icon={<Home className="w-5 h-5 text-blue-600" />} title="Tổng tin đăng" value={stats?.totalCount ?? 0}
          color="text-blue-600" bgColor="bg-gradient-to-br from-blue-50 to-indigo-50" loading={statsLoading} />
      </div>

      {/* Alert */}
      {stats?.pendingCount != null && stats.pendingCount > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-1">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="font-semibold text-amber-800">Có {stats.pendingCount} tin đang chờ duyệt</span>
          </div>
          <p className="text-sm text-amber-700 mb-3 ml-8">Xem và duyệt tin đăng mới từ người dùng</p>
          <button onClick={() => handleMenuClick('property-moderation')}
            className="ml-8 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium">
            Duyệt ngay <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Recent */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Tin chờ duyệt gần đây</h3>
          <button onClick={() => handleMenuClick('property-moderation')}
            className="text-red-600 hover:text-red-700 text-sm font-medium inline-flex items-center gap-1">
            Xem tất cả <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {statsLoading ? (
          <div className="p-8 space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-14 h-14 bg-gray-200 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : stats?.recentPending && stats.recentPending.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {stats.recentPending.map((p: any) => (
              <div key={p.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {p.mainImageUrl ? <img src={p.mainImageUrl} alt="" className="w-full h-full object-cover" loading="lazy" /> :
                    <div className="w-full h-full flex items-center justify-center"><Home className="w-6 h-6 text-gray-300" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="font-medium text-blue-600">{formatPrice(p.price)}</span>
                    {p.area && <span>{p.area} m²</span>}
                    <span>{relativeTime(p.createdAt)}</span>
                  </div>
                </div>
                <button onClick={() => handleMenuClick('property-moderation')}
                  className="px-3 py-1.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors">Duyệt</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Không có tin đăng nào chờ duyệt</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return renderDashboard();
      case 'properties': return <MyPropertiesPage />;
      case 'post-property': return <PostPropertyPage />;
      case 'projects': return <ProjectsPage />;
      case 'inquiries': return <InquiryPage />;
      case 'inquiry-management': return <InquiryManagementPage />;
      case 'property-moderation': return <PropertyModerationPage />;
      case 'news': return <NewsPage />;
      case 'wiki': return <WikiPage />;
      case 'notifications': return <NotificationCenter />;
      case 'payments': return <PaymentHistoryPage />;
      case 'profile': return <ProfilePage />;
      default: return null;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile hamburger */}
      <button onClick={() => setMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-xl shadow-md border border-gray-200">
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Mobile overlay sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative w-72 h-full bg-white shadow-2xl flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <span className="ml-2.5 text-base font-bold text-gray-900">Staff Panel</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {renderSidebarContent(false)}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex bg-white border-r border-gray-200 transition-all duration-300 flex-col h-full ${sidebarOpen ? 'w-64' : 'w-[68px]'}`}>
        <div className={`border-b border-gray-100 flex items-center flex-shrink-0 bg-white ${sidebarOpen ? 'p-4 justify-between' : 'p-3 justify-center'}`}>
          <div className={`flex items-center ${sidebarOpen ? '' : 'justify-center w-full'}`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            {sidebarOpen && <span className="ml-2.5 text-base font-bold text-gray-900">Staff Panel</span>}
          </div>
          {sidebarOpen && (
            <button onClick={() => setSidebarOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
          )}
        </div>
        {!sidebarOpen && (
          <div className="p-2 border-b border-gray-100 flex justify-center">
            <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg"><Menu className="w-4 h-4 text-gray-500" /></button>
          </div>
        )}
        {renderSidebarContent(!sidebarOpen)}
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto h-full">
        <div className="p-4 md:p-6 max-w-6xl pt-14 md:pt-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;
