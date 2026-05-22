import React, { useEffect, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  Wallet, 
  DollarSign, 
  LineChart as ChartIcon, 
  Percent, 
  Calendar, 
  Activity, 
  Info,
  Loader2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { investmentAPI } from '../api';
import type { InvestmentCalculationResponse } from '../api/types';
import { showError } from '../utils/toast';

interface InvestmentSimulatorProps {
  propertyPrice: number;
}

export const InvestmentSimulator: React.FC<InvestmentSimulatorProps> = ({ propertyPrice }) => {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  // Input states (default initial values)
  const [initialCosts, setInitialCosts] = useState<number>(Math.round(propertyPrice * 0.05)); // 5% registration/tax
  const [monthlyRent, setMonthlyRent] = useState<number>(Math.round(propertyPrice * 0.004)); // ~4.8% annual rental yield
  const [expenses, setExpenses] = useState<number>(Math.round(propertyPrice * 0.0005)); // insurance, maintenance
  const [appreciation, setAppreciation] = useState<number>(7); // 7% appreciation rate
  const [inflation, setInflation] = useState<number>(3); // 3% inflation rate
  const [holdingYears, setHoldingYears] = useState<number>(10);
  const [discountRate, setDiscountRate] = useState<number>(6); // 6% discount rate for NPV

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<InvestmentCalculationResponse | null>(null);

  const runSimulation = async (isInitial = false) => {
    if (!isInitial) {
      setLoading(true);
    }
    try {
      const data = await investmentAPI.calculate({
        purchasePrice: propertyPrice,
        initialCosts,
        monthlyRentIncome: monthlyRent,
        monthlyExpenses: expenses,
        annualAppreciationRate: appreciation,
        annualInflationRate: inflation,
        holdingYears,
        discountRate
      });
      setResults(data);
    } catch (error) {
      console.error(error);
      showError(t('investment.simulateError', 'Lỗi khi giả lập dòng tiền đầu tư'));
    } finally {
      if (!isInitial) {
        setLoading(false);
      }
    }
  };

  // Run simulation on slider updates with transition for zero lag typing/sliding experience!
  useEffect(() => {
    startTransition(() => {
      runSimulation(true);
    });
  }, [
    propertyPrice,
    initialCosts,
    monthlyRent,
    expenses,
    appreciation,
    inflation,
    holdingYears,
    discountRate
  ]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(2)} tỷ`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)} triệu`;
    }
    return value.toLocaleString('vi-VN') + ' ₫';
  };

  const chartData = results?.yearlyCashFlows.map(item => ({
    year: `Năm ${item.year}`,
    net: Math.round(item.netCashFlow),
    cumulative: Math.round(item.cumulativeCashFlow)
  })) || [];

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
        <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
          <TrendingUp className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight">📊 Giả Lập Dòng Tiền Đầu Tư Thông Minh</h2>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">Ước tính lợi nhuận dòng, IRR, NPV và giá trị tương lai dựa trên các tham số vĩ mô</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sliders panel */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="font-extrabold text-xs text-gray-400 uppercase tracking-wider">Tham Số Giả Lập</h3>
          
          {/* Purchase price preview */}
          <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-500 font-bold">Giá mua bất động sản</span>
            <span className="text-xs font-black text-red-600">{formatCurrency(propertyPrice)}</span>
          </div>

          {/* Initial Costs */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-800">
              <span className="flex items-center gap-1">
                Chi phí hoàn thiện / trước bạ
                <TooltipIcon text="Chi phí sơn sửa, hoàn thiện nội thất và thuế trước bạ ban đầu" />
              </span>
              <span className="text-gray-900">{formatCurrency(initialCosts)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.round(propertyPrice * 0.2)}
              step={Math.round(propertyPrice * 0.005)}
              value={initialCosts}
              onChange={e => setInitialCosts(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>

          {/* Monthly Rent */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-800">
              <span className="flex items-center gap-1">
                Giá thuê dự kiến / tháng
                <TooltipIcon text="Doanh thu cho thuê thuần dự kiến thu được mỗi tháng" />
              </span>
              <span className="text-gray-900">{formatCurrency(monthlyRent)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.round(propertyPrice * 0.01)}
              step={Math.round(propertyPrice * 0.0002)}
              value={monthlyRent}
              onChange={e => setMonthlyRent(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>

          {/* Maintenance Expenses */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-800">
              <span className="flex items-center gap-1">
                Chi phí vận hành / tháng
                <TooltipIcon text="Phí quản lý chung cư, bảo trì định kỳ, bảo hiểm,..." />
              </span>
              <span className="text-gray-900">{formatCurrency(expenses)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.round(propertyPrice * 0.002)}
              step={Math.round(propertyPrice * 0.00005)}
              value={expenses}
              onChange={e => setExpenses(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>

          {/* Appreciation rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-800">
              <span className="flex items-center gap-1">
                Tăng trưởng giá nhà hàng năm
                <TooltipIcon text="Tỷ lệ tăng trưởng giá đất / căn hộ kỳ vọng hàng năm" />
              </span>
              <span className="text-gray-900">{appreciation}% / năm</span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              step={0.5}
              value={appreciation}
              onChange={e => setAppreciation(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>

          {/* Inflation rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-800">
              <span className="flex items-center gap-1">
                Tỷ lệ lạm phát kỳ vọng
                <TooltipIcon text="Lạm phát dùng để trượt giá thuê nhà hàng năm" />
              </span>
              <span className="text-gray-900">{inflation}% / năm</span>
            </div>
            <input
              type="range"
              min={0}
              max={15}
              step={0.5}
              value={inflation}
              onChange={e => setInflation(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Holding Years */}
            <div className="space-y-2">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Thời gian giữ BĐS</label>
              <select
                value={holdingYears}
                onChange={e => setHoldingYears(Number(e.target.value))}
                className="w-full p-2 border border-gray-200 rounded-xl outline-none text-xs font-bold bg-white"
              >
                {[3, 5, 7, 10, 15, 20].map(y => (
                  <option key={y} value={y}>{y} năm</option>
                ))}
              </select>
            </div>

            {/* Discount Rate */}
            <div className="space-y-2">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tỷ suất chiết khấu (NPV)</label>
              <select
                value={discountRate}
                onChange={e => setDiscountRate(Number(e.target.value))}
                className="w-full p-2 border border-gray-200 rounded-xl outline-none text-xs font-bold bg-white"
              >
                {[4, 5, 6, 7, 8, 10, 12].map(r => (
                  <option key={r} value={r}>{r}% / năm</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Output metrics & Charts */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
          <h3 className="font-extrabold text-xs text-gray-400 uppercase tracking-wider flex justify-between items-center">
            Hiệu Quả Dự Kiến
            {isPending && <Loader2 className="h-4 w-4 animate-spin text-red-600" />}
          </h3>

          {results ? (
            <div className="space-y-6">
              {/* Primary KPIs Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                
                {/* IRR Card */}
                <div className="bg-red-50/50 rounded-2xl p-4 border border-red-100 flex flex-col justify-between space-y-1 shadow-sm">
                  <div className="text-[10px] text-red-600 font-extrabold uppercase tracking-wide flex items-center gap-1">
                    <Percent className="h-3.5 w-3.5" />
                    IRR (Tỷ Suất Hoàn Vốn)
                  </div>
                  <div className="text-lg font-black text-red-700">{results.irrPercent.toFixed(2)}%</div>
                  <span className="text-[9px] text-gray-400 font-bold">Lợi nhuận nội bộ hàng năm</span>
                </div>

                {/* NPV Card */}
                <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 flex flex-col justify-between space-y-1 shadow-sm">
                  <div className="text-[10px] text-blue-600 font-extrabold uppercase tracking-wide flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    NPV (Giá Trị Hiện Tại)
                  </div>
                  <div className={`text-base font-black ${results.npv >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {results.npv >= 0 ? '+' : ''}{formatCurrency(results.npv)}
                  </div>
                  <span className="text-[9px] text-gray-400 font-bold">Lợi nhuận quy về hiện tại</span>
                </div>

                {/* ROI Card */}
                <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100 flex flex-col justify-between space-y-1 shadow-sm col-span-2 md:col-span-1">
                  <div className="text-[10px] text-purple-600 font-extrabold uppercase tracking-wide flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5" />
                    ROI Tổng Lợi Nhuận
                  </div>
                  <div className="text-lg font-black text-purple-700">{results.roiPercent.toFixed(1)}%</div>
                  <span className="text-[9px] text-gray-400 font-bold">Tổng lợi nhuận trên vốn</span>
                </div>

              </div>

              {/* Secondary parameters */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50/60 p-4 rounded-2xl border border-gray-100 text-xs font-semibold text-gray-600">
                <div className="flex justify-between items-center">
                  <span>Tổng vốn đầu tư ban đầu:</span>
                  <span className="font-extrabold text-gray-900">{formatCurrency(results.totalInvestment)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Giá trị BĐS sau {holdingYears} năm:</span>
                  <span className="font-extrabold text-gray-900">{formatCurrency(results.estimatedSaleValue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Điểm hòa vốn dự kiến:</span>
                  <span className="font-extrabold text-gray-900">
                    {results.paybackYears > 0 ? `${results.paybackYears.toFixed(1)} năm` : 'Chưa hòa vốn'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tổng lợi nhuận ròng:</span>
                  <span className="font-extrabold text-emerald-600">{formatCurrency(results.netProfit)}</span>
                </div>
              </div>

              {/* Recharts Area Chart */}
              <div className="space-y-2">
                <div className="text-xs font-extrabold text-gray-800 flex items-center gap-1">
                  <ChartIcon className="h-4 w-4 text-red-600" />
                  Dòng Tiền Tích Lũy Qua Các Năm (VND)
                </div>
                
                <div className="h-56 w-full bg-gray-50/40 p-2 rounded-2xl border border-gray-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="year" tick={{ fontSize: 9, fontWeight: 'bold' }} stroke="#9ca3af" />
                      <YAxis 
                        tickFormatter={(value) => value >= 1000000000 ? `${(value / 1000000000).toFixed(1)}B` : `${(value / 1000000).toFixed(0)}M`}
                        tick={{ fontSize: 9, fontWeight: 'bold' }}
                        stroke="#9ca3af"
                      />
                      <Tooltip 
                        formatter={(value: any) => [formatCurrency(Number(value)), 'Tích lũy dòng tiền']}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '11px', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="cumulative" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCumulative)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* Helper Component TooltipIcon */
const TooltipIcon: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="group relative inline-block cursor-help">
      <Info className="h-3.5 w-3.5 text-gray-300 hover:text-gray-400" />
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-[10px] text-white font-semibold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-lg leading-normal text-center z-10">
        {text}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
};
