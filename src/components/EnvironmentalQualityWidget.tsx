import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Leaf, 
  Wind, 
  Volume2, 
  ShieldAlert, 
  Compass, 
  Info,
  Loader2
} from 'lucide-react';
import { environmentalAPI } from '../api';
import type { EnvironmentalQualityResponse } from '../api/types';
import { extractErrorMessage } from '../utils/errorUtils';

interface EnvironmentalQualityWidgetProps {
  propertyId: string;
}

export const EnvironmentalQualityWidget: React.FC<EnvironmentalQualityWidgetProps> = ({ propertyId }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<EnvironmentalQualityResponse | null>(null);

  useEffect(() => {
    const fetchEnvQuality = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await environmentalAPI.getQuality(propertyId);
        setData(resp);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchEnvQuality();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-6 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 text-red-600 animate-spin mb-3" />
        <p className="text-xs text-gray-500 font-bold">{t('environmental.loading', 'Đang phân tích chỉ số sinh thái khu vực...')}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
        <ShieldAlert className="h-10 w-10 text-red-500 mb-3" />
        <p className="text-sm font-bold text-gray-800 mb-1">{t('environmental.errorTitle', 'Không thể tải dữ liệu sinh thái')}</p>
        <p className="text-xs text-gray-500 max-w-xs">{error || t('environmental.errorDesc', 'Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.')}</p>
      </div>
    );
  }

  // Calculate AQI Gauge rotation & stroke-dashoffset (total length is 251.2 for radius 40)
  const maxAqi = 150;
  const aqiPercentage = Math.min(data.aqi / maxAqi, 1);
  const strokeOffset = 251.2 - (251.2 * aqiPercentage);

  // Dynamic colors based on labels
  const getAqiColorClass = (color: string) => {
    switch (color) {
      case 'emerald': return 'text-emerald-500';
      case 'amber': return 'text-amber-500';
      case 'rose': return 'text-rose-500';
      default: return 'text-gray-500';
    }
  };

  const getAqiBgClass = (color: string) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'amber': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'rose': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden p-6 md:p-8 space-y-6">
      {/* Widget Header */}
      <div className="flex items-center gap-3 border-b border-gray-50 pb-5">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
          <Compass className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight">{t('environmental.widgetTitle', '🍃 Chất Lượng Môi Trường Sống')}</h2>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">{t('environmental.widgetDesc', 'Các chỉ số về không khí, tiếng ồn và mảng xanh sinh thái thực tế')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left column: AQI Gauge */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-gray-50/50 rounded-2xl border border-gray-50/80">
          <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-4 flex items-center gap-1">
            <Wind className="h-3.5 w-3.5" />
            Chỉ số không khí (AQI)
          </span>

          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG Arc Gauge */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="50"
                className="stroke-gray-100 fill-none"
                strokeWidth="10"
              />
              <circle
                cx="72"
                cy="72"
                r="50"
                className={`fill-none transition-all duration-1000 ease-out ${
                  data.aqiColor === 'emerald' ? 'stroke-emerald-500' :
                  data.aqiColor === 'amber' ? 'stroke-amber-500' : 'stroke-rose-500'
                }`}
                strokeWidth="10"
                strokeDasharray="314"
                strokeDashoffset={314 - (314 * (data.aqi / 150))}
                strokeLinecap="round"
              />
            </svg>

            {/* Central score display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
              <span className="text-3xl font-black text-gray-900 leading-none">{data.aqi}</span>
              <span className="text-[9px] text-gray-400 font-bold uppercase">AQI US</span>
              <span className="text-[9px] font-extrabold text-gray-500 mt-1">PM2.5: {data.pm25} µg/m³</span>
            </div>
          </div>

          {/* AQI label badge */}
          <div className={`mt-4 px-3.5 py-1.5 rounded-full border text-xs font-black shadow-sm ${getAqiBgClass(data.aqiColor)}`}>
            {data.aqiLabel}
          </div>
        </div>

        {/* Right column: Noise and Greenery bars */}
        <div className="md:col-span-7 space-y-6 flex flex-col justify-between">
          
          {/* Noise level indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-800">
              <span className="flex items-center gap-1.5">
                <Volume2 className="h-4 w-4 text-amber-500" />
                Mức độ tiếng ồn khu vực
              </span>
              <span className={`${getAqiColorClass(data.noiseColor)} font-black`}>{data.noiseLevel} dB</span>
            </div>
            
            {/* Decibel spectrum bar */}
            <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  data.noiseColor === 'emerald' ? 'bg-emerald-500' :
                  data.noiseColor === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min((data.noiseLevel / 90) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[9px] text-gray-400 font-black">
              <span>30dB (Rất khẽ)</span>
              <span className="text-gray-600 font-extrabold">{data.noiseLabel}</span>
              <span>80dB (Ồn lớn)</span>
            </div>
          </div>

          {/* Greenery Cover Score */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-800">
              <span className="flex items-center gap-1.5">
                <Leaf className="h-4 w-4 text-emerald-500" />
                Mật độ cây xanh (bán kính 1km)
              </span>
              <span className="text-emerald-600 font-black">{data.greeneryScore}%</span>
            </div>

            <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
              <div 
                className="h-full rounded-full bg-emerald-500 transition-all duration-1000 ease-out"
                style={{ width: `${data.greeneryScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-gray-400 font-black">
              <span>Ít mảng xanh</span>
              <span className="text-emerald-600">Che phủ tối ưu sinh thái</span>
              <span>Rừng rậm đô thị</span>
            </div>
          </div>

          {/* Summary / Advice Card */}
          <div className="bg-emerald-50/40 border border-emerald-100/60 p-4 rounded-2xl flex gap-2.5 items-start">
            <Info className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-800 font-semibold leading-relaxed">
              {data.environmentalAdvice}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
