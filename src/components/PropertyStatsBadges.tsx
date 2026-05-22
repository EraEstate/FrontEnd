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
      className="flex flex-wrap gap-3 my-4"
    >
      {/* Days On Market Badge */}
      <motion.div 
        variants={itemVariants}
        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 text-blue-700 dark:text-blue-400 rounded-xl text-xs font-semibold border border-blue-100/50 dark:border-blue-900/30 shadow-sm transition-all hover:scale-105"
      >
        <Calendar size={14} className="animate-pulse" />
        <span>
          {t('propertyHistory.daysOnMarket', 'Days Listed')}: {stats.daysOnMarket} {t('propertyHistory.days', 'days')}
        </span>
      </motion.div>

      {/* Price Change Count Badge */}
      <motion.div 
        variants={itemVariants}
        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/30 text-purple-700 dark:text-purple-400 rounded-xl text-xs font-semibold border border-purple-100/50 dark:border-purple-900/30 shadow-sm transition-all hover:scale-105"
      >
        <Clock size={14} />
        <span>
          {t('propertyHistory.priceChanges', 'Price Changes')}: {stats.priceChangeCount}
        </span>
      </motion.div>

      {/* Discount Badge (Only if discounted) */}
      {stats.isDiscounted && stats.discountPercentage > 0 && (
        <motion.div 
          variants={itemVariants}
          className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-semibold border border-emerald-100/50 dark:border-emerald-900/30 shadow-sm transition-all hover:scale-105"
        >
          <TrendingDown size={14} className="text-emerald-500" />
          <span>
            {t('propertyHistory.discount', 'Price Drop')}: -{stats.discountPercentage}%
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};
