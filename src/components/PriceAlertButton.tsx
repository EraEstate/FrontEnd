import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2, X, Trash2, TrendingDown, ArrowDownCircle, ArrowUpCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { priceAlertAPI, type PriceAlert, type PriceAlertType } from '../api/priceAlert';
import { useAuthStore } from '../store/authStore';
import { showSuccess, showError } from '../utils/toast';

interface Props {
  propertyId: string;
  currentPrice: number;
}

const ALERT_TYPE_ICONS: Record<string, React.ReactNode> = {
  PRICE_DROP: <TrendingDown className="w-5 h-5 text-red-500" />,
  PRICE_BELOW: <ArrowDownCircle className="w-5 h-5 text-blue-500" />,
  PRICE_ABOVE: <ArrowUpCircle className="w-5 h-5 text-green-500" />,
  ANY_CHANGE: <RefreshCw className="w-5 h-5 text-orange-500" />,
};

const ALERT_TYPES = [
  { value: 'PRICE_DROP', label: 'Khi giá giảm' },
  { value: 'PRICE_BELOW', label: 'Khi giá dưới mức' },
  { value: 'PRICE_ABOVE', label: 'Khi giá trên mức' },
  { value: 'ANY_CHANGE', label: 'Bất kỳ thay đổi' },
];

const PriceAlertButton: React.FC<Props> = ({ propertyId, currentPrice }) => {
  const { isAuthenticated } = useAuthStore();
  const [showPanel, setShowPanel] = useState(false);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(false);

  // Form
  const [alertType, setAlertType] = useState('PRICE_DROP');
  const [targetPrice, setTargetPrice] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [listingType, setListingType] = useState('');
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && showPanel) {
      loadAlerts();
    }
  }, [isAuthenticated, showPanel]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const all = await priceAlertAPI.getMyAlerts();
      // Filter only alerts for this property
      setAlerts(all.filter(a => a.propertyId === propertyId));
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (alertType !== 'PRICE_DROP' && alertType !== 'ANY_CHANGE' && !targetPrice) {
      showError('Vui lòng nhập mức giá mục tiêu');
      return;
    }
    setSubmitting(true);
    try {
      const price = targetPrice ? parseFloat(targetPrice) : currentPrice;
      await priceAlertAPI.create({
        propertyId,
        targetPrice: price,
        alertType: alertType as PriceAlertType,
        propertyType: propertyType || undefined,
        listingType: listingType || undefined,
        minArea: minArea ? parseFloat(minArea) : undefined,
        maxArea: maxArea ? parseFloat(maxArea) : undefined,
        provinceId: provinceId || undefined,
        districtId: districtId || undefined,
      });
      showSuccess('Đã tạo cảnh báo giá!');
      setTargetPrice('');
      setPropertyType('');
      setListingType('');
      setMinArea('');
      setMaxArea('');
      setProvinceId('');
      setDistrictId('');
      loadAlerts();
    } catch (err: any) {
      showError(err.response?.data?.error || err.response?.data?.message || 'Không thể tạo cảnh báo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await priceAlertAPI.deleteAlert(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
      showSuccess('Đã xóa cảnh báo');
    } catch {
      showError('Không thể xóa cảnh báo');
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1e9) return `${(price / 1e9).toFixed(1)} tỷ`;
    if (price >= 1e6) return `${(price / 1e6).toFixed(0)} triệu`;
    return price.toLocaleString('vi-VN');
  };

  const hasActiveAlert = alerts.some(a => a.isActive);

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
          hasActiveAlert
            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100'
            : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
        }`}
      >
        {hasActiveAlert ? (
          <Bell className="w-4 h-4 text-yellow-600 animate-pulse" />
        ) : (
          <BellOff className="w-4 h-4" />
        )}
        {hasActiveAlert ? `${alerts.filter(a => a.isActive).length} cảnh báo` : 'Theo dõi giá'}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-100">
              <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-yellow-600" />
                Cảnh báo giá
              </h4>
              <button onClick={() => setShowPanel(false)} className="p-1 hover:bg-white/50 rounded-lg transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Current Price */}
              <div className="text-center py-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Giá hiện tại</p>
                <p className="text-lg font-bold text-red-600">{formatPrice(currentPrice)} VND</p>
              </div>

              {/* Alert Type Select */}
              <div className="grid grid-cols-2 gap-2">
                {ALERT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setAlertType(type.value)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                      alertType === type.value
                        ? 'border-red-300 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="block mb-0.5">{ALERT_TYPE_ICONS[type.value]}</span>
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Target Price Input (conditional) */}
              {(alertType === 'PRICE_BELOW' || alertType === 'PRICE_ABOVE') && (
                <div>
                  <label htmlFor="price-alert-target-price" className="text-xs text-gray-500 mb-1 block">Mức giá mục tiêu (VND)</label>
                  <input
                    id="price-alert-target-price"

                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder={`VD: ${Math.round(currentPrice * 0.9)}`}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none"
                  />
                </div>
              )}

              {/* Smart criteria filters */}
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none"
                >
                  <option value="">Loại BĐS (tất cả)</option>
                  <option value="APARTMENT">Căn hộ</option>
                  <option value="HOUSE">Nhà phố</option>
                  <option value="VILLA">Biệt thự</option>
                  <option value="OFFICE">Văn phòng</option>
                  <option value="LAND">Đất</option>
                </select>
                <select
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value)}
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none"
                >
                  <option value="">Nhu cầu (tất cả)</option>
                  <option value="SALE">Mua</option>
                  <option value="RENT">Thuê</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={minArea}
                  onChange={(e) => setMinArea(e.target.value)}
                  placeholder="Diện tích min (m²)"
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none"
                />
                <input
                  type="number"
                  value={maxArea}
                  onChange={(e) => setMaxArea(e.target.value)}
                  placeholder="Diện tích max (m²)"
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  value={provinceId}
                  onChange={(e) => setProvinceId(e.target.value)}
                  placeholder="Province ID"
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none"
                />
                <input
                  value={districtId}
                  onChange={(e) => setDistrictId(e.target.value)}
                  placeholder="District ID"
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none"
                />
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="w-full py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                Tạo cảnh báo
              </button>

              {/* Active Alerts */}
              {loading ? (
                <div className="flex justify-center py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : alerts.length > 0 && (
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-500 font-medium mb-2">Cảnh báo đã đặt:</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${
                          alert.isActive ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-100 opacity-60'
                        }`}
                      >
                        <div>
                          <span className="font-medium">
                            {ALERT_TYPES.find(t => t.value === alert.alertType)?.label}
                          </span>
                          {alert.targetPrice && (
                            <span className="text-gray-500 ml-1">
                              ({formatPrice(alert.targetPrice)})
                            </span>
                          )}
                          {alert.isTriggered && <span className="ml-1 text-orange-600 inline-flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Đã kích hoạt</span>}
                        </div>
                        <button
                          onClick={() => handleDelete(alert.id)}
                          className="p-1 hover:bg-red-100 rounded transition-colors text-[#9ca3af] hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PriceAlertButton;
