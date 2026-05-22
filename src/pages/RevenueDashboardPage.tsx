import { useEffect, useMemo, useState } from 'react';
import { Download, Loader2, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { revenueAPI, type MonthlyRevenueChartItem, type PropertyRevenueBreakdown, type RevenueSummary } from '../api/revenue';
import { showError } from '../utils/toast';

const money = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 0,
});

const RevenueDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [chart, setChart] = useState<MonthlyRevenueChartItem[]>([]);
  const [byProperty, setByProperty] = useState<PropertyRevenueBreakdown[]>([]);
  const [months, setMonths] = useState(12);
  const [loading, setLoading] = useState(true);

  const loadRevenue = async () => {
    setLoading(true);
    try {
      const [summaryData, chartData, propertyData] = await Promise.all([
        revenueAPI.getSummary(),
        revenueAPI.getMonthlyChart(months),
        revenueAPI.getByProperty(),
      ]);
      setSummary(summaryData);
      setChart(chartData);
      setByProperty(propertyData);
    } catch {
      showError('Không thể tải dữ liệu doanh thu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRevenue();
  }, [months]);

  const downloadCsv = async () => {
    try {
      const blob = await revenueAPI.exportCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'revenue-report.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showError('Không thể export báo cáo');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-7 w-7 text-emerald-600" />
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Revenue Dashboard</h1>
                <p className="text-sm text-gray-600">Theo dõi doanh thu cho thuê, nợ quá hạn và hiệu suất từng BĐS.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value={3}>3 tháng</option>
                <option value={6}>6 tháng</option>
                <option value={12}>12 tháng</option>
                <option value={24}>24 tháng</option>
              </select>
              <button
                type="button"
                onClick={downloadCsv}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-950"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs uppercase text-gray-500">Tổng doanh thu</p>
                <p className="mt-1 text-lg font-bold text-gray-900">{money.format(summary?.totalRevenue || 0)} VND</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs uppercase text-gray-500">Đã thu</p>
                <p className="mt-1 text-lg font-bold text-emerald-700">{money.format(summary?.totalPaidRevenue || 0)} VND</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs uppercase text-gray-500">Quá hạn</p>
                <p className="mt-1 text-lg font-bold text-red-700">{money.format(summary?.totalOverdueAmount || 0)} VND</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs uppercase text-gray-500">Hoá đơn đã thu</p>
                <p className="mt-1 text-lg font-bold text-gray-900">{summary?.paidInvoices || 0}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs uppercase text-gray-500">Hoá đơn quá hạn</p>
                <p className="mt-1 text-lg font-bold text-gray-900">{summary?.overdueInvoices || 0}</p>
              </div>
            </div>

            <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-gray-900">Doanh thu theo tháng</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000000)}M`} />
                    <Tooltip formatter={(value: any) => `${money.format(Number(value || 0))} VND`} />
                    <Bar dataKey="revenue" fill="#16a34a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-gray-900">Doanh thu theo bất động sản</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                      <th className="p-3">Bất động sản</th>
                      <th className="p-3">Doanh thu</th>
                      <th className="p-3">Đã thu</th>
                      <th className="p-3">Quá hạn</th>
                      <th className="p-3">Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byProperty.map((item) => (
                      <tr key={item.propertyId} className="border-b border-gray-100">
                        <td className="p-3 font-medium text-gray-900">{item.propertyTitle}</td>
                        <td className="p-3">{money.format(item.revenue)} VND</td>
                        <td className="p-3">{item.paidInvoices}</td>
                        <td className="p-3">{item.overdueInvoices}</td>
                        <td className="p-3">{item.pendingInvoices}</td>
                      </tr>
                    ))}
                    {byProperty.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                          Chưa có dữ liệu doanh thu.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RevenueDashboardPage;
