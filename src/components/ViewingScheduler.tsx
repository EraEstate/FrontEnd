import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Loader2,
  CalendarCheck,
  AlertCircle,
  User,
  Send,
} from 'lucide-react';
import { propertyViewingAPI, type TimeSlot, type PropertyViewingData } from '../api/propertyViewing';
import { useAuthStore } from '../store/authStore';
import toast from '../utils/toast';

interface ViewingSchedulerProps {
  propertyId: string | number;
  ownerId: string;
  isOwner: boolean;
}

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const WEEKDAY_FULL = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

/** Parse YYYY-MM-DD as local date (avoids UTC midnight timezone shift) */
const parseLocalDate = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const ViewingScheduler: React.FC<ViewingSchedulerProps> = ({ propertyId, ownerId, isOwner }) => {
  const { isAuthenticated } = useAuthStore();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const now = new Date();
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day; // Start on Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingNote, setBookingNote] = useState('');
  const [booking, setBooking] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Owner view: upcoming viewings
  const [ownerViewings, setOwnerViewings] = useState<PropertyViewingData[]>([]);
  const [ownerViewingsLoading, setOwnerViewingsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Generate days of the current week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Navigate weeks
  const prevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
    setSelectedDate(null);
    setSlots([]);
  };

  const nextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
    setSelectedDate(null);
    setSlots([]);
  };

  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Load slots when a date is selected
  useEffect(() => {
    if (!selectedDate) return;
    let cancelled = false;
    setSlotsLoading(true);
    propertyViewingAPI
      .getAvailableSlots(String(propertyId), selectedDate)
      .then((data) => {
        if (!cancelled) setSlots(data);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedDate, propertyId]);

  // Owner: load upcoming viewings
  useEffect(() => {
    if (!isOwner) return;
    let cancelled = false;
    setOwnerViewingsLoading(true);
    propertyViewingAPI
      .getPropertyViewings(String(propertyId))
      .then((data) => {
        if (!cancelled) {
          // Only upcoming
          const upcoming = data.filter(
            (v) => v.status === 'PENDING' || v.status === 'CONFIRMED'
          );
          setOwnerViewings(upcoming);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setOwnerViewingsLoading(false);
      });
    return () => { cancelled = true; };
  }, [isOwner, propertyId]);

  // Handle booking
  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) return;
    setBooking(true);
    try {
      await propertyViewingAPI.createViewing({
        propertyId: String(propertyId),
        date: selectedDate,
        startTime: selectedSlot.startTime,
        note: bookingNote.trim(),
      });
      toast.success('Đặt lịch xem nhà thành công! Chủ nhà sẽ xác nhận sớm.');
      setShowBookingModal(false);
      setSelectedSlot(null);
      setBookingNote('');
      // Reload slots
      const updatedSlots = await propertyViewingAPI.getAvailableSlots(String(propertyId), selectedDate);
      setSlots(updatedSlots);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Không thể đặt lịch. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setBooking(false);
    }
  };

  // Owner actions
  const handleConfirm = async (viewingId: string) => {
    setActionLoading(viewingId);
    try {
      await propertyViewingAPI.confirmViewing(viewingId);
      toast.success('Đã xác nhận lịch xem nhà');
      setOwnerViewings((prev) =>
        prev.map((v) => (v.id === viewingId ? { ...v, status: 'CONFIRMED' as const } : v))
      );
    } catch {
      toast.error('Không thể xác nhận. Vui lòng thử lại.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (viewingId: string) => {
    setActionLoading(viewingId);
    try {
      await propertyViewingAPI.cancelViewing(viewingId);
      toast.success('Đã hủy lịch xem nhà');
      setOwnerViewings((prev) => prev.filter((v) => v.id !== viewingId));
    } catch {
      toast.error('Không thể hủy. Vui lòng thử lại.');
    } finally {
      setActionLoading(null);
    }
  };

  // ============ OWNER VIEW ============
  if (isOwner) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-emerald-100 rounded-xl">
            <CalendarCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Lịch xem nhà sắp tới</h3>
            <p className="text-xs text-gray-500">Khách hàng đã đặt lịch xem BĐS này</p>
          </div>
        </div>

        {ownerViewingsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : ownerViewings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Chưa có lịch xem nhà nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ownerViewings.map((viewing) => (
              <div
                key={viewing.id}
                className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900 text-sm truncate">
                        {viewing.viewer?.fullName || 'Khách hàng'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {parseLocalDate(viewing.viewingDate).toLocaleDateString('vi-VN')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {viewing.startTime?.substring(0, 5)} - {viewing.endTime?.substring(0, 5)}
                      </span>
                    </div>
                    {viewing.note && (
                      <p className="text-xs text-gray-500 mt-1.5 italic">"{viewing.note}"</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 ml-3">
                    {viewing.status === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => handleConfirm(viewing.id)}
                          disabled={actionLoading === viewing.id}
                          className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors disabled:opacity-50"
                          title="Xác nhận"
                        >
                          {actionLoading === viewing.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCancel(viewing.id)}
                          disabled={actionLoading === viewing.id}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                          title="Từ chối"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                        Đã xác nhận
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ============ VISITOR VIEW ============
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 rounded-xl">
            <CalendarCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Đặt lịch xem nhà</h3>
            <p className="text-xs text-gray-500">Chọn ngày và giờ phù hợp</p>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={prevWeek}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-gray-700">
            {weekDays[0].toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={nextWeek}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day buttons */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => {
            const dateStr = formatDate(day);
            const isToday = formatDate(day) === formatDate(new Date());
            const isPast = day < today;
            const isSelected = selectedDate === dateStr;

            return (
              <button suppressHydrationWarning
                key={dateStr}
                onClick={() => !isPast && setSelectedDate(dateStr)}
                disabled={isPast}
                className={`flex flex-col items-center py-2 px-1 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : isPast
                    ? 'text-gray-300 cursor-not-allowed'
                    : isToday
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-[10px] opacity-75">{WEEKDAYS[day.getDay()]}</span>
                <span className="text-sm font-bold mt-0.5">{day.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      <div className="p-5">
        {!selectedDate ? (
          <div className="text-center py-6 text-gray-500">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Chọn ngày để xem khung giờ trống</p>
          </div>
        ) : slotsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <span className="ml-2 text-sm text-gray-500">Đang tải…</span>
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-6">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-amber-400" />
            <p className="text-sm text-gray-600 font-medium">Không có khung giờ trống</p>
            <p className="text-xs text-gray-400 mt-1">
              Chủ nhà chưa mở lịch cho ngày{' '}
              {WEEKDAY_FULL[parseLocalDate(selectedDate).getDay()].toLowerCase()} này
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500 mb-3 font-medium">
              {slots.length} khung giờ trống ngày{' '}
              {parseLocalDate(selectedDate).toLocaleDateString('vi-VN', {
                weekday: 'long',
                day: 'numeric',
                month: 'numeric',
              })}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => (
                <button
                  key={`${slot.startTime}-${slot.endTime}`}
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.warning('Vui lòng đăng nhập để đặt lịch xem nhà');
                      return;
                    }
                    setSelectedSlot(slot);
                    setShowBookingModal(true);
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400 hover:scale-105 transition-all duration-200 text-sm font-semibold"
                >
                  <Clock className="w-3.5 h-3.5" />
                  {slot.startTime?.substring(0, 5)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Booking Confirmation Modal */}
      {showBookingModal && selectedSlot && selectedDate && (
        <div className="fixed inset-0 bg-gray-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <CalendarCheck className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Xác nhận đặt lịch</h3>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">
                    {parseLocalDate(selectedDate).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm mt-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 font-semibold">
                    {selectedSlot.startTime?.substring(0, 5)} - {selectedSlot.endTime?.substring(0, 5)}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="viewing-booking-note" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Ghi chú cho chủ nhà (tuỳ chọn)
                </label>
                <textarea
                  id="viewing-booking-note"

                  value={bookingNote}
                  onChange={(e) => setBookingNote(e.target.value)}
                  placeholder="VD: Tôi muốn xem tầng trệt và sân thượng..."
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-colors"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Huỷ
              </button>
              <button
                onClick={handleBook}
                disabled={booking}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {booking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {booking ? 'Đang đặt...' : 'Đặt lịch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewingScheduler;
