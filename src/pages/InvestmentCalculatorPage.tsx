import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { investmentAPI, type InvestmentCalculationRequest, type InvestmentCalculationResponse } from '../api/investment';
import { showError } from '../utils/toast';

const defaultForm: InvestmentCalculationRequest = {
  purchasePrice: 3000000000,
  initialCosts: 250000000,
  monthlyRentIncome: 20000000,
  monthlyExpenses: 5000000,
  annualAppreciationRate: 6,
  annualInflationRate: 3,
  holdingYears: 10,
  discountRate: 9,
};

const InvestmentCalculatorPage: React.FC = () => {
  const [form, setForm] = useState<InvestmentCalculationRequest>(defaultForm);
  const [result, setResult] = useState<InvestmentCalculationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const money = useMemo(
    () =>
      new Intl.NumberFormat('vi-VN', {
        maximumFractionDigits: 0,
      }),
    []
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await investmentAPI.calculate(form);
      setResult(data);
    } catch {
      showError('Không thể tính toán ROI lúc này');
    } finally {
      setLoading(false);
    }
  };

  const update = (key: keyof InvestmentCalculationRequest, value: string) => {
    setForm((prev) => ({ ...prev, [key]: Number(value) || 0 }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-7 w-7 text-red-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Investment ROI Calculator</h1>
              <p className="text-sm text-gray-600">Tính ROI, IRR, NPV và thời gian hoàn vốn cho khoản đầu tư BĐS.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900">Thông số đầu vào</h2>
            {[
              ['purchasePrice', 'Giá mua (VND)'],
              ['initialCosts', 'Chi phí ban đầu (VND)'],
              ['monthlyRentIncome', 'Thuê hàng tháng (VND)'],
              ['monthlyExpenses', 'Chi phí hàng tháng (VND)'],
              ['annualAppreciationRate', 'Tăng giá tài sản (%/năm)'],
              ['annualInflationRate', 'Lạm phát (%/năm)'],
              ['holdingYears', 'Số năm nắm giữ'],
              ['discountRate', 'Discount rate (%/năm)'],
            ].map(([key, label]) => (
              <label key={key} className="block text-sm">
                <span className="mb-1 block text-gray-700">{label}</span>
                <input
                  type="number"
                  value={form[key as keyof InvestmentCalculationRequest]}
                  onChange={(e) => update(key as keyof InvestmentCalculationRequest, e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
                />
              </label>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Tính toán
            </button>
          </form>

          <div className="space-y-6 lg:col-span-3">
            {result ? (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[
                    ['ROI', `${result.roiPercent}%`],
                    ['IRR', `${result.irrPercent}%`],
                    ['NPV', `${money.format(result.npv)} VND`],
                    ['Payback', result.paybackYears < 0 ? 'Không hoàn vốn' : `${result.paybackYears} năm`],
                    ['Lợi nhuận ròng', `${money.format(result.netProfit)} VND`],
                    ['Benchmark', `${result.marketBenchmarkPercent}%/năm`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
                      <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-base font-semibold text-gray-900">Dòng tiền theo năm</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={result.yearlyCashFlows}>
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(value) => `${Math.round(value / 1000000)}M`} />
                        <Tooltip formatter={(value: any) => `${money.format(Number(value || 0))} VND`} />
                        <Line type="monotone" dataKey="cumulativeCashFlow" stroke="#dc2626" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="netCashFlow" stroke="#2563eb" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl bg-white p-10 text-center text-gray-600 shadow-sm">
                Nhập thông số và bấm “Tính toán” để xem kết quả đầu tư.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentCalculatorPage;
