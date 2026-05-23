import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Tag, 
  Clock, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  AlertCircle,
  FileCheck,
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import { propertyHistoryAPI } from '../api/propertyHistory';
import type { PropertyHistory, PropertyHistoryStats } from '../api/types';
import { PropertyStatsBadges } from './PropertyStatsBadges';

interface PropertyTimelineProps {
  propertyId: string;
}

export const PropertyTimeline: React.FC<PropertyTimelineProps> = ({ propertyId }) => {
  const { t } = useTranslation();
  const [timeline, setTimeline] = useState<PropertyHistory[]>([]);
  const [stats, setStats] = useState<PropertyHistoryStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [timelineData, statsData] = await Promise.all([
          propertyHistoryAPI.getTimeline(propertyId),
          propertyHistoryAPI.getStats(propertyId)
        ]);
        setTimeline(timelineData);
        setStats(statsData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching property timeline:', err);
        setError(t('propertyHistory.fetchError', 'Failed to load property history'));
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchData();
    }
  }, [propertyId, t]);

  const getEventConfig = (event: PropertyHistory) => {
    switch (event.eventType.toUpperCase()) {
      case 'CREATED':
        return {
          icon: <Home className="w-4 h-4 text-emerald-500" />,
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          title: t('propertyHistory.eventCreated', 'Listing Created'),
          textColor: 'text-emerald-800'
        };
      case 'PRICE_CHANGE':
        const isDrop = (() => {
          try {
            if (event.oldValue && event.newValue) {
              return parseFloat(event.newValue) < parseFloat(event.oldValue);
            }
          } catch {}
          return true;
        })();
        return {
          icon: isDrop ? (
            <ArrowDownCircle className="w-4 h-4 text-amber-500" />
          ) : (
            <ArrowUpCircle className="w-4 h-4 text-rose-500" />
          ),
          bgColor: isDrop ? 'bg-amber-50' : 'bg-rose-50',
          borderColor: isDrop ? 'border-amber-200' : 'border-rose-200',
          title: t('propertyHistory.eventPriceChange', 'Price Update'),
          textColor: isDrop ? 'text-amber-800' : 'text-rose-800'
        };
      case 'STATUS_CHANGE':
        return {
          icon: <FileCheck className="w-4 h-4 text-blue-500" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          title: t('propertyHistory.eventStatusChange', 'Status Changed'),
          textColor: 'text-blue-800'
        };
      case 'LISTING_RENEWED':
        return {
          icon: <RefreshCw className="w-4 h-4 text-purple-500 animate-spin-slow" />,
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          title: t('propertyHistory.eventListingRenewed', 'Listing Renewed'),
          textColor: 'text-purple-800'
        };
      default:
        return {
          icon: <Clock className="w-4 h-4 text-gray-500" />,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: event.eventType,
          textColor: 'text-gray-800'
        };
    }
  };

  const formatPrice = (value: string) => {
    try {
      const num = parseFloat(value);
      if (isNaN(num)) return value;
      if (num >= 1000000000) {
        return `${(num / 1000000000).toFixed(2)} tỷ`;
      }
      return `${(num / 1000000).toFixed(0)} triệu`;
    } catch {
      return value;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(navigator.language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm animate-pulse space-y-6">
        <div className="h-6 w-48 bg-gray-200 rounded-lg" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-1/4 bg-gray-200 rounded-lg" />
                <div className="h-4 w-3/4 bg-gray-200 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-3xl border border-red-100 flex items-center gap-3">
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-red-600 animate-pulse" />
            {t('propertyHistory.title', 'Lịch sử dòng thời gian tin đăng')}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {t('propertyHistory.subtitle', 'Theo dõi toàn bộ biến động và lịch sử phê duyệt của bất động sản')}
          </p>
        </div>
        <PropertyStatsBadges stats={stats} />
      </div>

      {timeline.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Home className="w-12 h-12 mx-auto mb-3 opacity-30 text-gray-400" />
          <p className="text-sm">{t('propertyHistory.noHistory', 'Không có lịch sử hoạt động nào được ghi nhận.')}</p>
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-dashed border-gray-200 ml-4 space-y-6">
          <AnimatePresence>
            {timeline.map((event, index) => {
              const cfg = getEventConfig(event);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
                  className="relative group"
                >
                  {/* Event Marker */}
                  <span className={`absolute -left-10 top-0.5 flex items-center justify-center w-8 h-8 rounded-full border shadow-sm transition-all duration-300 ${cfg.bgColor} ${cfg.borderColor} group-hover:scale-110`}>
                    {cfg.icon}
                  </span>

                  {/* Event Content Card */}
                  <div className="p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-100/50 transition-all duration-300">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <span className={`text-sm font-bold ${cfg.textColor}`}>
                        {cfg.title}
                      </span>
                      <span className="text-[10px] font-medium text-gray-400">
                        {formatDate(event.createdAt)}
                      </span>
                    </div>

                    {event.description && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    {/* Price change details */}
                    {event.eventType.toUpperCase() === 'PRICE_CHANGE' && event.oldValue && event.newValue && (
                      <div className="flex items-center gap-3 mt-3 px-3 py-2 bg-white rounded-xl border border-gray-100 w-fit">
                        <span className="text-[10px] font-semibold text-gray-400 line-through">
                          {formatPrice(event.oldValue)}
                        </span>
                        <span className="text-xs font-bold text-gray-900">
                          {formatPrice(event.newValue)}
                        </span>
                        {(() => {
                          try {
                            const oldVal = parseFloat(event.oldValue);
                            const newVal = parseFloat(event.newValue);
                            if (oldVal > 0 && newVal < oldVal) {
                              const pct = (((oldVal - newVal) / oldVal) * 100).toFixed(0);
                              return (
                                <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-500">
                                  <TrendingDown size={10} />
                                  -{pct}%
                                </span>
                              );
                            }
                          } catch {}
                          return null;
                        })()}
                      </div>
                    )}

                    {/* Status change details */}
                    {event.eventType.toUpperCase() === 'STATUS_CHANGE' && event.oldValue && event.newValue && (
                      <div className="flex items-center gap-2 mt-3 text-xs">
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-md font-semibold text-[10px]">
                          {event.oldValue}
                        </span>
                        <span className="text-gray-400">➔</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md font-semibold text-[10px]">
                          {event.newValue}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
