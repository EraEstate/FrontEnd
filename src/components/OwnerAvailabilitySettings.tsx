import React, { useEffect, useState } from 'react';
import {
  Clock,
  Save,
  Loader2,
  CalendarClock,
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
] as const;

const DAY_LABEL_MAP = new Map<string, string>(DAYS.map((day) => [day.key, day.label]));
const DEFAULT_START = '09:00';
const DEFAULT_END = '17:00';

const buildDefaultSlots = (): OwnerAvailabilitySlot[] =>
  DAYS.map((day) => ({
    dayOfWeek: day.key,
    startTime: DEFAULT_START,
    endTime: DEFAULT_END,
    isActive: false,
  }));

const OwnerAvailabilitySettings: React.FC = () => {
  const [slots, setSlots] = useState<OwnerAvailabilitySlot[]>(() => buildDefaultSlots());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    propertyViewingAPI
      .getOwnerAvailability()
      .then((data) => {
        if (cancelled || data.length === 0) return;

        const fetchedMap = new Map(data.map((slot) => [slot.dayOfWeek, slot]));
        const merged = DAYS.map((day) => {
          const found = fetchedMap.get(day.key);
          if (!found) {
            return {
              dayOfWeek: day.key,
              startTime: DEFAULT_START,
              endTime: DEFAULT_END,
              isActive: false,
            };
          }
          return {
            ...found,
            startTime: found.startTime?.substring(0, 5) || DEFAULT_START,
            endTime: found.endTime?.substring(0, 5) || DEFAULT_END,
          };
        });

        setSlots(merged);
      })
      .catch(() => {
        // Keep defaults when API fails
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleDay = (dayOfWeek: string) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.dayOfWeek === dayOfWeek ? { ...slot, isActive: !slot.isActive } : slot
      )
    );
  };

  const updateTime = (dayOfWeek: string, field: 'startTime' | 'endTime', value: string) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.dayOfWeek === dayOfWeek ? { ...slot, [field]: value } : slot
      )
    );
  };

  const handleSave = async () => {
    const activeSlots = slots.filter((slot) => slot.isActive);

    for (const slot of activeSlots) {
      if (slot.startTime >= slot.endTime) {
        const dayLabel = DAY_LABEL_MAP.get(slot.dayOfWeek) ?? slot.dayOfWeek;
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
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-purple-100 p-2.5">
            <CalendarClock className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Lịch trình xem nhà</h3>
            <p className="text-xs text-gray-500">
              Thiết lập khung giờ khách hàng có thể đặt lịch xem nhà của bạn
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {slots.map((slot) => {
          const dayLabel = DAY_LABEL_MAP.get(slot.dayOfWeek) ?? slot.dayOfWeek;
          return (
            <div
              key={slot.dayOfWeek}
              className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
                slot.isActive ? 'bg-white' : 'bg-gray-50/50'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleDay(slot.dayOfWeek)}
                className="flex-shrink-0"
                title={slot.isActive ? 'Tắt' : 'Bật'}
              >
                {slot.isActive ? (
                  <ToggleRight className="h-8 w-8 text-emerald-600" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-gray-300" />
                )}
              </button>

              <span
                className={`w-20 text-sm font-medium ${
                  slot.isActive ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {dayLabel}
              </span>

              {slot.isActive ? (
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative">
                    <Clock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(event) =>
                        updateTime(slot.dayOfWeek, 'startTime', event.target.value)
                      }
                      className="rounded-lg border border-gray-300 py-1.5 pl-8 pr-2 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <span className="text-xs text-gray-400">đến</span>

                  <div className="relative">
                    <Clock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(event) => updateTime(slot.dayOfWeek, 'endTime', event.target.value)}
                      className="rounded-lg border border-gray-300 py-1.5 pl-8 pr-2 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              ) : (
                <span className="text-xs italic text-gray-400">Không nhận lịch</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-100 bg-gray-50/30 p-5">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Đang lưu...' : 'Lưu lịch trình'}
        </button>
      </div>
    </div>
  );
};

export default OwnerAvailabilitySettings;
