import React, { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import { calculateTotal, type CostOptions } from '../utils/costCalculator';

const propertyTypeOptions = [
  { value: 'APARTMENT', label: 'Can ho' },
  { value: 'HOUSE', label: 'Nha rieng' },
  { value: 'LAND', label: 'Dat nen' },
] as const;

const formatVnd = (value: number) => `${Math.round(value).toLocaleString('vi-VN')} VND`;

const CostBreakdownPage: React.FC = () => {
  const [priceInput, setPriceInput] = useState('3000000000');
  const [options, setOptions] = useState<CostOptions>({
    propertyType: 'APARTMENT',
    isFirstTime: true,
    hasBroker: true,
  });

  const price = useMemo(() => Number(priceInput || 0), [priceInput]);
  const result = useMemo(() => calculateTotal(price, options), [options, price]);

  const pieStyle = useMemo(() => {
    const total = Math.max(result.totalExtraCost, 1);
    const taxPct = (result.tax / total) * 100;
    const notaryPct = (result.notaryFee / total) * 100;
    const regPct = (result.registrationFee / total) * 100;
    const brokerPct = (result.brokerFee / total) * 100;
    return {
      background: `conic-gradient(
        #dc2626 0% ${taxPct}%,
        #f97316 ${taxPct}% ${taxPct + notaryPct}%,
        #0ea5e9 ${taxPct + notaryPct}% ${taxPct + notaryPct + regPct}%,
        #16a34a ${taxPct + notaryPct + regPct}% ${taxPct + notaryPct + regPct + brokerPct}%,
        #e5e7eb 0 100%
      )`,
    };
  }, [result]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
          <h1 className="flex items-center gap-2 text-3xl font-semibold text-gray-900">
            <Calculator className="h-8 w-8 text-red-600" />
            Tinh toan chi phi mua nha
          </h1>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Thong tin dau vao</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="cost-breakdown-price" className="mb-1 block text-sm font-semibold text-gray-700">Gia tri bat dong san (VND)</label>
                <input
                  id="cost-breakdown-price"
                  value={Number(priceInput || 0).toLocaleString('vi-VN')}
                  onChange={(event) => setPriceInput(event.target.value.replace(/[^\d]/g, ''))}
                  className="w-full rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-gray-800 outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label htmlFor="cost-breakdown-property-type" className="mb-1 block text-sm font-semibold text-gray-700">Loai bat dong san</label>
                <select
                  id="cost-breakdown-property-type"
                  value={options.propertyType}
                  onChange={(event) =>
                    setOptions((prev) => ({ ...prev, propertyType: event.target.value as CostOptions['propertyType'] }))
                  }
                  className="w-full rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-gray-800"
                >
                  {propertyTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center justify-between rounded-xl border border-red-100 px-4 py-3">
                <span className="text-sm font-semibold text-gray-700">Mua lan dau (uu dai thue)</span>
                <input
                  type="checkbox"
                  checked={options.isFirstTime}
                  onChange={(event) => setOptions((prev) => ({ ...prev, isFirstTime: event.target.checked }))}
                  className="h-4 w-4 accent-red-600"
                />
              </label>
              <label className="flex items-center justify-between rounded-xl border border-red-100 px-4 py-3">
                <span className="text-sm font-semibold text-gray-700">Giao dich qua moi gioi</span>
                <input
                  type="checkbox"
                  checked={options.hasBroker}
                  onChange={(event) => setOptions((prev) => ({ ...prev, hasBroker: event.target.checked }))}
                  className="h-4 w-4 accent-red-600"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Bang chi tiet</h2>
            <div className="mt-4 overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-3 font-semibold text-gray-700">Thue TNCN</td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">{formatVnd(result.tax)}</td>
                  </tr>
                  <tr className="border-b bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-700">Phi cong chung</td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">{formatVnd(result.notaryFee)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3 font-semibold text-gray-700">Phi truoc ba</td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">{formatVnd(result.registrationFee)}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-700">Phi moi gioi</td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">{formatVnd(result.brokerFee)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">
              <p className="text-sm text-gray-600">Tong chi phi phat sinh</p>
              <p className="text-2xl font-semibold text-red-600">{formatVnd(result.totalExtraCost)}</p>
              <p className="mt-3 text-sm text-gray-600">Tong thanh toan du kien</p>
              <p className="text-3xl font-semibold text-red-600">{formatVnd(result.totalPayment)}</p>
            </div>

            <div className="mt-5 flex items-center gap-5">
              <div className="h-28 w-28 rounded-full" style={pieStyle} />
              <div className="space-y-1 text-sm text-gray-700">
                <p><span className="font-bold text-[#dc2626]">■</span> Thue</p>
                <p><span className="font-bold text-[#f97316]">■</span> Cong chung</p>
                <p><span className="font-bold text-[#0ea5e9]">■</span> Truoc ba</p>
                <p><span className="font-bold text-[#16a34a]">■</span> Moi gioi</p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6">
          <Link
            to={`/properties?maxPrice=${Math.round(result.totalPayment)}`}
            className="inline-flex rounded-full bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
          >
            Xem BDS phu hop ngan sach
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CostBreakdownPage;
