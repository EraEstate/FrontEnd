import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Eye, Heart, MessageSquare, PenSquare, RefreshCw,
  Loader2, Filter, Calendar, ChevronDown,
} from 'lucide-react';
import { activityAPI, type ActivityResponse } from '../api/activity';
import { showError } from '../utils/toast';
import { useTranslation } from 'react-i18next';

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; bg: string; text: string; label: string }> = {
  PROPERTY_VIEWED: {
    icon: <Eye className="w-4 h-4" />,
    bg: 'bg-blue-50', text: 'text-blue-600', label: 'Đã xem',
  },
  PROPERTY_FAVORITED: {
    icon: <Heart className="w-4 h-4" />,
    bg: 'bg-pink-50', text: 'text-pink-600', label: 'Yêu thích',
  },
  PROPERTY_INQUIRY: {
    icon: <MessageSquare className="w-4 h-4" />,
    bg: 'bg-amber-50', text: 'text-amber-600', label: 'Yêu cầu',
  },
  PROPERTY_POSTED: {
    icon: <PenSquare className="w-4 h-4" />,
    bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Đăng tin',
  },
  PROPERTY_UPDATED: {
    icon: <RefreshCw className="w-4 h-4" />,
    bg: 'bg-violet-50', text: 'text-violet-600', label: 'Cập nhật',
  },
};

const FILTER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'VIEWED', label: 'Đã xem' },
  { value: 'FAVORITED', label: 'Yêu thích' },
  { value: 'INQUIRY', label: 'Yêu cầu' },
  { value: 'POSTED', label: 'Đăng tin' },
];

const ActivityLogPage: React.FC = () => {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<ActivityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterType, setFilterType] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, [page, filterType]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await activityAPI.getUserActivities(page, 20, filterType || undefined);
      setActivities(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      showError('Không thể tải lịch sử hoạt động');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay < 7) return `${diffDay} ngày trước`;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Nhóm theo ngày
  const groupedActivities = activities.reduce<Record<string, ActivityResponse[]>>((acc, act) => {
    const dateKey = new Date(act.timestamp).toLocaleDateString('vi-VN', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(act);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Back link */}
        <Link
          to="/profile"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại hồ sơ
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Lịch sử hoạt động</h1>
            <p className="text-sm text-gray-500 mt-1">Theo dõi các hoạt động của bạn trên hệ thống</p>
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              showFilter || filterType
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Lọc
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter pills */}
        {showFilter && (
          <div className="flex flex-wrap gap-2 mb-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setFilterType(opt.value); setPage(0); }}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterType === opt.value
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && activities.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          </div>
        )}

        {/* Empty state */}
        {!loading && activities.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Chưa có hoạt động nào</h3>
            <p className="text-sm text-gray-500">Bắt đầu khám phá bất động sản để tạo lịch sử hoạt động</p>
            <Link
              to="/properties"
              className="inline-flex items-center mt-6 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Khám phá ngay
            </Link>
          </div>
        )}

        {/* Timeline */}
        {Object.entries(groupedActivities).map(([dateLabel, acts]) => (
          <div key={dateLabel} className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              {dateLabel}
            </h3>
            <div className="space-y-2">
              {acts.map((act) => {
                const cfg = TYPE_CONFIG[act.type] || TYPE_CONFIG.PROPERTY_VIEWED;
                return (
                  <div
                    key={act.id}
                    className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
                  >
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center ${cfg.text}`}>
                      {cfg.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{act.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{act.description}</p>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">
                          {formatTime(act.timestamp)}
                        </span>
                      </div>

                      {/* Property link */}
                      {act.property && (
                        <Link
                          to={`/properties/${act.propertyId}`}
                          className="mt-2 flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 group-hover:bg-gray-100/80 transition-colors"
                        >
                          {act.property.mainImageUrl && (
                            <img
                              src={act.property.mainImageUrl}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{act.property.title}</p>
                            {act.property.address && (
                              <p className="text-xs text-gray-500 truncate">{act.property.address}</p>
                            )}
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 disabled:opacity-40 hover:bg-white transition-colors"
            >
              ← Trước
            </button>
            <span className="text-sm text-gray-500">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 disabled:opacity-40 hover:bg-white transition-colors"
            >
              Sau →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogPage;
