import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Loader2, Plus, Trash2 } from 'lucide-react';
import { calendarAPI, type CalendarEventPayload } from '../api/calendar';
import type { CalendarEvent } from '../api/types';
import { showError, showSuccess } from '../utils/toast';

const toIsoDateTime = (value: string): string => new Date(value).toISOString();

const startOfMonthLocal = () => {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  return date.toISOString().slice(0, 16);
};

const endOfMonthLocal = () => {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 0);
  return date.toISOString().slice(0, 16);
};

const CalendarPage: React.FC = () => {
  const [from, setFrom] = useState(startOfMonthLocal);
  const [to, setTo] = useState(endOfMonthLocal);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [form, setForm] = useState<CalendarEventPayload>({
    title: '',
    description: '',
    eventType: 'MEETING',
    startTime: '',
    endTime: '',
    location: '',
  });

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await calendarAPI.getEvents({
        from: toIsoDateTime(from),
        to: toIsoDateTime(to),
      });
      setEvents(data);
    } catch {
      showError('Không thể tải lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, []);

  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ),
    [events]
  );

  const submitEvent = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.title || !form.startTime || !form.endTime) {
      showError('Vui lòng nhập đủ tiêu đề và thời gian');
      return;
    }
    setSubmitting(true);
    try {
      await calendarAPI.createEvent({
        ...form,
        startTime: toIsoDateTime(form.startTime),
        endTime: toIsoDateTime(form.endTime),
      });
      showSuccess('Đã tạo sự kiện');
      setForm({
        title: '',
        description: '',
        eventType: 'MEETING',
        startTime: '',
        endTime: '',
        location: '',
      });
      await loadEvents();
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Không thể tạo sự kiện');
    } finally {
      setSubmitting(false);
    }
  };

  const removeEvent = async (eventId: string) => {
    try {
      await calendarAPI.deleteEvent(eventId);
      setEvents((prev) => prev.filter((item) => item.id !== eventId));
      showSuccess('Đã xoá sự kiện');
    } catch {
      showError('Không thể xoá sự kiện');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <CalendarDays className="h-6 w-6 text-red-600" />
            Lịch hẹn
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Quản lý lịch xem nhà, meeting và lịch kiểm tra tập trung.
          </p>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <form className="grid gap-4 md:grid-cols-4" onSubmit={(event) => event.preventDefault()}>
            <label className="text-sm text-gray-700">
              Từ ngày
              <input
                type="datetime-local"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-gray-700">
              Đến ngày
              <input
                type="datetime-local"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => void loadEvents()}
                className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Lọc lịch
              </button>
            </div>
          </form>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Tạo sự kiện thủ công</h2>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={submitEvent}>
            <label className="text-sm text-gray-700">
              Tiêu đề
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-gray-700">
              Loại sự kiện
              <select
                value={form.eventType}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    eventType: event.target.value as CalendarEventPayload['eventType'],
                  }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="VIEWING">Viewing</option>
                <option value="MEETING">Meeting</option>
                <option value="INSPECTION">Inspection</option>
              </select>
            </label>
            <label className="text-sm text-gray-700">
              Bắt đầu
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-gray-700">
              Kết thúc
              <input
                type="datetime-local"
                value={form.endTime}
                onChange={(event) => setForm((prev) => ({ ...prev, endTime: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-gray-700 md:col-span-2">
              Địa điểm
              <input
                type="text"
                value={form.location}
                onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-gray-700 md:col-span-2">
              Ghi chú
              <textarea
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Tạo sự kiện
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Danh sách sự kiện</h2>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : sortedEvents.length === 0 ? (
            <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
              Không có sự kiện trong khoảng thời gian đã chọn.
            </div>
          ) : (
            <div className="space-y-3">
              {sortedEvents.map((event) => (
                <div key={event.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(event.startTime).toLocaleString('vi-VN')} -{' '}
                        {new Date(event.endTime).toLocaleString('vi-VN')}
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        {event.eventType} • {event.status}
                        {event.location ? ` • ${event.location}` : ''}
                      </p>
                      {event.propertyTitle && (
                        <p className="mt-1 text-xs text-emerald-700">BĐS: {event.propertyTitle}</p>
                      )}
                    </div>
                    {!event.sourceViewingId && (
                      <button
                        type="button"
                        onClick={() => void removeEvent(event.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
