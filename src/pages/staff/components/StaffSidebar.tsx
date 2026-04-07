import React from 'react';
import {
  Home, Building, FileText, MessageSquare,
  Settings, Bell, DollarSign, Eye,
  Briefcase, BarChart3, BookOpen, Newspaper,
  LogOut, ExternalLink, Menu, X,
  Users, UserCog, Shield, TrendingUp, Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import type { StaffView, MenuSection, StaffStats } from '../types';

// ─── Menu Item ───
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

// ─── Section Header ───
const SectionHeader: React.FC<{ title: string; collapsed: boolean }> = ({ title, collapsed }) => {
  if (collapsed) return <div className="my-2 mx-2 border-t border-gray-200" />;
  return (
    <div className="px-4 pt-4 pb-1.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{title}</p>
    </div>
  );
};

// ─── Build menu sections ───
export const buildMenuSections = (stats: StaffStats | null): MenuSection[] => [
  {
    title: 'Kiểm duyệt',
    items: [
      { id: 'dashboard', icon: <BarChart3 className="w-5 h-5" />, label: 'Tổng quan' },
      { id: 'property-moderation', icon: <Eye className="w-5 h-5" />, label: 'Duyệt tin đăng', badge: stats?.pendingCount },
      { id: 'kyc-management', icon: <Shield className="w-5 h-5" />, label: 'Duyệt KYC' },
      { id: 'inquiry-management', icon: <MessageSquare className="w-5 h-5" />, label: 'Quản lý yêu cầu' },
    ],
  },
  {
    title: 'Quản lý hệ thống',
    items: [
      { id: 'user-management', icon: <Users className="w-5 h-5" />, label: 'Quản lý User' },
      { id: 'property-management', icon: <Building className="w-5 h-5" />, label: 'Quản lý BĐS' },
      { id: 'agent-management', icon: <UserCog className="w-5 h-5" />, label: 'Quản lý Agent' },
      { id: 'agency-management', icon: <Briefcase className="w-5 h-5" />, label: 'Quản lý Agency' },
      { id: 'payment-management', icon: <DollarSign className="w-5 h-5" />, label: 'Quản lý Thanh toán' },
    ],
  },
  {
    title: 'Nội dung',
    items: [
      { id: 'news-management', icon: <Newspaper className="w-5 h-5" />, label: 'Quản lý Tin tức' },
      { id: 'project-management', icon: <Package className="w-5 h-5" />, label: 'Quản lý Dự án' },
      { id: 'market-analysis', icon: <TrendingUp className="w-5 h-5" />, label: 'Phân tích thị trường' },
      { id: 'wiki', icon: <BookOpen className="w-5 h-5" />, label: 'Wiki BĐS' },
    ],
  },
  {
    title: 'Cá nhân',
    items: [
      { id: 'properties', icon: <Home className="w-5 h-5" />, label: 'Tin đăng của tôi' },
      { id: 'post-property', icon: <FileText className="w-5 h-5" />, label: 'Đăng tin mới' },
      { id: 'inquiries', icon: <MessageSquare className="w-5 h-5" />, label: 'Yêu cầu của tôi' },
      { id: 'news', icon: <Newspaper className="w-5 h-5" />, label: 'Tin tức' },
      { id: 'notifications', icon: <Bell className="w-5 h-5" />, label: 'Thông báo' },
      { id: 'payments', icon: <DollarSign className="w-5 h-5" />, label: 'Thanh toán' },
      { id: 'profile', icon: <Settings className="w-5 h-5" />, label: 'Hồ sơ' },
    ],
  },
];

// ─── Sidebar Content (shared between desktop & mobile) ───
const SidebarContent: React.FC<{
  collapsed: boolean;
  menuSections: MenuSection[];
  currentView: StaffView;
  onMenuClick: (view: StaffView) => void;
  onLogout: () => void;
}> = ({ collapsed, menuSections, currentView, onMenuClick, onLogout }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <>
      <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-1">
        {menuSections.map((section) => (
          <div key={section.title}>
            <SectionHeader title={section.title} collapsed={collapsed} />
            <div className={`space-y-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>
              {section.items.map((item) => (
                <div key={item.id} className="relative">
                  <MenuItem icon={item.icon} label={item.label} active={currentView === item.id}
                    onClick={() => onMenuClick(item.id)} collapsed={collapsed} badge={item.badge} />
                </div>
              ))}
            </div>
          </div>
        ))}
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
          <button onClick={onLogout}
            className={`w-full flex items-center ${collapsed ? 'justify-center px-2' : 'justify-start px-4'} py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors`} title="Đăng xuất">
            <LogOut className={`w-4 h-4 ${collapsed ? '' : 'mr-3'}`} />
            {!collapsed && <span className="text-sm font-medium">Đăng xuất</span>}
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Main Sidebar Component ───
interface StaffSidebarProps {
  currentView: StaffView;
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  menuSections: MenuSection[];
  onMenuClick: (view: StaffView) => void;
  onToggleSidebar: (open: boolean) => void;
  onCloseMobile: () => void;
  onOpenMobile: () => void;
  onLogout: () => void;
}

const StaffSidebar: React.FC<StaffSidebarProps> = ({
  currentView, sidebarOpen, mobileMenuOpen, menuSections,
  onMenuClick, onToggleSidebar, onCloseMobile, onOpenMobile, onLogout,
}) => (
  <>
    {/* Mobile hamburger */}
    <button onClick={onOpenMobile}
      className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-xl shadow-md border border-gray-200">
      <Menu className="w-5 h-5 text-gray-700" />
    </button>

    {/* Mobile overlay sidebar */}
    {mobileMenuOpen && (
      <div className="fixed inset-0 z-50 md:hidden">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCloseMobile} />
        <aside className="relative w-72 h-full bg-white shadow-2xl flex flex-col">
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="ml-2.5 text-base font-bold text-gray-900">Staff Panel</span>
            </div>
            <button onClick={onCloseMobile} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <SidebarContent collapsed={false} menuSections={menuSections}
            currentView={currentView} onMenuClick={onMenuClick} onLogout={onLogout} />
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
          <button onClick={() => onToggleSidebar(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
        )}
      </div>
      {!sidebarOpen && (
        <div className="p-2 border-b border-gray-100 flex justify-center">
          <button onClick={() => onToggleSidebar(true)} className="p-2 hover:bg-gray-100 rounded-lg"><Menu className="w-4 h-4 text-gray-500" /></button>
        </div>
      )}
      <SidebarContent collapsed={!sidebarOpen} menuSections={menuSections}
        currentView={currentView} onMenuClick={onMenuClick} onLogout={onLogout} />
    </aside>
  </>
);

export default StaffSidebar;
