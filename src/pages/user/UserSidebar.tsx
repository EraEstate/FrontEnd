import React from 'react';
import {
  BarChart3, Home, Heart, MessageSquare, CalendarDays,
  DollarSign, FileText, CreditCard, TrendingUp, Settings,
  LogOut, ExternalLink, Menu, X, Clock, Wallet, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getImageUrl, getAvatarPlaceholder } from '../../utils/imageUtils';
import type { UserView, UserMenuSection } from './types';

// ─── Menu Item ───
const MenuItem: React.FC<{
  icon: React.ReactNode; label: string; active?: boolean; onClick: () => void;
  badge?: number; collapsed?: boolean;
}> = ({ icon, label, active, onClick, badge, collapsed = false }) => (
  <div className="relative group">
    <button onClick={onClick}
      className={`w-full flex items-center rounded-xl transition-all duration-200 ${
        collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'
      } ${
        active
          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-200/50'
          : 'text-gray-600 hover:bg-gray-50'
      }`}>
      <span className={`relative flex items-center justify-center ${active ? 'text-white' : 'text-gray-500 group-hover:text-red-600'}`}>
        {icon}
        {badge !== undefined && badge > 0 && collapsed && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </span>
      {!collapsed && (
        <>
          <span className="flex-1 text-left text-sm font-medium">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
              active ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
            }`}>
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </>
      )}
    </button>
    {collapsed && (
      <div className="absolute left-full ml-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-900 text-white shadow-lg"
        style={{ top: '50%', transform: 'translateY(-50%)' }}>
        {label}
      </div>
    )}
  </div>
);

// ─── Section Header ───
const SectionHeader: React.FC<{ title: string; collapsed: boolean }> = ({ title, collapsed }) => {
  if (collapsed) return <div className="my-2 mx-2 border-t border-gray-200" />;
  return (
    <div className="px-4 pt-5 pb-1.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{title}</p>
    </div>
  );
};

// ─── Build menu sections ───
export const buildUserMenuSections = (): UserMenuSection[] => [
  {
    title: 'Tổng quan',
    items: [
      { id: 'overview', icon: <BarChart3 className="w-5 h-5" />, label: 'Dashboard' },
      { id: 'activity-log', icon: <Activity className="w-5 h-5" />, label: 'Hoạt động' },
    ],
  },
  {
    title: 'Bất động sản',
    items: [
      { id: 'my-properties', icon: <Home className="w-5 h-5" />, label: 'BĐS của tôi' },
      { id: 'favorites', icon: <Heart className="w-5 h-5" />, label: 'Yêu thích' },
      { id: 'inquiries', icon: <MessageSquare className="w-5 h-5" />, label: 'Yêu cầu liên hệ' },
      { id: 'viewings', icon: <CalendarDays className="w-5 h-5" />, label: 'Lịch hẹn xem' },
    ],
  },
  {
    title: 'Quản lý cho thuê',
    items: [
      { id: 'rental-management', icon: <DollarSign className="w-5 h-5" />, label: 'Dòng tiền thuê' },
      { id: 'contracts', icon: <FileText className="w-5 h-5" />, label: 'Hợp đồng' },
    ],
  },
  {
    title: 'Tài chính',
    items: [
      { id: 'payments', icon: <CreditCard className="w-5 h-5" />, label: 'Thanh toán' },
      { id: 'transaction-history', icon: <Clock className="w-5 h-5" />, label: 'Lịch sử GD' },
      { id: 'bank-accounts', icon: <Wallet className="w-5 h-5" />, label: 'Tài khoản NH' },
      { id: 'analytics', icon: <TrendingUp className="w-5 h-5" />, label: 'Phân tích' },
    ],
  },
  {
    title: 'Cá nhân',
    items: [
      { id: 'calendar', icon: <CalendarDays className="w-5 h-5" />, label: 'Lịch' },
      { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Cài đặt' },
    ],
  },
];

// ─── Sidebar Content ───
const SidebarContent: React.FC<{
  collapsed: boolean;
  menuSections: UserMenuSection[];
  currentView: UserView;
  onMenuClick: (view: UserView) => void;
  onLogout: () => void;
}> = ({ collapsed, menuSections, currentView, onMenuClick, onLogout }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <>
      <nav className={`flex-1 overflow-y-auto overflow-x-hidden ${collapsed ? 'py-2 px-2' : 'py-1 px-2'}`}>
        {menuSections.map((section) => (
          <div key={section.title}>
            <SectionHeader title={section.title} collapsed={collapsed} />
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <MenuItem key={item.id} icon={item.icon} label={item.label}
                  active={currentView === item.id} onClick={() => onMenuClick(item.id)}
                  badge={item.badge} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-100 bg-white flex-shrink-0">
        {/* User info */}
        {!collapsed && (
          <div className="px-3 pt-3">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50">
              <img
                src={getImageUrl(user?.avatar) || getAvatarPlaceholder(36)}
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover border border-gray-200 flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).src = getAvatarPlaceholder(36); }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate text-gray-900">
                  {user?.fullName || 'Người dùng'}
                </p>
                <p className="text-xs truncate text-gray-500">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom actions */}
        <div className={`${collapsed ? 'p-2 space-y-1' : 'p-3 space-y-1'}`}>
          <div className="relative group">
            <button onClick={() => navigate('/')}
              className={`w-full flex items-center rounded-xl transition-colors ${
                collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'
              } text-gray-600 hover:bg-gray-50`}>
              <ExternalLink className="w-4 h-4" />
              {!collapsed && <span className="text-sm font-medium">Về trang chủ</span>}
            </button>
          </div>
          <div className="relative group">
            <button onClick={onLogout}
              className={`w-full flex items-center rounded-xl transition-colors ${
                collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'
              } text-red-600 hover:bg-red-50`}>
              <LogOut className="w-4 h-4" />
              {!collapsed && <span className="text-sm font-medium">Đăng xuất</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Main Sidebar ───
interface UserSidebarProps {
  currentView: UserView;
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  menuSections: UserMenuSection[];
  onMenuClick: (view: UserView) => void;
  onToggleSidebar: (open: boolean) => void;
  onCloseMobile: () => void;
  onOpenMobile: () => void;
  onLogout: () => void;
}

const UserSidebar: React.FC<UserSidebarProps> = ({
  currentView, sidebarOpen, mobileMenuOpen, menuSections,
  onMenuClick, onToggleSidebar, onCloseMobile, onOpenMobile, onLogout,
}) => {
  return (
    <>
      {/* Mobile hamburger */}
      <button onClick={onOpenMobile}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-xl shadow-md border bg-white border-gray-200">
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCloseMobile} />
          <aside className="relative w-72 h-full shadow-2xl flex flex-col bg-white">
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-bold text-gray-900">My Dashboard</span>
              </div>
              <button onClick={onCloseMobile} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <SidebarContent collapsed={false} menuSections={menuSections}
              currentView={currentView} onMenuClick={onMenuClick} onLogout={onLogout} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex transition-all duration-300 flex-col h-full border-r ${
        sidebarOpen ? 'w-[260px]' : 'w-[68px]'
      } bg-white border-gray-200`}>
        <div className={`flex items-center flex-shrink-0 border-b border-gray-100 ${
          sidebarOpen ? 'p-4 justify-between' : 'p-3 justify-center'
        }`}>
          <div className={`flex items-center ${sidebarOpen ? 'gap-2.5' : 'justify-center w-full'}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            {sidebarOpen && <span className="text-base font-bold text-gray-900">Dashboard</span>}
          </div>
          {sidebarOpen && (
            <button onClick={() => onToggleSidebar(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
        {!sidebarOpen && (
          <div className="p-2 border-b border-gray-100 flex justify-center">
            <button onClick={() => onToggleSidebar(true)} className="p-2 rounded-lg hover:bg-gray-100">
              <Menu className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}
        <SidebarContent collapsed={!sidebarOpen} menuSections={menuSections}
          currentView={currentView} onMenuClick={onMenuClick} onLogout={onLogout} />
      </aside>
    </>
  );
};

export default UserSidebar;
