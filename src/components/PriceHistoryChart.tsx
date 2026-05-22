import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { propertyAPI } from '../api/property';
import { TrendingUp, Bell } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from '../utils/toast';

interface PriceHistoryChartProps {
  propertyId: string;
  currentPrice: number;
}

const formatPriceYAxis = (tickItem: number) => {
  if (tickItem >= 1000000000) {
    return `${(tickItem / 1000000000).toFixed(1)} tỷ`;
  }
  if (tickItem >= 1000000) {
    return `${(tickItem / 1000000).toFixed(0)} tr`;
  }
  return tickItem.toLocaleString();
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-md">
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="font-bold text-red-600">
          {formatPriceYAxis(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ propertyId, currentPrice }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [targetPrice, setTargetPrice] = useState(currentPrice);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    let alive = true;
    propertyAPI.getPriceHistory(propertyId)
      .then((history) => {
        if (!alive) return;
        if (history && history.length > 0) {
          const formattedData = history.map((item: any) => ({
            date: new Date(item.changedAt).toLocaleDateString('vi-VN'),
            price: item.newPrice
          })).reverse(); // Mới nhất ở cuối

          // Thêm điểm hiện tại nếu cần
          if (formattedData.length > 0 && formattedData[formattedData.length - 1].price !== currentPrice) {
            formattedData.push({
              date: new Date().toLocaleDateString('vi-VN'),
              price: currentPrice
            });
          }

          setData(formattedData);
        } else {
          // Nếu chưa có lịch sử, tạo 1 điểm duy nhất
          setData([
            {
              date: new Date().toLocaleDateString('vi-VN'),
              price: currentPrice
            }
          ]);
        }
      })
      .catch((err: any) => {
        if (err?.response?.status === 404) {
          setData([
            {
              date: new Date().toLocaleDateString('vi-VN'),
              price: currentPrice
            }
          ]);
          return;
        }
        console.error('Failed to load price history', err);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [propertyId, currentPrice]);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để tạo thông báo giá.');
      return;
    }

    try {
      await propertyAPI.createPriceAlert({
        propertyId,
        targetPrice
      });
      toast.success('Đã tạo thông báo giá thành công. Bạn sẽ nhận được thông báo khi giá thay đổi.');
      setShowModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tạo thông báo giá.');
    }
  };



  if (loading) {
    return <div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">Đang tải biểu đồ...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Lịch sử giá</h2>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
        >
          <Bell className="w-4 h-4" />
          Nhận thông báo giá
        </button>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              tickFormatter={formatPriceYAxis} 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#2563EB"
              strokeWidth={3}
              dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#1D4ED8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Alert Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/40">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <h2 className="text-lg font-semibold text-gray-900">Nhận thông báo khi giá thay đổi</h2>
            <p className="text-sm text-gray-600 mt-1 mb-4">
              Chúng tôi sẽ gửi thông báo cho bạn ngay khi chủ nhà cập nhật giá bán.
            </p>
            <form onSubmit={handleCreateAlert} className="space-y-4">
              <div>
                <label htmlFor="price-history-alert-target" className="block text-sm font-medium text-gray-700 mb-1">Mức giá mục tiêu của bạn (Tuỳ chọn)</label>
                <div className="relative">
                  <input
                    id="price-history-alert-target"

                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="VD: 2000000000"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">VND</div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Hệ thống sẽ ưu tiên báo khi giá chạm mức này.</p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                >
                  Tạo thông báo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceHistoryChart;
