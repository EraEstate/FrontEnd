import React from 'react';
import {
  Home, Clock, CheckCircle, XCircle, AlertTriangle,
  ChevronRight, Users, Shield, Newspaper, MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAdminTheme } from '../../contexts/AdminThemeContext';
import { relativeTime } from '../../utils/relativeTime';
import StaffStatsCard from './components/StaffStatsCard';
import type { StaffView, StaffStats } from './types';

// ─── Dashboard Home / Overview ───
interface StaffDashboardHomeProps {
  stats: StaffStats | null;
  statsLoading: boolean;
  onNavigate: (view: StaffView) => void;
}

const StaffDashboardHome: React.FC<StaffDashboardHomeProps> = ({ stats, statsLoading, onNavigate }) => {
  const { user } = useAuthStore();
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  const formatPrice = (price: number) => {
    if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)} tỷ`;
    if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)} triệu`;
    return price.toLocaleString('vi-VN');
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header and Welcome */}
      <div className="flex flex-col gap-1.5">
        <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-950'}`}>
          Xin chào, <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">{user?.fullName || 'Staff'}</span>
        </h1>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          Bảng điều khiển kiểm duyệt viên hệ thống
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StaffStatsCard 
          icon={<Clock className="w-5 h-5" />} 
          title="Chờ duyệt" 
          value={stats?.pendingCount ?? 0}
          color="text-amber-600" 
          bgColor="" 
          loading={statsLoading} 
        />
        <StaffStatsCard 
          icon={<CheckCircle className="w-5 h-5" />} 
          title="Đang hiển thị" 
          value={stats?.activeCount ?? 0}
          color="text-emerald-600" 
          bgColor="" 
          loading={statsLoading} 
        />
        <StaffStatsCard 
          icon={<XCircle className="w-5 h-5" />} 
          title="Đã từ chối" 
          value={stats?.rejectedCount ?? 0}
          color="text-red-600" 
          bgColor="" 
          loading={statsLoading} 
        />
        <StaffStatsCard 
          icon={<Home className="w-5 h-5" />} 
          title="Tổng tin đăng" 
          value={stats?.totalCount ?? 0}
          color="text-blue-600" 
          bgColor="" 
          loading={statsLoading} 
        />
      </div>

      {/* Urgent Call-To-Action Alert Notice */}
      {stats?.pendingCount != null && stats.pendingCount > 0 && (
        <div className={`relative overflow-hidden border rounded-3xl p-6 transition-all duration-300 ${
          isDark 
            ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20 shadow-lg shadow-amber-950/10' 
            : 'bg-gradient-to-br from-amber-50/80 to-orange-50/30 border-amber-100 shadow-sm shadow-amber-100/30'
        }`}>
          {/* Decorative glowing gradient blur */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl ${isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                <AlertTriangle className="w-6 h-6 stroke-[2px]" />
              </div>
              <div className="space-y-1">
                <h4 className={`text-lg font-bold leading-tight ${isDark ? 'text-amber-400' : 'text-amber-900'}`}>
                  Có {stats.pendingCount} tin đăng mới đang chờ kiểm duyệt
                </h4>
                <p className={`text-sm ${isDark ? 'text-amber-300/70' : 'text-amber-700/80'}`}>
                  Hãy nhanh chóng kiểm tra và phê duyệt các tin đăng từ người dùng để duy trì luồng hoạt động ổn định.
                </p>
              </div>
            </div>
            
            <button onClick={() => onNavigate('property-moderation')}
              className={`flex-shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl transition-all duration-300 text-sm font-bold shadow-md hover:shadow-lg ${
                isDark 
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 hover:scale-[1.02]' 
                  : 'bg-amber-600 text-white hover:bg-amber-700 hover:scale-[1.02]'
              }`}>
              Duyệt ngay <ChevronRight className="w-4 h-4 stroke-[2.5px]" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Access Menu Grid (Modernized Cards) */}
      <div className="space-y-4">
        <h3 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-950'}`}>Truy cập nhanh</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { view: 'user-management' as StaffView, icon: <Users className="w-5 h-5 text-blue-500" />, label: 'Quản lý User', desc: 'Phân quyền & quản lý', glow: 'hover:border-blue-500/30 hover:shadow-blue-500/5' },
            { view: 'kyc-management' as StaffView, icon: <Shield className="w-5 h-5 text-purple-500" />, label: 'Duyệt KYC', desc: 'Xác thực định danh', glow: 'hover:border-purple-500/30 hover:shadow-purple-500/5' },
            { view: 'news-management' as StaffView, icon: <Newspaper className="w-5 h-5 text-emerald-500" />, label: 'Quản lý Tin tức', desc: 'Xuất bản & chỉnh sửa', glow: 'hover:border-emerald-500/30 hover:shadow-emerald-500/5' },
            { view: 'inquiry-management' as StaffView, icon: <MessageSquare className="w-5 h-5 text-orange-500" />, label: 'Yêu cầu tư vấn', desc: 'Liên hệ và hỗ trợ', glow: 'hover:border-orange-500/30 hover:shadow-orange-500/5' },
          ].map(item => (
            <button key={item.view} onClick={() => onNavigate(item.view)}
              className={`group relative flex flex-col text-left p-5 rounded-3xl border transition-all duration-300 ${
                isDark 
                  ? 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600/80 shadow-lg shadow-slate-950/10' 
                  : 'bg-white border-gray-100/80 hover:bg-gray-50 hover:shadow-xl shadow-sm shadow-gray-100/30'
              } hover:-translate-y-1 ${item.glow}`}>
              <div className={`p-3 rounded-2xl w-fit mb-4 transition-all duration-300 group-hover:scale-110 ${
                isDark ? 'bg-slate-800 border border-slate-700' : 'bg-gray-50 border border-gray-100/50'
              }`}>
                {item.icon}
              </div>
              <p className={`text-base font-bold mb-1 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{item.label}</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Pending Table/List */}
      <div className={`rounded-3xl border overflow-hidden transition-all duration-300 ${
        isDark 
          ? 'bg-slate-800/80 border-slate-700/80 shadow-xl shadow-slate-950/20 backdrop-blur-md' 
          : 'bg-white border-gray-100 shadow-sm shadow-gray-100/30'
      }`}>
        <div className={`flex items-center justify-between px-6 py-5 border-b ${
          isDark ? 'border-slate-700/80' : 'border-gray-100'
        }`}>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-950'}`}>Tin chờ duyệt gần đây</h3>
          <button onClick={() => onNavigate('property-moderation')}
            className={`text-sm font-bold inline-flex items-center gap-1 transition-colors ${
              isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'
            }`}>
            Xem tất cả <ChevronRight className="w-4 h-4 stroke-[2.5px]" />
          </button>
        </div>

        {statsLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(slot => (
              <div key={`staff-dash-pulse-${slot}`} className="flex gap-4 animate-pulse">
                <div className={`w-16 h-16 rounded-2xl flex-shrink-0 ${isDark ? 'bg-slate-750' : 'bg-gray-200'}`} />
                <div className="flex-1 space-y-2 py-1">
                  <div className={`h-4 rounded w-3/4 ${isDark ? 'bg-slate-750' : 'bg-gray-200'}`} />
                  <div className={`h-3 rounded w-1/4 ${isDark ? 'bg-slate-750' : 'bg-gray-200'}`} />
                </div>
              </div>
            ))}
          </div>
        ) : stats?.recentPending && stats.recentPending.length > 0 ? (
          <div className={`divide-y ${isDark ? 'divide-slate-700/80' : 'divide-gray-50'}`}>
            {stats.recentPending.map((p: any) => (
              <div key={p.id} className={`p-4 sm:p-5 transition-colors flex items-center gap-4 ${isDark ? 'hover:bg-slate-750/30' : 'hover:bg-gray-50/55'}`}>
                <div className={`w-16 h-16 rounded-2xl flex-shrink-0 overflow-hidden border ${isDark ? 'bg-slate-800 border-slate-700/80' : 'bg-gray-150 border-gray-100'}`}>
                  {p.mainImageUrl ? <img src={p.mainImageUrl} alt="" className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" loading="lazy" /> :
                    <div className="w-full h-full flex items-center justify-center"><Home className={`w-6 h-6 ${isDark ? 'text-slate-500' : 'text-gray-300'}`} /></div>}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm sm:text-base font-semibold truncate ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>{p.title}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                    <span className={`text-sm font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>{formatPrice(p.price)}</span>
                    <span className={`w-1 h-1 rounded-full ${isDark ? 'bg-slate-600' : 'bg-gray-300'}`} />
                    {p.area && <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{p.area} m²</span>}
                    {p.area && <span className={`w-1 h-1 rounded-full ${isDark ? 'bg-slate-600' : 'bg-gray-300'}`} />}
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{relativeTime(p.createdAt)}</span>
                  </div>
                </div>
                
                <button onClick={() => onNavigate('property-moderation')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-300 ${
                    isDark 
                      ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20' 
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/50'
                  }`}>Duyệt</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className={`p-4 rounded-3xl mb-4 ${isDark ? 'bg-emerald-500/10 text-emerald-400/80' : 'bg-emerald-50 text-emerald-600/80'}`}>
              <CheckCircle className="w-10 h-10" />
            </div>
            <h4 className={`text-base font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>Hệ thống sạch tin</h4>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Không có tin đăng nào đang đợi kiểm duyệt lúc này.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboardHome;
