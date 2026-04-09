import React from 'react';
import {
  Users, Building, DollarSign, Eye, Heart, MessageSquare,
  Briefcase, TrendingUp, ChevronRight, Home, Clock, ClipboardCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAdminTheme } from '../../contexts/AdminThemeContext';
import { relativeTime } from '../../utils/relativeTime';
import AdminStatsCard from './components/AdminStatsCard';
import type { AdminView, AdminStats } from './types';

interface AdminOverviewProps {
  stats: AdminStats | null;
  statsLoading: boolean;
  recentActivities: any[];
  activitiesLoading: boolean;
  onNavigate: (view: AdminView) => void;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({
  stats, statsLoading, recentActivities, activitiesLoading, onNavigate,
}) => {
  const { user } = useAuthStore();
  const { theme } = useAdminTheme();
  const navigate = useNavigate();

  const formatCurrency = (v: number) => {
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
    return v.toLocaleString('vi-VN');
  };

  const formatTimeAgo = (ts: string) => {
    if (!ts) return '';
    try { return relativeTime(ts); } catch { return ''; }
  };

  const isDark = theme === 'dark';
  const cardBg = isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-100';
  const textPrimary = isDark ? 'text-slate-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${textPrimary}`}>
          Xin chào, {user?.fullName || 'Admin'}
        </h1>
        <p className={`text-sm mt-1 ${textSecondary}`}>
          Tổng quan hệ thống EraEstate
        </p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <AdminStatsCard icon={<Users className="w-5 h-5 text-blue-600" />} title="Tổng người dùng"
          value={statsLoading ? '...' : (stats?.totalUsers?.toLocaleString() ?? '0')}
          color={isDark ? 'bg-blue-900/40' : 'bg-blue-50'} theme={theme} />
        <AdminStatsCard icon={<Building className="w-5 h-5 text-emerald-600" />} title="Bất động sản"
          value={statsLoading ? '...' : (stats?.totalProperties?.toLocaleString() ?? '0')}
          color={isDark ? 'bg-emerald-900/40' : 'bg-emerald-50'} theme={theme} />
        <AdminStatsCard icon={<DollarSign className="w-5 h-5 text-amber-600" />} title="Doanh thu"
          value={statsLoading ? '...' : `${formatCurrency(stats?.totalRevenue ?? 0)} VNĐ`}
          color={isDark ? 'bg-amber-900/40' : 'bg-amber-50'} theme={theme} />
        <AdminStatsCard icon={<MessageSquare className="w-5 h-5 text-purple-600" />} title="Yêu cầu mới"
          value={statsLoading ? '...' : (stats?.newInquiries ?? 0)}
          color={isDark ? 'bg-purple-900/40' : 'bg-purple-50'} theme={theme} />
        <AdminStatsCard icon={<ClipboardCheck className="w-5 h-5 text-orange-600" />} title="Chờ duyệt"
          value={statsLoading ? '...' : (stats?.activeProperties !== undefined ? (stats.totalProperties - stats.activeProperties) : 0)}
          color={isDark ? 'bg-orange-900/40' : 'bg-orange-50'} theme={theme} />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminStatsCard icon={<Briefcase className="w-5 h-5 text-indigo-600" />} title="Đại lý"
          value={statsLoading ? '...' : (stats?.totalAgents ?? 0)}
          color={isDark ? 'bg-indigo-900/40' : 'bg-indigo-50'} theme={theme} />
        <AdminStatsCard icon={<Eye className="w-5 h-5 text-pink-600" />} title="Lượt xem"
          value={statsLoading ? '...' : (stats?.totalViews?.toLocaleString() ?? '0')}
          color={isDark ? 'bg-pink-900/40' : 'bg-pink-50'} theme={theme} />
        <AdminStatsCard icon={<Heart className="w-5 h-5 text-red-600" />} title="Yêu thích"
          value={statsLoading ? '...' : (stats?.totalFavorites?.toLocaleString() ?? '0')}
          color={isDark ? 'bg-red-900/40' : 'bg-red-50'} theme={theme} />
        <AdminStatsCard icon={<TrendingUp className="w-5 h-5 text-teal-600" />} title="Dự án"
          value={statsLoading ? '...' : (stats?.totalProjects ?? 0)}
          color={isDark ? 'bg-teal-900/40' : 'bg-teal-50'} theme={theme} />
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { view: 'moderation' as AdminView, icon: <ClipboardCheck className="w-5 h-5" />, label: 'Duyệt tin đăng', desc: 'Giám sát Staff', color: 'from-rose-500 to-rose-600' },
          { view: 'users' as AdminView, icon: <Users className="w-5 h-5" />, label: 'Quản lý User', desc: 'Full quyền', color: 'from-blue-500 to-blue-600' },
          { view: 'analytics' as AdminView, icon: <TrendingUp className="w-5 h-5" />, label: 'Phân tích', desc: 'Biểu đồ', color: 'from-purple-500 to-purple-600' },
          { view: 'payments' as AdminView, icon: <DollarSign className="w-5 h-5" />, label: 'Thanh toán', desc: 'Doanh thu', color: 'from-emerald-500 to-emerald-600' },
        ].map(item => (
          <button key={item.view} onClick={() => onNavigate(item.view)}
            className={`bg-gradient-to-br ${item.color} text-white rounded-2xl p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-left`}>
            <div className="p-2 bg-white/20 rounded-xl w-fit mb-3">{item.icon}</div>
            <p className="text-sm font-semibold">{item.label}</p>
            <p className="text-xs opacity-80 mt-0.5">{item.desc}</p>
          </button>
        ))}
      </div>

      {/* Highlight Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-6 h-6 opacity-80" />
            <span className="text-xs font-medium opacity-80">Tháng này</span>
          </div>
          <p className="text-xs opacity-80 mb-1">Doanh thu</p>
          <p className="text-2xl font-bold">{statsLoading ? '...' : `${formatCurrency(stats?.revenueThisMonth ?? 0)} VNĐ`}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <Eye className="w-6 h-6 opacity-80" />
            <span className="text-xs font-medium opacity-80">Tuần này</span>
          </div>
          <p className="text-xs opacity-80 mb-1">Lượt xem</p>
          <p className="text-2xl font-bold">{statsLoading ? '...' : (stats?.viewsThisWeek?.toLocaleString() ?? '0')}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-6 h-6 opacity-80" />
            <span className="text-xs font-medium opacity-80">Hôm nay</span>
          </div>
          <p className="text-xs opacity-80 mb-1">User mới</p>
          <p className="text-2xl font-bold">{statsLoading ? '...' : (stats?.newUsersToday ?? 0)}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`rounded-2xl shadow-sm overflow-hidden ${cardBg}`}>
        <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
          <h3 className={`text-base font-semibold ${textPrimary}`}>Hoạt động gần đây</h3>
        </div>

        {activitiesLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className={`w-10 h-10 rounded-full flex-shrink-0 ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`} />
                <div className="flex-1 space-y-2">
                  <div className={`h-4 rounded w-3/4 ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`} />
                  <div className={`h-3 rounded w-1/2 ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`} />
                </div>
              </div>
            ))}
          </div>
        ) : recentActivities.length === 0 ? (
          <div className={`p-8 text-center ${textSecondary}`}>
            <p className="text-sm">Chưa có hoạt động gần đây</p>
          </div>
        ) : (
          <div className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-gray-50'}`}>
            {recentActivities.map((activity) => (
              <div key={activity.id} className={`p-4 transition-colors flex items-center gap-4 ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {(activity.title || 'U').substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${textPrimary}`}>
                    {activity.description || activity.title}
                  </p>
                  <p className={`text-xs mt-0.5 ${textSecondary}`}>
                    {activity.timestamp ? formatTimeAgo(activity.timestamp) : ''}
                  </p>
                </div>
                {activity.propertyId && (
                  <button onClick={() => navigate(`/properties/${activity.propertyId}`)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      isDark ? 'text-blue-400 hover:bg-slate-700' : 'text-blue-600 hover:bg-blue-50'
                    }`}>
                    Xem <ChevronRight className="w-3 h-3 inline" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOverview;
