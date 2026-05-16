import { useEffect, useMemo, useState } from 'react';
import { Bell, BellOff, Loader2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { priceAlertAPI, type PriceAlert } from '../api/priceAlert';
import { showError, showSuccess } from '../utils/toast';

const PriceAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyIds, setBusyIds] = useState<Record<string, boolean>>({});

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await priceAlertAPI.getMyAlerts();
      setAlerts(data);
    } catch {
      showError('Không thể tải danh sách cảnh báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAlerts();
  }, []);

  const activeCount = useMemo(() => alerts.filter((a) => a.isActive).length, [alerts]);

  const toggleActive = async (alert: PriceAlert) => {
    setBusyIds((prev) => ({ ...prev, [alert.id]: true }));
    try {
      const updated = await priceAlertAPI.updateActive(alert.id, !alert.isActive);
      setAlerts((prev) => prev.map((item) => (item.id === alert.id ? updated : item)));
      showSuccess(updated.isActive ? 'Đã bật cảnh báo' : 'Đã tắt cảnh báo');
    } catch {
      showError('Không thể cập nhật trạng thái cảnh báo');
    } finally {
      setBusyIds((prev) => ({ ...prev, [alert.id]: false }));
    }
  };

  const removeAlert = async (id: string) => {
    setBusyIds((prev) => ({ ...prev, [id]: true }));
    try {
      await priceAlertAPI.deleteAlert(id);
      setAlerts((prev) => prev.filter((item) => item.id !== id));
      showSuccess('Đã xoá cảnh báo');
    } catch {
      showError('Không thể xoá cảnh báo');
    } finally {
      setBusyIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý cảnh báo giá</h1>
              <p className="mt-1 text-sm text-gray-600">
                Tổng {alerts.length} cảnh báo, đang bật {activeCount} cảnh báo.
              </p>
            </div>
            <Link
              to="/properties"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Xem tin đăng
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-gray-500" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center text-gray-600 shadow-sm">
            Bạn chưa có cảnh báo nào.
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {alert.property?.title || `Cảnh báo ${alert.alertType}`}
                    </p>
                    <p className="text-xs text-gray-600">
                      Loại: {alert.alertType}
                      {alert.targetPrice ? ` • Mục tiêu: ${alert.targetPrice.toLocaleString('vi-VN')} VND` : ''}
                    </p>
                    <p className="text-xs text-gray-500">
                      Triggered: {alert.triggerCount || 0} lần
                      {alert.triggeredAt ? ` • Gần nhất: ${new Date(alert.triggeredAt).toLocaleString('vi-VN')}` : ''}
                    </p>
                    <p className="text-xs text-gray-500">
                      Bộ lọc: {alert.propertyType || 'Tất cả loại'} • {alert.listingType || 'Mua/Bán + Thuê'}
                      {alert.minArea || alert.maxArea ? ` • Diện tích ${alert.minArea || 0}-${alert.maxArea || '∞'}m²` : ''}
                      {alert.provinceId ? ` • Province ${alert.provinceId}` : ''}
                      {alert.districtId ? ` • District ${alert.districtId}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleActive(alert)}
                      disabled={busyIds[alert.id]}
                      className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                        alert.isActive
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {alert.isActive ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
                      {alert.isActive ? 'Đang bật' : 'Đang tắt'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAlert(alert.id)}
                      disabled={busyIds[alert.id]}
                      className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xoá
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceAlertsPage;
