import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, TrendingUp } from 'lucide-react';
import { marketPriceIndexAPI, type MarketPriceIndex } from '../api/marketPriceIndex';

const propertyTypes = ['APARTMENT', 'HOUSE', 'VILLA', 'LAND'];

const formatPrice = (value: number) => `${Math.round(value).toLocaleString('vi-VN')} VND/m²`;

const MarketPriceIndexPage: React.FC = () => {
  const [province, setProvince] = useState('');
  const [propertyType, setPropertyType] = useState('APARTMENT');
  const [provinces, setProvinces] = useState<string[]>([]);
  const [rows, setRows] = useState<MarketPriceIndex[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    marketPriceIndexAPI.getAvailableProvinces().then(setProvinces).catch(() => setProvinces([]));
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = province
          ? await marketPriceIndexAPI.getMarketPriceIndex(province, propertyType)
          : await marketPriceIndexAPI.getLatestIndices(propertyType);
        if (active) {
          setRows(Array.isArray(data) ? data : []);
        }
      } catch {
        if (active) {
          setRows([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [province, propertyType]);

  const stats = useMemo(() => {
    if (rows.length === 0) {
      return { highest: 0, lowest: 0, average: 0 };
    }
    const prices = rows.map((item) => item.avgPricePerSqm);
    const total = prices.reduce((acc, value) => acc + value, 0);
    return {
      highest: Math.max(...prices),
      lowest: Math.min(...prices),
      average: total / prices.length,
    };
  }, [rows]);

  const trends = useMemo(() => {
    const grouped = new Map<string, MarketPriceIndex[]>();
    rows.forEach((item) => {
      const list = grouped.get(item.district) ?? [];
      list.push(item);
      grouped.set(item.district, list);
    });
    return Array.from(grouped.entries())
      .map(([district, list]) => {
        const sorted = [...list].sort((a, b) => b.monthYear.localeCompare(a.monthYear));
        const latest = sorted[0]?.avgPricePerSqm ?? 0;
        const previous = sorted[1]?.avgPricePerSqm ?? latest;
        const delta = latest - previous;
        return { district, delta };
      })
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 6);
  }, [rows]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-semibold text-gray-900">
                <TrendingUp className="h-8 w-8 text-red-600" />
                Chi so gia bat dong san
              </h1>
              <p className="mt-2 text-gray-600">So sanh bien dong gia trung binh theo khu vuc va loai hinh.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={province}
                onChange={(event) => setProvince(event.target.value)}
                className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700"
              >
                <option value="">Tat ca tinh/thanh</option>
                {provinces.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                value={propertyType}
                onChange={(event) => setPropertyType(event.target.value)}
                className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700"
              >
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Gia cao nhat</p>
            <p className="mt-2 text-2xl font-semibold text-red-600">{formatPrice(stats.highest)}</p>
          </div>
          <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Gia thap nhat</p>
            <p className="mt-2 text-2xl font-semibold text-red-600">{formatPrice(stats.lowest)}</p>
          </div>
          <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Gia trung binh</p>
            <p className="mt-2 text-2xl font-semibold text-red-600">{formatPrice(stats.average)}</p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-red-50 text-left text-sm font-bold text-red-700">
                <tr>
                  <th className="px-4 py-3">Tinh/Thanh</th>
                  <th className="px-4 py-3">Quan/Huyen</th>
                  <th className="px-4 py-3">Loai BDS</th>
                  <th className="px-4 py-3">Gia TB/m²</th>
                  <th className="px-4 py-3">Tong tin</th>
                  <th className="px-4 py-3">Thang</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {rows.map((row, index) => (
                  <tr key={row.id || `${row.district}-${row.monthYear}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 font-semibold text-gray-900">{row.province}</td>
                    <td className="px-4 py-3 text-gray-700">{row.district}</td>
                    <td className="px-4 py-3 text-gray-700">{row.propertyType}</td>
                    <td className="px-4 py-3 font-bold text-red-600">{formatPrice(row.avgPricePerSqm)}</td>
                    <td className="px-4 py-3 text-gray-700">{row.totalListings}</td>
                    <td className="px-4 py-3 text-gray-700">{row.monthYear}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && rows.length === 0 && (
            <p className="p-6 text-center text-sm text-gray-500">Chua co du lieu chi so gia.</p>
          )}
        </div>

        <section className="mt-6 rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Xu huong</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {trends.map((trend) => (
              <div key={trend.district} className="flex items-center justify-between rounded-xl border border-gray-100 p-3">
                <p className="font-semibold text-gray-800">{trend.district}</p>
                <p className={`flex items-center gap-1 font-bold ${trend.delta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {trend.delta >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  {Math.abs(trend.delta).toLocaleString('vi-VN')} VND/m²
                </p>
              </div>
            ))}
            {trends.length === 0 && <p className="text-sm text-gray-500">Chua co du lieu xu huong.</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MarketPriceIndexPage;
