import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ArrowLeft, Loader2 } from 'lucide-react';
import { notificationAPI } from '../api/misc';
import toast from '../utils/toast';

export type NotificationPrefs = {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
};

const defaults: NotificationPrefs = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  marketingEmails: false,
};

function normalizeSettings(raw: any): NotificationPrefs {
  if (!raw || typeof raw !== 'object') return { ...defaults };
  return {
    emailNotifications: Boolean(raw.emailNotifications ?? defaults.emailNotifications),
    pushNotifications: Boolean(raw.pushNotifications ?? defaults.pushNotifications),
    smsNotifications: Boolean(raw.smsNotifications ?? defaults.smsNotifications),
    marketingEmails: Boolean(raw.marketingEmails ?? defaults.marketingEmails),
  };
}

const NotificationSettingsPage: React.FC = () => {
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await notificationAPI.getSettings();
        if (!alive) return;
        setPrefs(normalizeSettings(data));
      } catch {
        if (!alive) return;
        setPrefs({ ...defaults });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const toggle = (key: keyof NotificationPrefs) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await notificationAPI.updateSettings(prefs);
      toast.success('Đã lưu cài đặt thông báo.');
    } catch (e: any) {
      toast.error(e.response?.data?.message || e.response?.data?.error || 'Không lưu được. Backend có thể chưa triển khai đầy đủ.');
    } finally {
      setSaving(false);
    }
  };

  const rows: { key: keyof NotificationPrefs; label: string; hint: string }[] = [
    {
      key: 'emailNotifications',
      label: 'Thông báo qua email',
      hint: 'Cập nhật tin đăng, giao dịch, tin nhắn quan trọng.',
    },
    {
      key: 'pushNotifications',
      label: 'Thông báo trên trình duyệt',
      hint: 'Khi bạn mở website và cho phép thông báo.',
    },
    {
      key: 'smsNotifications',
      label: 'SMS (nếu có)',
      hint: 'Cảnh báo ngắn qua tin nhắn.',
    },
    {
      key: 'marketingEmails',
      label: 'Email khuyến mãi & gợi ý',
      hint: 'Ưu đãi gói tin, bản tin thị trường.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-xl mx-auto px-4">
        <Link
          to="/notifications"
          className="inline-flex items-center text-sm text-gray-600 hover:text-red-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Về trung tâm thông báo
        </Link>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Cài đặt thông báo</h1>
              <p className="text-sm text-gray-500">Chọn kênh bạn muốn nhận thông tin</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            </div>
          ) : (
            <div className="p-6 space-y-2">
              {rows.map((row) => (
                <button
                  key={row.key}
                  type="button"
                  onClick={() => toggle(row.key)}
                  className="w-full text-left rounded-lg border border-gray-200 px-4 py-3 hover:border-red-200 hover:bg-red-50/30 transition-colors flex items-start gap-3"
                >
                  <span
                    className={`mt-0.5 flex h-5 w-9 shrink-0 rounded-full transition-colors ${
                      prefs[row.key] ? 'bg-red-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`m-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        prefs[row.key] ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </span>
                  <span>
                    <span className="block font-medium text-gray-900">{row.label}</span>
                    <span className="block text-sm text-gray-500">{row.hint}</span>
                  </span>
                </button>
              ))}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full mt-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 flex justify-center"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lưu thay đổi'}
              </button>
              <p className="text-xs text-gray-400 text-center pt-2">
                Một số tùy chọn phụ thuộc cấu hình server; nếu lưu báo lỗi, vui lòng thử lại sau.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
