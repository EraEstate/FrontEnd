import React, { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { formatVNDPrecise as formatVND } from '../utils/format';

interface Props {
  propertyPrice: number;
  isRent?: boolean;
}

const MortgageCalculator: React.FC<Props> = ({ propertyPrice, isRent }) => {
  const [downPaymentPercent, setDownPaymentPercent] = useState(30);
  const [loanTermYears, setLoanTermYears] = useState(20);
  const [annualRate, setAnnualRate] = useState(7.5);
  const [showSchedule, setShowSchedule] = useState(false);

  const calc = useMemo(() => {
    const loanAmount = propertyPrice * (1 - downPaymentPercent / 100);
    const monthlyRate = annualRate / 100 / 12;
    const totalMonths = loanTermYears * 12;

    if (monthlyRate === 0 || totalMonths === 0) {
      return { monthlyPayment: 0, totalInterest: 0, totalPayment: 0, loanAmount: 0, schedule: [] };
    }

    const monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);

    const totalPayment = monthlyPayment * totalMonths;
    const totalInterest = totalPayment - loanAmount;

    const schedule: { year: number; principal: number; interest: number }[] = [];
    let balance = loanAmount;

    for (let y = 1; y <= loanTermYears; y++) {
      let yearPrincipal = 0;
      let yearInterest = 0;
      for (let m = 0; m < 12; m++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        yearInterest += interestPayment;
        yearPrincipal += principalPayment;
        balance -= principalPayment;
      }
      schedule.push({ year: y, principal: Math.round(yearPrincipal), interest: Math.round(yearInterest) });
    }

    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      loanAmount: Math.round(loanAmount),
      schedule,
    };
  }, [propertyPrice, downPaymentPercent, loanTermYears, annualRate]);

  const pieData = [
    { name: 'Tiền gốc', value: calc.loanAmount || 0 },
    { name: 'Tiền lãi', value: calc.totalInterest },
  ];
  const PIE_COLORS = ['#ef4444', '#fbbf24'];



  if (isRent) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Ước tính khoản vay</h2>
            <p className="text-xs text-gray-500">Tính toán chi phí tài chính khi mua bất động sản này</p>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4 mb-5">
          <div>
            <div className="flex justify-between items-baseline text-sm mb-2">
              <span className="text-gray-600 font-medium">Trả trước</span>
              <div className="text-right">
                <span className="font-bold text-gray-900 text-base">{downPaymentPercent}%</span>
                <span className="text-xs text-gray-400 ml-1.5">({formatVND(propertyPrice * downPaymentPercent / 100)})</span>
              </div>
            </div>
            <input type="range" min={10} max={90} step={5} value={downPaymentPercent}
              onChange={e => setDownPaymentPercent(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-red-600"
            />
            <div className="flex justify-between text-[10px] text-gray-300 mt-1"><span>10%</span><span>50%</span><span>90%</span></div>
          </div>

          <div>
            <div className="flex justify-between items-baseline text-sm mb-2">
              <span className="text-gray-600 font-medium">Thời hạn vay</span>
              <span className="font-bold text-gray-900 text-base">{loanTermYears} <span className="text-xs font-normal text-gray-400">năm</span></span>
            </div>
            <input type="range" min={1} max={30} step={1} value={loanTermYears}
              onChange={e => setLoanTermYears(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-red-600"
            />
            <div className="flex justify-between text-[10px] text-gray-300 mt-1"><span>1</span><span>15</span><span>30</span></div>
          </div>

          <div>
            <div className="flex justify-between items-baseline text-sm mb-2">
              <span className="text-gray-600 font-medium">Lãi suất</span>
              <span className="font-bold text-gray-900 text-base">{annualRate}% <span className="text-xs font-normal text-gray-400">/ năm</span></span>
            </div>
            <input type="range" min={3} max={15} step={0.1} value={annualRate}
              onChange={e => setAnnualRate(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-red-600"
            />
            <div className="flex justify-between text-[10px] text-gray-300 mt-1"><span>3%</span><span>9%</span><span>15%</span></div>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gray-50 border-t border-gray-100 p-5">
        {/* Monthly Payment Highlight */}
        <div className="bg-white rounded-xl p-4 mb-4 border border-gray-100 text-center">
          <p className="text-xs text-gray-500 font-medium mb-0.5">Số tiền trả hàng tháng</p>
          <p className="text-2xl font-bold text-red-600">{formatVND(calc.monthlyPayment)}</p>
        </div>

        {/* Pie + Legend */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-32 h-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {pieData.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i]} />))}
                </Pie>
                <Tooltip formatter={(val: any) => formatVND(val)} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,.1)', fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-sm bg-red-500 shrink-0" />
              <div className="flex-1">
                <p className="text-[11px] text-gray-400 leading-none mb-0.5">Tiền gốc</p>
                <p className="text-sm font-bold text-gray-900">{formatVND(calc.loanAmount)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-sm bg-amber-400 shrink-0" />
              <div className="flex-1">
                <p className="text-[11px] text-gray-400 leading-none mb-0.5">Tổng tiền lãi</p>
                <p className="text-sm font-bold text-gray-900">{formatVND(calc.totalInterest)}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <p className="text-[11px] text-gray-400 leading-none mb-0.5">Tổng phải trả</p>
              <p className="text-sm font-bold text-gray-900">{formatVND(calc.totalPayment)}</p>
            </div>
          </div>
        </div>

        {/* Toggle Schedule */}
        <button
          onClick={() => setShowSchedule(!showSchedule)}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg border border-gray-200 bg-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {showSchedule
              ? <><path d="m18 15-6-6-6 6"/></>
              : <><path d="m6 9 6 6 6-6"/></>
            }
          </svg>
          {showSchedule ? 'Ẩn lịch trả nợ' : 'Xem lịch trả nợ theo năm'}
        </button>

        {showSchedule && calc.schedule.length > 0 && (
          <div className="mt-4 bg-white rounded-xl border border-gray-100 p-4">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={calc.schedule} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `N${v}`} />
                  <YAxis hide />
                  <Tooltip
                    formatter={(val: any, name?: any) => [formatVND(val), name === 'principal' ? 'Gốc' : 'Lãi']}
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,.1)', fontSize: '13px' }}
                  />
                  <Bar dataKey="principal" name="Gốc" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="interest" name="Lãi" stackId="a" fill="#fbbf24" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 justify-center">
              <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-red-500" />Gốc</div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />Lãi</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MortgageCalculator;
