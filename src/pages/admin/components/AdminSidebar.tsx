import React from 'react';
import {
  Users, Building, FileText, MessageSquare, TrendingUp,
  Settings, Bell, DollarSign, Eye,
  Home, Briefcase, Shield, BarChart3, List,
  ChevronRight, LogOut, Menu, X, Moon, Sun, Package,
  ExternalLink, ClipboardCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { useAdminTheme } from '../../../contexts/AdminThemeContext';
import type { AdminView, AdminMenuSection } from '../types';

// ─── Menu Item ───
const MenuItem: React.FC<{
  icon: React.ReactNode; label: string; active?: boolean; onClick: () => void;
  badge?: number; theme?: 'light' | 'dark'; collapsed?: boolean;
}> = ({ icon, label, active, onClick, badge, theme = 'light', collapsed = false }) => (
  <div className="relative group">
    <button onClick={onClick}
      className={`w-full flex items-center rounded-xl transition-all duration-200 ${
        collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'
      } ${
        active
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-200/50'
          : theme === 'dark'
          ? 'text-slate-300 hover:bg-slate-700/60'
          : 'text-gray-600 hover:bg-gray-50'
      }`}>
      <span className={`relative flex items-center justify-center ${active ? 'text-white' : theme === 'dark' ? 'text-slate-400 group-hover:text-blue-400' : 'text-gray-500 group-hover:text-blue-600'}`}>
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
    {/* Tooltip khi collapsed */}
    {collapsed && (
      <div className={`absolute left-full ml-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
        theme === 'dark' ? 'bg-slate-700 text-slate-100 shadow-xl' : 'bg-gray-900 text-white shadow-lg'
      }`} style={{ top: '50%', transform: 'translateY(-50%)' }}>
        {label}
        {badge !== undefined && badge > 0 && (
          <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">{badge}</span>
        )}
      </div>
    )}
  </div>
);

// ─── Section Header ───
const SectionHeader: React.FC<{ title: string; collapsed: boolean; theme: 'light' | 'dark' }> = ({ title, collapsed, theme }) => {
  if (collapsed) return <div className={`my-2 mx-2 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`} />;
  return (
    <div className="px-4 pt-5 pb-1.5">
      <p className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>{title}</p>
    </div>
  );
};

// ─── Build menu sections ───
export const buildAdminMenuSections = (pendingInquiries: number, pendingModeration?: number): AdminMenuSection[] => [
  {
    title: 'Tổng quan',
    items: [
      { id: 'overview', icon: <BarChart3 className="w-5 h-5" />, label: 'Dashboard' },
      { id: 'analytics', icon: <TrendingUp className="w-5 h-5" />, label: 'Phân tích' },
    ],
  },
  {
    title: 'Kiểm duyệt',
    items: [
      { id: 'moderation', icon: <ClipboardCheck className="w-5 h-5" />, label: 'Duyệt tin đăng', badge: pendingModeration },
      { id: 'kyc', icon: <Shield className="w-5 h-5" />, label: 'Duyệt KYC' },
    ],
  },
  {
    title: 'Quản lý',
    items: [
      { id: 'users', icon: <Users className="w-5 h-5" />, label: 'Quản lý User' },
      { id: 'properties', icon: <Building className="w-5 h-5" />, label: 'Bất động sản' },
      { id: 'agents', icon: <Briefcase className="w-5 h-5" />, label: 'Đại lý' },
      { id: 'agencies', icon: <Home className="w-5 h-5" />, label: 'Công ty' },
      { id: 'projects', icon: <Package className="w-5 h-5" />, label: 'Dự án' },
      { id: 'inquiries', icon: <MessageSquare className="w-5 h-5" />, label: 'Yêu cầu tư vấn', badge: pendingInquiries },
    ],
  },
  {
    title: 'Nội dung',
    items: [
      { id: 'news', icon: <FileText className="w-5 h-5" />, label: 'Tin tức' },
      { id: 'market-analysis', icon: <TrendingUp className="w-5 h-5" />, label: 'Phân tích thị trường' },
      { id: 'wiki', icon: <List className="w-5 h-5" />, label: 'Wiki BĐS' },
      { id: 'payments', icon: <DollarSign className="w-5 h-5" />, label: 'Thanh toán' },
    ],
  },
  {
    title: 'Hệ thống',
    items: [
      { id: 'notifications', icon: <Bell className="w-5 h-5" />, label: 'Thông báo' },
      { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Cài đặt' },
    ],
  },
];

// ─── Sidebar Content ───
const SidebarContent: React.FC<{
  collapsed: boolean;
  menuSections: AdminMenuSection[];
  currentView: AdminView;
  onMenuClick: (view: AdminView) => void;
  onLogout: () => void;
}> = ({ collapsed, menuSections, currentView, onMenuClick, onLogout }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useAdminTheme();

  return (
    <>
      <nav className={`flex-1 overflow-y-auto overflow-x-hidden ${collapsed ? 'py-2 px-2' : 'py-1 px-2'}`}>
        {menuSections.map((section) => (
          <div key={section.title}>
            <SectionHeader title={section.title} collapsed={collapsed} theme={theme} />
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <MenuItem key={item.id} icon={item.icon} label={item.label}
                  active={currentView === item.id} onClick={() => onMenuClick(item.id)}
                  badge={item.badge} theme={theme} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className={`border-t flex-shrink-0 ${theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-gray-100 bg-white'}`}>
        {/* Theme toggle */}
        {!collapsed && (
          <div className={`px-3 pt-3`}>
            <button onClick={toggleTheme}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${
                theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}>
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* User info */}
        {!collapsed && (
          <div className={`px-3 pt-3`}>
            <div className={`flex items-center gap-3 px-3 py-2 rounded-xl ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold truncate ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>
                  {user?.fullName || 'Admin'}
                </p>
                <p className={`text-xs truncate ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                  {user?.email || 'admin@eraestate.vn'}
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
              } ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <ExternalLink className="w-4 h-4" />
              {!collapsed && <span className="text-sm font-medium">Về trang chủ</span>}
            </button>
            {collapsed && (
              <div className={`absolute left-full ml-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity ${
                theme === 'dark' ? 'bg-slate-700 text-slate-100' : 'bg-gray-900 text-white'
              }`} style={{ top: '50%', transform: 'translateY(-50%)' }}>Về trang chủ</div>
            )}
          </div>
          <div className="relative group">
            <button onClick={onLogout}
              className={`w-full flex items-center rounded-xl transition-colors ${
                collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'
              } ${theme === 'dark' ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}`}>
              <LogOut className="w-4 h-4" />
              {!collapsed && <span className="text-sm font-medium">Đăng xuất</span>}
            </button>
            {collapsed && (
              <div className={`absolute left-full ml-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity ${
                theme === 'dark' ? 'bg-slate-700 text-slate-100' : 'bg-gray-900 text-white'
              }`} style={{ top: '50%', transform: 'translateY(-50%)' }}>Đăng xuất</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Main Sidebar ───
interface AdminSidebarProps {
  currentView: AdminView;
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  menuSections: AdminMenuSection[];
  onMenuClick: (view: AdminView) => void;
  onToggleSidebar: (open: boolean) => void;
  onCloseMobile: () => void;
  onOpenMobile: () => void;
  onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentView, sidebarOpen, mobileMenuOpen, menuSections,
  onMenuClick, onToggleSidebar, onCloseMobile, onOpenMobile, onLogout,
}) => {
  const { theme } = useAdminTheme();

  return (
    <>
      {/* Mobile hamburger */}
      <button onClick={onOpenMobile}
        className={`md:hidden fixed top-4 left-4 z-40 p-2 rounded-xl shadow-md border ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}>
        <Menu className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`} />
      </button>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCloseMobile} />
          <aside className={`relative w-72 h-full shadow-2xl flex flex-col ${
            theme === 'dark' ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className={`p-4 flex items-center justify-between border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-100'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className={`text-base font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>Admin Panel</span>
              </div>
              <button onClick={onCloseMobile} className={`p-1.5 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}>
                <X className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`} />
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
      } ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <div className={`flex items-center flex-shrink-0 border-b ${
          theme === 'dark' ? 'border-slate-700' : 'border-gray-100'
        } ${sidebarOpen ? 'p-4 justify-between' : 'p-3 justify-center'}`}>
          <div className={`flex items-center ${sidebarOpen ? 'gap-2.5' : 'justify-center w-full'}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            {sidebarOpen && <span className={`text-base font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>Admin</span>}
          </div>
          {sidebarOpen && (
            <button onClick={() => onToggleSidebar(false)} className={`p-1.5 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}>
              <X className={`w-4 h-4 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`} />
            </button>
          )}
        </div>
        {!sidebarOpen && (
          <div className={`p-2 border-b flex justify-center ${theme === 'dark' ? 'border-slate-700' : 'border-gray-100'}`}>
            <button onClick={() => onToggleSidebar(true)} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}>
              <Menu className={`w-4 h-4 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`} />
            </button>
          </div>
        )}
        <SidebarContent collapsed={!sidebarOpen} menuSections={menuSections}
          currentView={currentView} onMenuClick={onMenuClick} onLogout={onLogout} />
      </aside>
    </>
  );
};

export default AdminSidebar;
