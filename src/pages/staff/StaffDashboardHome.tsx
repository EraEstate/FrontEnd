import React from 'react';
import {
  Home, Clock, CheckCircle, XCircle, AlertTriangle,
  ChevronRight, Users, Shield, Newspaper, MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
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

  const formatPrice = (price: number) => {
    if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)} tỷ`;
    if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)} triệu`;
    return price.toLocaleString('vi-VN');
  };

  return (
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
          <button onClick={() => onNavigate('property-moderation')}
            className="ml-8 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium">
            Duyệt ngay <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { view: 'user-management' as StaffView, icon: <Users className="w-5 h-5" />, label: 'Quản lý User', color: 'from-blue-500 to-blue-600' },
          { view: 'kyc-management' as StaffView, icon: <Shield className="w-5 h-5" />, label: 'Duyệt KYC', color: 'from-purple-500 to-purple-600' },
          { view: 'news-management' as StaffView, icon: <Newspaper className="w-5 h-5" />, label: 'Quản lý Tin tức', color: 'from-emerald-500 to-emerald-600' },
          { view: 'inquiry-management' as StaffView, icon: <MessageSquare className="w-5 h-5" />, label: 'Yêu cầu tư vấn', color: 'from-orange-500 to-orange-600' },
        ].map(item => (
          <button key={item.view} onClick={() => onNavigate(item.view)}
            className={`bg-gradient-to-br ${item.color} text-white rounded-2xl p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-left`}>
            <div className="p-2 bg-white/20 rounded-xl w-fit mb-3">{item.icon}</div>
            <p className="text-sm font-semibold">{item.label}</p>
          </button>
        ))}
      </div>

      {/* Recent Pending */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Tin chờ duyệt gần đây</h3>
          <button onClick={() => onNavigate('property-moderation')}
            className="text-red-600 hover:text-red-700 text-sm font-medium inline-flex items-center gap-1">
            Xem tất cả <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {statsLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map(i => (
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
                <button onClick={() => onNavigate('property-moderation')}
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
};

export default StaffDashboardHome;
