import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { propertyAPI } from '../../api/property';
import { useCompareStore } from '../../store/compareStore';
import { Banknote, Maximize, TrendingUp } from 'lucide-react';

type Metric = 'price' | 'area' | 'pricePerSqm';

const colors = [
  'bg-red-500', 
  'bg-blue-500', 
  'bg-amber-500', 
  'bg-emerald-500'
];

const bgColors = [
  'bg-red-50', 
  'bg-blue-50', 
  'bg-amber-50', 
  'bg-emerald-50'
];

const metricConfig: Record<Metric, { label: string; icon: React.FC<any>; format: (val: number) => string }> = {
  price: {
    label: 'Giá bán',
    icon: Banknote,
    format: (val) => {
      if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)} Tỷ`;
      if (val >= 1000000) return `${(val / 1000000).toFixed(0)} Triệu`;
      return `${Math.round(val).toLocaleString('vi-VN')} VNĐ`;
    },
  },
  area: {
    label: 'Diện tích',
    icon: Maximize,
    format: (val) => `${Math.round(val)} m²`,
  },
  pricePerSqm: {
    label: 'Đơn giá / m²',
    icon: TrendingUp,
    format: (val) => `${Math.round(val).toLocaleString('vi-VN')} đ`,
  },
};

const ComparisonChart: React.FC = () => {
  const { compareList } = useCompareStore();
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (compareList.length < 2) {
        setProperties([]);
        return;
      }
      try {
        const data = await propertyAPI.getPropertiesForCompare(compareList.map((item) => item.id));
        if (active) {
          setProperties(Array.isArray(data) ? data : []);
        }
      } catch {
        if (active) {
          setProperties([]);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [compareList]);

  const metrics = useMemo(() => {
    const rows = (['price', 'area', 'pricePerSqm'] as Metric[]).map((metric) => {
      const values = properties.map((p) => {
        if (metric === 'price') return Number(p.price || 0);
        if (metric === 'area') return Number(p.area || 0);
        const price = Number(p.price || 0);
        const area = Number(p.area || 0);
        return area > 0 ? price / area : 0;
      });
      const max = Math.max(...values, 1);
      return {
        metric,
        bars: values.map((value, index) => ({
          index,
          name: properties[index]?.title || `BĐS ${index + 1}`,
          percent: Math.max(5, (value / max) * 100),
          value,
        })),
      };
    });
    return rows;
  }, [properties]);

  if (properties.length < 2) {
    return null;
  }

  return (
    <section className="mt-12 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Tổng quan so sánh</h2>
          <p className="mt-1 text-sm text-gray-500">Phân tích các chỉ số cơ bản của bất động sản</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {metrics.map((row) => {
          const config = metricConfig[row.metric];
          const Icon = config.icon;
          return (
            <div key={row.metric} className="rounded-xl border border-gray-50 bg-gray-50/50 p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-700 shadow-sm">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-gray-900">{config.label}</h3>
              </div>
              
              <div className="space-y-5">
                {row.bars.map((bar) => (
                  <div key={`${row.metric}-${bar.index}`}>
                    <div className="mb-1.5 flex items-end justify-between">
                      <span className="text-xs font-semibold text-gray-600 line-clamp-1 pr-2" title={bar.name}>
                        {bar.name}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {config.format(bar.value)}
                      </span>
                    </div>
                    <div className={`h-2.5 w-full overflow-hidden rounded-full ${bgColors[bar.index % bgColors.length]}`}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${bar.percent}%` }}
                        viewport={{ once: true, amount: 0.8 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className={`h-full rounded-full ${colors[bar.index % colors.length]}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ComparisonChart;
