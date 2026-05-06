import React, { useEffect, useState } from 'react';
import { useCompareStore } from '../store/compareStore';
import { propertyAPI } from '../api/property';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Scale, Check, Minus, X, TrendingUp } from 'lucide-react';
import { getImageUrl, getImagePlaceholder } from '../utils/imageUtils';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import toast from '../utils/toast';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b']; // Red, Blue, Green, Yellow

const PropertyComparisonPage: React.FC = () => {
  const { compareList, removeProperty } = useCompareStore();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    if (compareList.length > 0) {
      setLoading(true);
      propertyAPI.getPropertiesForCompare(compareList.map(p => p.id))
        .then((res) => {
          if (alive) setProperties(res);
        })
        .catch(() => toast.error('Không thể tải dữ liệu so sánh'))
        .finally(() => {
          if (alive) setLoading(false);
        });
    } else {
      setProperties([]);
      setLoading(false);
    }
    return () => { alive = false; };
  }, [compareList]);

  // Generate data for Radar Chart (normalize values)
  const generateChartData = () => {
    if (properties.length === 0) return [];
    
    // Collect all values for normalization
    const maxPrice = Math.max(...properties.map(p => p.price || 0));
    const maxArea = Math.max(...properties.map(p => p.area || 0));
    const maxBed = Math.max(...properties.map(p => p.bedrooms || p.propertyDetails?.[0]?.bedrooms || 0));
    const maxBath = Math.max(...properties.map(p => p.bathrooms || p.propertyDetails?.[0]?.bathrooms || 0));
    const maxPricePerSqm = Math.max(...properties.map(p => (p.price && p.area) ? p.price / p.area : 0));

    // Count amenities per property
    const countAmenities = (p: any) => {
      const d = p.propertyDetails?.[0] || {};
      let count = 0;
      if (d.parking) count++;
      if (d.security) count++;
      if (d.airConditioning) count++;
      if (d.balcony) count++;
      if (d.garden) count++;
      if (d.elevator) count++;
      if (d.swimmingPool) count++;
      return count;
    };
    const maxAmenities = Math.max(...properties.map(p => countAmenities(p)), 1);

    const metrics = [
      { key: 'price', label: 'Giá trị' },
      { key: 'area', label: 'Diện tích' },
      { key: 'bedrooms', label: 'Phòng ngủ' },
      { key: 'bathrooms', label: 'Phòng tắm' },
      { key: 'pricePerSqm', label: 'Đơn giá/m²' },
      { key: 'amenities', label: 'Tiện ích' },
    ];

    return metrics.map(metric => {
      const dataPoint: any = { subject: metric.label };
      properties.forEach((p, index) => {
        let normalized = 0;
        if (metric.key === 'price') {
          normalized = maxPrice ? ((p.price || 0) / maxPrice) * 100 : 0;
        } else if (metric.key === 'area') {
          normalized = maxArea ? ((p.area || 0) / maxArea) * 100 : 0;
        } else if (metric.key === 'bedrooms') {
          const val = p.bedrooms || p.propertyDetails?.[0]?.bedrooms || 0;
          normalized = maxBed ? (val / maxBed) * 100 : 0;
        } else if (metric.key === 'bathrooms') {
          const val = p.bathrooms || p.propertyDetails?.[0]?.bathrooms || 0;
          normalized = maxBath ? (val / maxBath) * 100 : 0;
        } else if (metric.key === 'pricePerSqm') {
          const val = (p.price && p.area) ? p.price / p.area : 0;
          normalized = maxPricePerSqm ? (val / maxPricePerSqm) * 100 : 0;
        } else if (metric.key === 'amenities') {
          normalized = (countAmenities(p) / maxAmenities) * 100;
        }
        dataPoint[`BDS ${index + 1}`] = Math.round(normalized);
      });
      return dataPoint;
    });
  };

  const chartData = generateChartData();

  const formatPrice = (price: number) => {
    if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)} tỷ`;
    if (price >= 1000000) return `${(price / 1000000).toFixed(0)} triệu`;
    return price.toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
        <div className="animate-pulse text-gray-500 font-medium">Đang tải dữ liệu so sánh...</div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có bất động sản nào để so sánh</h2>
          <p className="text-gray-500 mb-6">Hãy thêm ít nhất 2 bất động sản vào danh sách so sánh.</p>
          <button 
            onClick={() => navigate('/properties')}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Tìm bất động sản
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Scale className="w-8 h-8 text-red-600" />
              So sánh bất động sản
            </h1>
            <p className="text-gray-500 mt-1">So sánh chi tiết {properties.length} bất động sản để đưa ra quyết định tốt nhất.</p>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Properties Grid / Table Container */}
          <div className="xl:w-2/3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr>
                    <th className="w-48 p-4 bg-gray-50 font-semibold text-gray-700 border-b border-gray-200 align-bottom">Tiêu chí</th>
                    {properties.map((p, index) => (
                      <th key={p.id} className="p-4 border-b border-gray-200 w-64 align-top relative">
                        <button 
                          onClick={() => removeProperty(p.id)}
                          className="absolute top-2 right-2 p-1.5 bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="mb-3 rounded-lg overflow-hidden border border-gray-200">
                          <div 
                            className="h-32 bg-cover bg-center" 
                            style={{ backgroundImage: `url(${getImageUrl(p.mainImageUrl || p.imageUrl) || getImagePlaceholder(300, 200)})` }}
                          />
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index] }} />
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">BDS {index + 1}</span>
                        </div>
                        <Link to={`/properties/${p.id}`} className="text-sm font-bold text-gray-900 hover:text-red-600 line-clamp-2 leading-tight">
                          {p.title}
                        </Link>
                      </th>
                    ))}
                    {/* Empty Slots */}
                    {[...Array(4 - properties.length)].map((_, i) => (
                      <th key={`empty-${i}`} className="p-4 border-b border-gray-200 w-64 align-top">
                        <div className="h-32 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                          <span className="text-sm font-medium">Chỗ trống</span>
                          <span className="text-xs mt-1">Thêm BDS để so sánh</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700">
                  {/* Basic Info */}
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 border-b border-gray-100 font-medium text-gray-900 bg-gray-50/50">Mức giá</td>
                    {properties.map(p => (
                      <td key={p.id} className="p-4 border-b border-gray-100 font-bold text-red-600">{formatPrice(p.price)}</td>
                    ))}
                    {[...Array(4 - properties.length)].map((_, i) => <td key={`empty-p-${i}`} className="p-4 border-b border-gray-100 bg-gray-50/30"></td>)}
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 border-b border-gray-100 font-medium text-gray-900 bg-gray-50/50">Diện tích</td>
                    {properties.map(p => (
                      <td key={p.id} className="p-4 border-b border-gray-100 font-medium">{p.area ? `${p.area} m²` : <Minus className="w-4 h-4 text-gray-300" />}</td>
                    ))}
                    {[...Array(4 - properties.length)].map((_, i) => <td key={`empty-a-${i}`} className="p-4 border-b border-gray-100 bg-gray-50/30"></td>)}
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 border-b border-gray-100 font-medium text-gray-900 bg-gray-50/50">Đơn giá / m²</td>
                    {properties.map(p => {
                      const pricePerSqm = p.price && p.area ? Math.round(p.price / p.area) : 0;
                      return <td key={p.id} className="p-4 border-b border-gray-100 text-gray-600">{pricePerSqm ? `${formatPrice(pricePerSqm)}/m²` : <Minus className="w-4 h-4 text-gray-300" />}</td>;
                    })}
                    {[...Array(4 - properties.length)].map((_, i) => <td key={`empty-pp-${i}`} className="p-4 border-b border-gray-100 bg-gray-50/30"></td>)}
                  </tr>
                  
                  {/* Layout */}
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 border-b border-gray-100 font-medium text-gray-900 bg-gray-50/50">Phòng ngủ</td>
                    {properties.map(p => {
                      const val = p.bedrooms || p.propertyDetails?.[0]?.bedrooms;
                      return <td key={p.id} className="p-4 border-b border-gray-100 font-medium">{val ? `${val} PN` : <Minus className="w-4 h-4 text-gray-300" />}</td>;
                    })}
                    {[...Array(4 - properties.length)].map((_, i) => <td key={`empty-bed-${i}`} className="p-4 border-b border-gray-100 bg-gray-50/30"></td>)}
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 border-b border-gray-100 font-medium text-gray-900 bg-gray-50/50">Phòng tắm</td>
                    {properties.map(p => {
                      const val = p.bathrooms || p.propertyDetails?.[0]?.bathrooms;
                      return <td key={p.id} className="p-4 border-b border-gray-100 font-medium">{val ? `${val} PT` : <Minus className="w-4 h-4 text-gray-300" />}</td>;
                    })}
                    {[...Array(4 - properties.length)].map((_, i) => <td key={`empty-bath-${i}`} className="p-4 border-b border-gray-100 bg-gray-50/30"></td>)}
                  </tr>
                  
                  {/* Features */}
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 border-b border-gray-100 font-medium text-gray-900 bg-gray-50/50">Chỗ để xe</td>
                    {properties.map(p => {
                      const val = p.propertyDetails?.[0]?.parking;
                      return <td key={p.id} className="p-4 border-b border-gray-100">{val ? <Check className="w-5 h-5 text-green-500" /> : <Minus className="w-4 h-4 text-gray-300" />}</td>;
                    })}
                    {[...Array(4 - properties.length)].map((_, i) => <td key={`empty-f1-${i}`} className="p-4 border-b border-gray-100 bg-gray-50/30"></td>)}
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 border-b border-gray-100 font-medium text-gray-900 bg-gray-50/50">Sân vườn</td>
                    {properties.map(p => {
                      const val = p.propertyDetails?.[0]?.garden;
                      return <td key={p.id} className="p-4 border-b border-gray-100">{val ? <Check className="w-5 h-5 text-green-500" /> : <Minus className="w-4 h-4 text-gray-300" />}</td>;
                    })}
                    {[...Array(4 - properties.length)].map((_, i) => <td key={`empty-f2-${i}`} className="p-4 border-b border-gray-100 bg-gray-50/30"></td>)}
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900 bg-gray-50/50">Vị trí</td>
                    {properties.map(p => (
                      <td key={p.id} className="p-4 text-xs text-gray-600 leading-tight">{p.address}</td>
                    ))}
                    {[...Array(4 - properties.length)].map((_, i) => <td key={`empty-loc-${i}`} className="p-4 bg-gray-50/30"></td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Radar Chart Panel */}
          <div className="xl:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Biểu đồ tương quan (Chuẩn hoá)
              </h3>
              
              {properties.length > 1 ? (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Tooltip 
                        formatter={(value: any) => [`${Math.round(value)} điểm`, 'Tương đối']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                      
                      {properties.map((_, index) => (
                        <Radar
                          key={index}
                          name={`BDS ${index + 1}`}
                          dataKey={`BDS ${index + 1}`}
                          stroke={COLORS[index]}
                          fill={COLORS[index]}
                          fillOpacity={0.4}
                        />
                      ))}
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                  <div className="text-center text-gray-400">
                    <Scale className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">Cần ít nhất 2 BDS để vẽ biểu đồ</p>
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-bold text-blue-900 mb-1">Hướng dẫn đọc biểu đồ</h4>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Các chỉ số được chuẩn hoá theo thang 100 dựa trên giá trị lớn nhất trong nhóm. 
                  Hình đa giác càng rộng về phía một tiêu chí chứng tỏ bất động sản đó càng có lợi thế (lớn hơn) ở tiêu chí đó.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyComparisonPage;
