import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  TrendingUp, Eye, Heart, MessageSquare, AlertCircle, Loader2, ArrowLeft 
} from 'lucide-react';
import { analyticsAPI, LandlordAnalyticsResponse } from '../api/analytics';
import { useNavigate } from 'react-router-dom';

const LandlordAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<LandlordAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<number>(30);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await analyticsAPI.getLandlordAnalytics(range);
        setData(res);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải dữ liệu thống kê');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [range]);

  const StatCard = ({ title, value, icon, gradient }: { title: string, value: string | number, icon: React.ReactNode, gradient: string }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-inner`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <button 
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Thống kê hiệu quả</h1>
            <p className="text-sm text-slate-500 mt-1">Theo dõi lượt tiếp cận và tương tác các bất động sản của bạn</p>
          </div>

          <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
            {[7, 30, 90].map(days => (
              <button
                key={days}
                onClick={() => setRange(days)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  range === days 
                    ? 'bg-red-50 text-red-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {days} ngày
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex items-center gap-3">
            <AlertCircle className="w-6 h-6" />
            <p className="font-medium">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-red-500" />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Tổng lượt xem" 
                value={data.kpis.totalViews.toLocaleString()} 
                icon={<Eye className="w-6 h-6" />}
                gradient="from-blue-500 to-indigo-600"
              />
              <StatCard 
                title="Lượt lưu tin (Yêu thích)" 
                value={data.kpis.totalFavorites.toLocaleString()} 
                icon={<Heart className="w-6 h-6" />}
                gradient="from-rose-400 to-red-500"
              />
              <StatCard 
                title="Lượt liên hệ" 
                value={data.kpis.totalInquiries.toLocaleString()} 
                icon={<MessageSquare className="w-6 h-6" />}
                gradient="from-emerald-400 to-teal-500"
              />
              <StatCard 
                title="Tỷ lệ chuyển đổi" 
                value={`${data.kpis.conversionRate}%`} 
                icon={<TrendingUp className="w-6 h-6" />}
                gradient="from-amber-400 to-orange-500"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Line Chart */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 lg:col-span-2">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Lưu lượng truy cập ({range} ngày qua)</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.dailyStats} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 12 }} 
                        tickFormatter={(str) => {
                          const date = new Date(str);
                          return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 12 }} 
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '14px' }} />
                      <Line type="monotone" name="Lượt xem" dataKey="views" stroke="#ef4444" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                      <Line type="monotone" name="Lượt liên hệ" dataKey="inquiries" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart (Top Properties) */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Top BĐS hiệu quả nhất</h3>
                {data.topProperties.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.topProperties} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis 
                          type="category" 
                          dataKey="title" 
                          axisLine={false} 
                          tickLine={false} 
                          width={100}
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val}
                        />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="views" name="Lượt xem" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 pb-10">
                    <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                    <p className="text-sm">Chưa có dữ liệu thống kê</p>
                  </div>
                )}
              </div>
            </div>

            {/* Properties List Detailed */}
            {data.topProperties.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900">Chi tiết hiệu suất từng BĐS</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Tên Bất động sản</th>
                        <th className="px-6 py-4 font-semibold">Trạng thái</th>
                        <th className="px-6 py-4 font-semibold text-center">Lượt xem</th>
                        <th className="px-6 py-4 font-semibold text-center">Yêu thích</th>
                        <th className="px-6 py-4 font-semibold text-center">Liên hệ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.topProperties.map((prop, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">
                            {prop.title}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {prop.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-medium text-slate-700">{prop.views}</td>
                          <td className="px-6 py-4 text-center text-slate-500">{prop.favorites}</td>
                          <td className="px-6 py-4 text-center text-slate-500">{prop.inquiries}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default LandlordAnalyticsPage;
