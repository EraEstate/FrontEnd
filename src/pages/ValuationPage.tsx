import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { propertyAPI } from '../api/property';
import { useAuthStore } from '../store/authStore';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  PieChart, Pie
} from 'recharts';
import { getImageUrl, getImagePlaceholder } from '../utils/imageUtils';
import { formatVND } from '../utils/format';

const PROPERTY_TYPES = [
  { value: 'APARTMENT', label: 'Chung cư' },
  { value: 'HOUSE', label: 'Nhà riêng' },
  { value: 'VILLA', label: 'Biệt thự' },
  { value: 'TOWNHOUSE', label: 'Nhà phố' },
  { value: 'LAND', label: 'Đất nền' },
  { value: 'OFFICE', label: 'Văn phòng' },
];

const ValuationPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { t } = useTranslation();

  // Form state
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [provinceId, setProvinceId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [propertyType, setPropertyType] = useState('APARTMENT');
  const [area, setArea] = useState(60);
  const [yearBuilt, setYearBuilt] = useState(2020);
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Step state — form(1) → result(2)
  const [step, setStep] = useState(1);

  useEffect(() => {
    propertyAPI.getProvinces().then(setProvinces).catch(() => {});
  }, []);

  useEffect(() => {
    if (provinceId) {
      propertyAPI.getDistrictsByProvince(provinceId).then(setDistricts).catch(() => {});
      setDistrictId('');
    }
  }, [provinceId]);

  const handleValuate = async () => {
    if (!provinceId || !area) return;
    setLoading(true);
    setResult(null);
    try {
      const params: any = {
        provinceId, propertyType,
        minArea: Math.max(1, area - 30), maxArea: area + 30,
        size: 100,
      };
      if (districtId) params.districtId = districtId;
      const res = await propertyAPI.search(params);
      const comparables = (res.content || res || []).filter((p: any) => p.price && p.area);

      if (comparables.length < 2) {
        setResult({ error: 'Không đủ dữ liệu BĐS tương tự trong khu vực để so sánh. Hãy thử chọn khu vực lớn hơn hoặc thay đổi loại hình.' });
        setStep(2);
      } else {
        const pricesPerSqm = comparables.map((p: any) => Number(p.price) / Number(p.area));
        pricesPerSqm.sort((a: number, b: number) => a - b);

        // Trimmed mean — remove top/bottom 10%
        const lo = Math.floor(pricesPerSqm.length * 0.1);
        const hi = Math.ceil(pricesPerSqm.length * 0.9);
        const trimmed = pricesPerSqm.slice(lo, hi);
        const avgPricePerSqm = trimmed.reduce((s: number, v: number) => s + v, 0) / trimmed.length;

        // Median
        const mid = Math.floor(trimmed.length / 2);
        const medianPricePerSqm = trimmed.length % 2 !== 0 ? trimmed[mid] : (trimmed[mid - 1] + trimmed[mid]) / 2;

        // Age adjustment
        const currentYear = new Date().getFullYear();
        const ageFactor = Math.max(0.82, 1 - (currentYear - yearBuilt) * 0.006);

        const estimatedMid = Math.round(medianPricePerSqm * area * ageFactor);
        const estimatedLow = Math.round(avgPricePerSqm * area * ageFactor * 0.88);
        const estimatedHigh = Math.round(avgPricePerSqm * area * ageFactor * 1.12);

        // Confidence score — based on sample size & standard deviation
        const stdDev = Math.sqrt(trimmed.reduce((s: number, v: number) => s + (v - avgPricePerSqm) ** 2, 0) / trimmed.length);
        const coeffVar = stdDev / avgPricePerSqm;
        const confidenceRaw = Math.min(100, Math.max(30, Math.round((1 - coeffVar) * 80 + Math.min(comparables.length, 30) * 0.7)));

        // Distribution chart
        const buckets: Record<string, number> = {};
        comparables.forEach((p: any) => {
          const bucket = Math.round(Number(p.price) / 1e8) * 1e8;
          buckets[formatVND(bucket)] = (buckets[formatVND(bucket)] || 0) + 1;
        });
        const chartData = Object.entries(buckets).map(([name, count]) => ({ name, count })).slice(0, 12);

        // Top comparables for reference list
        const topComparables = comparables
          .map((p: any) => ({ ...p, priceDiff: Math.abs(Number(p.price) - estimatedMid) }))
          .sort((a: any, b: any) => a.priceDiff - b.priceDiff)
          .slice(0, 5);

        setResult({
          estimatedLow, estimatedHigh, estimatedMid,
          avgPricePerSqm: Math.round(avgPricePerSqm),
          medianPricePerSqm: Math.round(medianPricePerSqm),
          comparableCount: comparables.length,
          confidence: confidenceRaw,
          ageFactor: Math.round(ageFactor * 100),
          chartData,
          topComparables,
        });
        setStep(2);
      }
    } catch {
      setResult({ error: 'Có lỗi khi truy vấn dữ liệu. Vui lòng thử lại.' });
      setStep(2);
    } finally {
      setLoading(false);
    }
  };



  const inputClass = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none";

  const confidenceColor = (v: number) => v >= 70 ? '#22c55e' : v >= 50 ? '#eab308' : '#ef4444';
  const confidenceLabel = (v: number) => v >= 70 ? 'Cao' : v >= 50 ? 'Trung bình' : 'Thấp';

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">Định giá bất động sản</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-lg mx-auto">
            Ước tính giá trị thị trường dựa trên dữ liệu {provinces.length > 0 ? `hơn ${provinces.length} tỉnh thành` : 'toàn quốc'}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-3 justify-center mb-8">
          {[1, 2].map(s => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= s ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>{s}</div>
              {s < 2 && <div className={`w-12 h-0.5 rounded ${step >= 2 ? 'bg-red-600' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* ── Step 1: Form ── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-1">Thông tin bất động sản</h2>
              <p className="text-xs text-gray-400 mb-5">Điền càng chính xác, kết quả định giá càng sát thực tế</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label htmlFor="valuation-province" className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Province / City *</label>
                  <select id="valuation-province" value={provinceId} onChange={e => setProvinceId(e.target.value)} className={inputClass}>
                    <option value="">Chọn tỉnh/thành</option>
                    {provinces.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="valuation-district" className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">District</label>
                  <select id="valuation-district" value={districtId} onChange={e => setDistrictId(e.target.value)} className={inputClass} disabled={!provinceId}>
                    <option value="">Tất cả quận/huyện</option>
                    {districts.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="valuation-property-type" className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Property Type</label>
                  <select id="valuation-property-type" value={propertyType} onChange={e => setPropertyType(e.target.value)} className={inputClass}>
                    {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="valuation-year-built" className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Year Built</label>
                  <input id="valuation-year-built" type="number" value={yearBuilt} onChange={e => setYearBuilt(Number(e.target.value))} min={1970} max={2026} className={inputClass} />
                </div>
              </div>

              {/* Bedrooms / Bathrooms */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <p className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Bedrooms</p>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setBedrooms(n)}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${
                          bedrooms === n ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                        }`}>{n}{n === 5 ? '+' : ''}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Bathrooms</p>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map(n => (
                      <button key={n} onClick={() => setBathrooms(n)}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${
                          bathrooms === n ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                        }`}>{n}{n === 4 ? '+' : ''}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Area Slider */}
              <div className="mb-6">
                <div className="flex justify-between items-baseline mb-2">
                  <label htmlFor="valuation-area" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Area</label>
                  <span className="text-lg font-bold text-gray-900">{area} <span className="text-sm font-normal text-gray-400">m²</span></span>
                </div>
                <input id="valuation-area" type="range" min={20} max={500} step={5} value={area} onChange={e => setArea(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-red-600" />
                <div className="flex justify-between text-[10px] text-gray-300 mt-1"><span>20</span><span>100</span><span>250</span><span>500</span></div>
              </div>
            </div>

            {/* Submit */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button onClick={handleValuate} disabled={loading || !provinceId}
                className="w-full py-3.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
                {loading ? (
                  <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Đang phân tích dữ liệu…</>
                ) : (
                  <><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>Phân tích & Định giá</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Result ── */}
        {step === 2 && result && !result.error && (
          <div className="space-y-4">
            {/* Back button */}
            <button onClick={() => { setStep(1); setResult(null); }}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Nhập lại thông tin
            </button>

            {/* Main Valuation Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
              {/* Auth gate */}
              {!isAuthenticated && (
                <div className="absolute inset-0 z-20 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Đăng nhập để xem báo cáo</h3>
                  <p className="text-sm text-gray-500 max-w-xs mb-5">Tạo tài khoản miễn phí để xem đầy đủ kết quả định giá và BĐS tham chiếu</p>
                  <button onClick={() => navigate('/login')}
                    className="px-8 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors text-sm">
                    Đăng nhập / Đăng ký
                  </button>
                </div>
              )}

              <div className={!isAuthenticated ? 'filter blur-md pointer-events-none select-none' : ''}>
                {/* Hero Price */}
                <div className="p-6 pb-5 text-center bg-gradient-to-b from-red-50/50 to-white">
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-3">Giá trị ước tính</p>
                  <p className="text-4xl font-bold text-gray-900 mb-2">{formatVND(result.estimatedMid)}</p>
                  <p className="text-sm text-gray-500">Khoảng: <span className="font-semibold text-gray-700">{formatVND(result.estimatedLow)} đến {formatVND(result.estimatedHigh)}</span></p>
                </div>

                {/* Confidence + Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 sm:gap-y-0 sm:divide-x divide-gray-100 border-y border-gray-100 py-4 bg-gray-50/50">
                  <div className="p-4 text-center">
                    <div className="w-10 h-10 rounded-full mx-auto mb-1.5 flex items-center justify-center" style={{ border: `3px solid ${confidenceColor(result.confidence)}` }}>
                      <span className="text-xs font-bold" style={{ color: confidenceColor(result.confidence) }}>{result.confidence}%</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium">Độ tin cậy</p>
                    <p className="text-[10px] font-semibold" style={{ color: confidenceColor(result.confidence) }}>{confidenceLabel(result.confidence)}</p>
                  </div>
                  <div className="p-4 text-center flex flex-col justify-center">
                    <p className="text-lg font-bold text-gray-900">{result.comparableCount}</p>
                    <p className="text-[10px] text-gray-400 font-medium">BĐS so sánh</p>
                  </div>
                  <div className="p-4 text-center flex flex-col justify-center">
                    <p className="text-lg font-bold text-gray-900">{formatVND(result.medianPricePerSqm)}</p>
                    <p className="text-[10px] text-gray-400 font-medium">Giá/m² (Median)</p>
                  </div>
                  <div className="p-4 text-center flex flex-col justify-center">
                    <p className="text-lg font-bold text-gray-900">{result.ageFactor}%</p>
                    <p className="text-[10px] text-gray-400 font-medium">Hệ số tuổi</p>
                  </div>
                </div>

                {/* Distribution Chart */}
                {result.chartData?.length > 0 && (
                  <div className="p-6">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Phân bố giá BĐS khu vực</h3>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={result.chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <YAxis hide />
                          <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.08)', fontSize: '12px' }} />
                          <Bar dataKey="count" name="Số lượng BĐS" radius={[5, 5, 0, 0]} barSize={24}>
                            {result.chartData.map((entry: any, i: number) => (
                              <Cell key={`bar-cell-${entry.name}`} fill={i % 2 === 0 ? '#ef4444' : '#fca5a5'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Comparable Properties */}
                {result.topComparables?.length > 0 && (
                  <div className="p-6 pt-0">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">BĐS tham chiếu gần nhất</h3>
                    <div className="space-y-2">
                      {result.topComparables.map((p: any) => (
                        <Link key={p.id} to={`/properties/${p.id}`}
                          className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group">
                          <div className="w-14 h-14 rounded-lg bg-cover bg-center shrink-0 border border-gray-100"
                            style={{ backgroundImage: `url(${getImageUrl(p.mainImageUrl || p.imageUrl) || getImagePlaceholder(100, 100)})` }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-red-600 transition-colors">{p.title}</p>
                            <p className="text-xs text-gray-400 truncate">{p.address}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-red-600">{formatVND(p.price)}</p>
                            <p className="text-[10px] text-gray-400">{p.area}m²</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="p-6 pt-2 flex gap-3">
                  <button onClick={() => navigate('/post-property')}
                    className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors text-sm">
                    Đăng tin bán ngay
                  </button>
                  <button onClick={() => navigate('/properties')}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">
                    Tìm BĐS tương tự
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {step === 2 && result?.error && (
          <div className="space-y-4">
            <button onClick={() => { setStep(1); setResult(null); }}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Quay lại
            </button>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              </div>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">{result.error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValuationPage;
