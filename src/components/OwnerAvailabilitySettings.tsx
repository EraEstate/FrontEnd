import React, { useState, useEffect } from 'react';
import {
  Clock,
  Save,
  Loader2,
  CalendarCog,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { propertyViewingAPI, type OwnerAvailabilitySlot } from '../api/propertyViewing';
import toast from '../utils/toast';

const DAYS = [
  { key: 'MONDAY', label: 'Thứ hai' },
  { key: 'TUESDAY', label: 'Thứ ba' },
  { key: 'WEDNESDAY', label: 'Thứ tư' },
  { key: 'THURSDAY', label: 'Thứ năm' },
  { key: 'FRIDAY', label: 'Thứ sáu' },
  { key: 'SATURDAY', label: 'Thứ bảy' },
  { key: 'SUNDAY', label: 'Chủ nhật' },
];

const DEFAULT_START = '09:00';
const DEFAULT_END = '17:00';

const OwnerAvailabilitySettings: React.FC = () => {
  const [slots, setSlots] = useState<OwnerAvailabilitySlot[]>(
    DAYS.map((d) => ({
      dayOfWeek: d.key,
      startTime: DEFAULT_START,
      endTime: DEFAULT_END,
      isActive: false,
    }))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    propertyViewingAPI
      .getOwnerAvailability()
      .then((data) => {
        if (cancelled) return;
        if (data.length > 0) {
          // Merge fetched data into default slots
          const merged = DAYS.map((d) => {
            const found = data.find((s) => s.dayOfWeek === d.key);
            if (found) {
              return {
                ...found,
                startTime: found.startTime?.substring(0, 5) || DEFAULT_START,
                endTime: found.endTime?.substring(0, 5) || DEFAULT_END,
              };
            }
            return {
              dayOfWeek: d.key,
              startTime: DEFAULT_START,
              endTime: DEFAULT_END,
              isActive: false,
            };
          });
          setSlots(merged);
        }
      })
      .catch(() => {
        // Keep defaults
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const toggleDay = (dayOfWeek: string) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.dayOfWeek === dayOfWeek ? { ...s, isActive: !s.isActive } : s
      )
    );
  };

  const updateTime = (dayOfWeek: string, field: 'startTime' | 'endTime', value: string) => {
    setSlots((prev) =>
      prev.map((s) => (s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s))
    );
  };

  const handleSave = async () => {
    // Only save active slots
    const activeSlots = slots.filter((s) => s.isActive);

    // Validate time ranges
    for (const slot of activeSlots) {
      if (slot.startTime >= slot.endTime) {
        const dayLabel = DAYS.find((d) => d.key === slot.dayOfWeek)?.label;
        toast.error(`Giờ bắt đầu phải trước giờ kết thúc (${dayLabel})`);
        return;
      }
    }

    setSaving(true);
    try {
      await propertyViewingAPI.updateOwnerAvailability(activeSlots);
      toast.success('Đã lưu lịch trình xem nhà');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể lưu. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-100 rounded-xl">
            <CalendarCog className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Lịch trình xem nhà</h3>
            <p className="text-xs text-gray-500">
              Thiết lập khung giờ khách hàng có thể đặt lịch xem nhà của bạn
            </p>
          </div>
        </div>
      </div>

      {/* Day Slots */}
      <div className="divide-y divide-gray-100">
        {slots.map((slot) => {
          const dayInfo = DAYS.find((d) => d.key === slot.dayOfWeek);
          return (
            <div
              key={slot.dayOfWeek}
              className={`px-5 py-3.5 flex items-center gap-4 transition-colors ${
                slot.isActive ? 'bg-white' : 'bg-gray-50/50'
              }`}
            >
              {/* Toggle */}
              <button
                onClick={() => toggleDay(slot.dayOfWeek)}
                className="flex-shrink-0"
                title={slot.isActive ? 'Tắt' : 'Bật'}
              >
                {slot.isActive ? (
                  <ToggleRight className="w-8 h-8 text-emerald-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-300" />
                )}
              </button>

              {/* Day label */}
              <span
                className={`w-20 text-sm font-medium ${
                  slot.isActive ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {dayInfo?.label}
              </span>

              {/* Time pickers */}
              {slot.isActive ? (
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative">
                    <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateTime(slot.dayOfWeek, 'startTime', e.target.value)}
                      className="pl-8 pr-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <span className="text-gray-400 text-xs">đến</span>
                  <div className="relative">
                    <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateTime(slot.dayOfWeek, 'endTime', e.target.value)}
                      className="pl-8 pr-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              ) : (
                <span className="text-xs text-gray-400 italic">Không nhận lịch</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="p-5 border-t border-gray-100 bg-gray-50/30">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Đang lưu...' : 'Lưu lịch trình'}
        </button>
      </div>
    </div>
  );
};

export default OwnerAvailabilitySettings;
