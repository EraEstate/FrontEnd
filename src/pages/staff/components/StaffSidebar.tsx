import React from 'react';
import {
  Home, Building, FileText, MessageSquare,
  Settings, Bell, DollarSign, Eye,
  Briefcase, BarChart3, BookOpen, Newspaper,
  LogOut, ExternalLink, Menu, X, Sun, Moon,
  Users, UserCog, Shield, TrendingUp, Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { useAdminTheme } from '../../../contexts/AdminThemeContext';
import type { StaffView, MenuSection, StaffStats } from '../types';

// ─── Menu Item ───
const MenuItem: React.FC<{
  icon: React.ReactNode; label: string; active: boolean; onClick: () => void; collapsed: boolean; badge?: number; theme: string;
}> = ({ icon, label, active, onClick, collapsed, badge, theme }) => (
  <div className="relative group">
    <button onClick={onClick} title={collapsed ? label : undefined}
      className={`w-full flex items-center rounded-xl transition-all duration-200 ${
        collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'
      } ${
        active
          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-200/50'
          : theme === 'dark'
          ? 'text-slate-300 hover:bg-slate-700/60'
          : 'text-gray-600 hover:bg-gray-50'
      }`}>
      <span className={`relative flex items-center justify-center ${active ? 'text-white' : theme === 'dark' ? 'text-slate-400 group-hover:text-red-400' : 'text-gray-500 group-hover:text-red-600'}`}>
        {icon}
        {badge !== undefined && badge > 0 && collapsed && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </span>
      {!collapsed && <span className="whitespace-nowrap flex-1 text-left text-sm font-medium">{label}</span>}
      {!collapsed && badge !== undefined && badge > 0 && (
        <span className={`px-2 py-0.5 text-xs font-bold rounded-full min-w-[20px] text-center ${
          active ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
        }`}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
    
    {/* Tooltip for collapsed state */}
    {collapsed && (
      <div className={`absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl border ${
        theme === 'dark' ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-gray-900 text-white border-transparent'
      }`}>
        <div className={`absolute left-0 top-1/2 -translate-x-1.5 -translate-y-1/2 w-3 h-3 rotate-45 border-l border-b ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-900 border-transparent'
        }`} />
        {label}
        {badge !== undefined && badge > 0 && <span className="ml-2 text-red-400">({badge})</span>}
      </div>
    )}
  </div>
);

// ─── Section Header ───
const SectionHeader: React.FC<{ title: string; collapsed: boolean; theme: string }> = ({ title, collapsed, theme }) => {
  if (collapsed) return <div className={`my-2 mx-2 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`} />;
  return (
    <div className="px-4 pt-4 pb-1.5">
      <p className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>{title}</p>
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
    ],
  },
  {
    title: 'Nội dung',
    items: [
      { id: 'news-management', icon: <Newspaper className="w-5 h-5" />, label: 'Quản lý Tin tức' },
      { id: 'project-management', icon: <Package className="w-5 h-5" />, label: 'Quản lý Dự án' },
    ],
  },
  {
    title: 'Hệ thống',
    items: [
      { id: 'notifications', icon: <Bell className="w-5 h-5" />, label: 'Thông báo' },
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
  theme: string;
  toggleTheme: () => void;
}> = ({ collapsed, menuSections, currentView, onMenuClick, onLogout, theme, toggleTheme }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <>
      <nav className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-3 scrollbar-hide ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
        {menuSections.map((section) => (
          <div key={section.title} className="mb-2">
            <SectionHeader title={section.title} collapsed={collapsed} theme={theme} />
            <div className={`space-y-1 ${collapsed ? 'px-2 pt-1' : 'px-3'}`}>
              {section.items.map((item) => (
                <MenuItem 
                  key={item.id} icon={item.icon} label={item.label} 
                  active={currentView === item.id}
                  onClick={() => onMenuClick(item.id)} 
                  collapsed={collapsed} badge={item.badge} theme={theme} 
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
      
      {/* Bottom Footer Section */}
      <div className={`flex-shrink-0 border-t ${theme === 'dark' ? 'border-slate-700 bg-slate-800/90 backdrop-blur-md' : 'border-gray-100 bg-white'}`}>
        <div className={`p-3 space-y-2`}>
          {/* Theme Toggle */}
          <button onClick={toggleTheme} title={collapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
            className={`w-full flex items-center ${collapsed ? 'justify-center p-3' : 'px-4 py-2.5 gap-3'} rounded-xl transition-colors ${
              theme === 'dark' ? 'text-slate-300 hover:bg-slate-700/60' : 'text-gray-600 hover:bg-gray-50'
            }`}>
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {!collapsed && <span className="text-sm font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          {/* Về trang chủ */}
          <button onClick={() => navigate('/')} title={collapsed ? 'Về trang chủ' : undefined}
            className={`w-full flex items-center ${collapsed ? 'justify-center p-3' : 'px-4 py-2.5 gap-3'} rounded-xl transition-colors ${
              theme === 'dark' ? 'text-slate-300 hover:bg-slate-700/60' : 'text-gray-600 hover:bg-gray-50'
            }`}>
            <ExternalLink className="w-5 h-5" />
            {!collapsed && <span className="text-sm font-medium">Về trang chủ</span>}
          </button>

          {/* User Profile */}
          {!collapsed && (
            <div className={`flex items-center gap-3 px-3 py-2 rounded-xl mt-2 ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-bold truncate ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>{user?.fullName}</p>
                <p className={`text-xs truncate ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Kiểm duyệt viên</p>
              </div>
            </div>
          )}

          {/* Đăng xuất */}
          <button onClick={onLogout} title={collapsed ? 'Đăng xuất' : undefined}
            className={`w-full flex items-center ${collapsed ? 'justify-center p-3' : 'px-4 py-2.5 gap-3'} rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors ${
              theme === 'dark' ? 'hover:bg-red-500/10' : ''
            }`}>
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="text-sm font-bold">Đăng xuất</span>}
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
}) => {
  const { theme, toggleTheme } = useAdminTheme();

  return (
    <>
      {/* Mobile hamburger */}
      <button onClick={onOpenMobile}
        className={`md:hidden fixed top-4 left-4 z-40 p-2 rounded-xl shadow-md border ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700 shadow-slate-900/20' : 'bg-white border-gray-200'
        }`}>
        <Menu className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-700'}`} />
      </button>

      {/* Mobile overlay sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onCloseMobile} />
          <aside className={`relative w-72 h-full shadow-2xl flex flex-col transition-transform transform ${
            theme === 'dark' ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className={`p-4 flex items-center justify-between border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-100'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <span className={`text-base font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>Staff Panel</span>
              </div>
              <button onClick={onCloseMobile} className={`p-1.5 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent collapsed={false} menuSections={menuSections}
              currentView={currentView} onMenuClick={onMenuClick} onLogout={onLogout} theme={theme} toggleTheme={toggleTheme} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex flex-col h-full transition-all duration-300 ease-in-out border-r z-20 ${
        sidebarOpen ? 'w-[280px]' : 'w-[80px]'
      } ${
        theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`flex items-center flex-shrink-0 border-b ${
          theme === 'dark' ? 'border-slate-700' : 'border-gray-100'
        } ${sidebarOpen ? 'p-4 justify-between' : 'p-3 justify-center'}`}>
          <div className={`flex items-center ${sidebarOpen ? 'gap-2.5' : 'justify-center w-full'}`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            {sidebarOpen && <span className={`text-base font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>Staff</span>}
          </div>
          {sidebarOpen && (
            <button onClick={() => onToggleSidebar(false)} className={`p-1.5 rounded-lg transition-colors ${
              theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-gray-400 hover:bg-gray-100'
            }`}><X className="w-4 h-4" /></button>
          )}
        </div>
        {!sidebarOpen && (
          <div className={`p-2 border-b flex justify-center ${theme === 'dark' ? 'border-slate-700' : 'border-gray-100'}`}>
            <button onClick={() => onToggleSidebar(true)} className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-gray-500 hover:bg-gray-100'
            }`}><Menu className="w-5 h-5" /></button>
          </div>
        )}
        <SidebarContent collapsed={!sidebarOpen} menuSections={menuSections}
          currentView={currentView} onMenuClick={onMenuClick} onLogout={onLogout} theme={theme} toggleTheme={toggleTheme} />
      </aside>
    </>
  );
};

export default StaffSidebar;
