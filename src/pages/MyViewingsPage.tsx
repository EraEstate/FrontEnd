import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Check,
  X,
  Loader2,
  CalendarCheck,
  CalendarX,
  CalendarClock,
  User,
  Home,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { propertyViewingAPI, type PropertyViewingData } from '../api/propertyViewing';
import { useAuthStore } from '../store/authStore';
import toast from '../utils/toast';

type TabKey = 'upcoming' | 'past' | 'cancelled';

/** Parse YYYY-MM-DD as local date (avoids UTC midnight timezone shift) */
const parseLocalDate = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const MyViewingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [viewings, setViewings] = useState<PropertyViewingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    propertyViewingAPI
      .getMyViewings()
      .then((data) => {
        if (!cancelled) setViewings(data);
      })
      .catch(() => {
        toast.error('Không thể tải lịch xem nhà');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const filtered = viewings.filter((v) => {
    if (activeTab === 'cancelled') return v.status === 'CANCELLED';
    if (activeTab === 'past') {
      return (
        v.status !== 'CANCELLED' &&
        (v.viewingDate < today || v.status === 'COMPLETED')
      );
    }
    // upcoming
    return (
      v.viewingDate >= today &&
      (v.status === 'PENDING' || v.status === 'CONFIRMED')
    );
  });

  const handleConfirm = async (id: string) => {
    setActionLoading(id);
    try {
      await propertyViewingAPI.confirmViewing(id);
      toast.success('Đã xác nhận lịch xem nhà');
      setViewings((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: 'CONFIRMED' } : v))
      );
    } catch {
      toast.error('Không thể xác nhận');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id: string) => {
    setActionLoading(id);
    try {
      await propertyViewingAPI.cancelViewing(id);
      toast.success('Đã hủy lịch xem nhà');
      setViewings((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: 'CANCELLED' } : v))
      );
    } catch {
      toast.error('Không thể hủy');
    } finally {
      setActionLoading(null);
    }
  };

  const tabs: { key: TabKey; label: string; icon: React.FC<{ className?: string }>; count: number }[] = [
    {
      key: 'upcoming',
      label: 'Sắp tới',
      icon: CalendarClock,
      count: viewings.filter((v) => v.viewingDate >= today && (v.status === 'PENDING' || v.status === 'CONFIRMED')).length,
    },
    {
      key: 'past',
      label: 'Đã qua',
      icon: CalendarCheck,
      count: viewings.filter((v) => v.status !== 'CANCELLED' && (v.viewingDate < today || v.status === 'COMPLETED')).length,
    },
    {
      key: 'cancelled',
      label: 'Đã hủy',
      icon: CalendarX,
      count: viewings.filter((v) => v.status === 'CANCELLED').length,
    },
  ];

  const getStatusBadge = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      PENDING: { color: 'bg-amber-100 text-amber-700 border-amber-200', text: 'Chờ xác nhận' },
      CONFIRMED: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', text: 'Đã xác nhận' },
      CANCELLED: { color: 'bg-red-100 text-red-700 border-red-200', text: 'Đã hủy' },
      COMPLETED: { color: 'bg-gray-100 text-gray-700 border-gray-200', text: 'Hoàn tất' },
    };
    return map[status] || map.PENDING;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-100 rounded-xl">
            <CalendarCheck className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Lịch xem nhà</h1>
            <p className="text-sm text-gray-500">Quản lý tất cả lịch hẹn xem nhà của bạn</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className="opacity-75">({tab.count})</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab === 'upcoming'
                ? 'Không có lịch sắp tới'
                : activeTab === 'past'
                ? 'Chưa có lịch nào đã qua'
                : 'Không có lịch đã hủy'}
            </h3>
            <p className="text-sm text-gray-500">
              {activeTab === 'upcoming' && 'Tìm bất động sản và đặt lịch xem nhà ngay!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((viewing) => {
              const badge = getStatusBadge(viewing.status);
              const isOwner = String(viewing.ownerId) === String(user?.id);
              const otherParty = isOwner ? viewing.viewer : viewing.owner;

              return (
                <div
                  key={viewing.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Property info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.color}`}
                        >
                          {badge.text}
                        </span>
                        <span className="text-xs text-gray-400">
                          {isOwner ? 'Khách đến xem nhà của bạn' : 'Bạn đặt xem nhà'}
                        </span>
                      </div>

                      {viewing.property && (
                        <Link
                          to={`/properties/${viewing.property.id}`}
                          className="group flex items-center gap-2 mb-3"
                        >
                          <Home className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                            {viewing.property.title}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                        </Link>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          {parseLocalDate(viewing.viewingDate).toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                          })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-blue-500" />
                          {viewing.startTime?.substring(0, 5)} - {viewing.endTime?.substring(0, 5)}
                        </span>
                        {otherParty && (
                          <span className="flex items-center gap-1.5">
                            <User className="w-4 h-4 text-gray-400" />
                            {otherParty.fullName}
                          </span>
                        )}
                      </div>

                      {viewing.note && (
                        <p className="text-xs text-gray-500 mt-2 italic">
                          Ghi chú: "{viewing.note}"
                        </p>
                      )}
                      {viewing.cancellationReason && (
                        <p className="text-xs text-red-500 mt-2">
                          Lý do hủy: {viewing.cancellationReason}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    {activeTab === 'upcoming' && (
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {viewing.status === 'PENDING' && isOwner && (
                          <button
                            onClick={() => handleConfirm(viewing.id)}
                            disabled={actionLoading === viewing.id}
                            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                          >
                            {actionLoading === viewing.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            Xác nhận
                          </button>
                        )}
                        <button
                          onClick={() => handleCancel(viewing.id)}
                          disabled={actionLoading === viewing.id}
                          className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          Hủy lịch
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyViewingsPage;
