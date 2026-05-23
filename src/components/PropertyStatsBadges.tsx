import React from 'react';
import { Calendar, TrendingDown, Tag, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { PropertyHistoryStats } from '../api/types';

interface PropertyStatsBadgesProps {
  stats: PropertyHistoryStats | null;
  loading?: boolean;
}

export const PropertyStatsBadges: React.FC<PropertyStatsBadgesProps> = ({ stats, loading }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex flex-wrap gap-3 animate-pulse">
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    );
  }

  if (!stats) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-wrap gap-3 my-2"
    >
      {/* Days On Market Badge */}
      <motion.div 
        variants={itemVariants}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200/60 shadow-sm transition-all hover:scale-105"
      >
        <Calendar size={14} className="text-slate-500" />
        <span>
          {t('propertyHistory.daysOnMarket', 'Days Listed')}: {stats.daysOnMarket} {t('propertyHistory.days', 'ngày')}
        </span>
      </motion.div>

      {/* Price Change Count Badge */}
      <motion.div 
        variants={itemVariants}
        className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100/60 shadow-sm transition-all hover:scale-105"
      >
        <Clock size={14} className="text-red-500" />
        <span>
          {t('propertyHistory.priceChanges', 'Biến động giá')}: {stats.priceChangeCount}
        </span>
      </motion.div>

      {/* Discount Badge (Only if discounted) */}
      {stats.isDiscounted && stats.discountPercentage > 0 && (
        <motion.div 
          variants={itemVariants}
          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100/60 shadow-sm transition-all hover:scale-105"
        >
          <TrendingDown size={14} className="text-emerald-600" />
          <span>
            {t('propertyHistory.discount', 'Giảm giá')}: -{stats.discountPercentage}%
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};
