import React from 'react';
import { useAdminTheme } from '../../../contexts/AdminThemeContext';

interface StaffStatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string;
  bgColor: string;
  loading?: boolean;
}

const StaffStatsCard: React.FC<StaffStatsCardProps> = ({
  icon,
  title,
  value,
  color,
  bgColor,
  loading
}) => {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  // Extract color name (e.g. text-amber-600 -> amber)
  const colorName = color.split('-')[1] || 'red';

  // Map of colors for dynamic styling
  const colorMap: Record<string, { iconBg: string; text: string; glow: string }> = {
    amber: {
      iconBg: isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600',
      text: isDark ? 'text-amber-400' : 'text-amber-600',
      glow: 'group-hover:shadow-amber-500/10'
    },
    emerald: {
      iconBg: isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600',
      text: isDark ? 'text-emerald-400' : 'text-emerald-600',
      glow: 'group-hover:shadow-emerald-500/10'
    },
    red: {
      iconBg: isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600',
      text: isDark ? 'text-rose-400' : 'text-rose-600',
      glow: 'group-hover:shadow-rose-500/10'
    },
    blue: {
      iconBg: isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600',
      text: isDark ? 'text-blue-400' : 'text-blue-600',
      glow: 'group-hover:shadow-blue-500/10'
    }
  };

  const currentStyles = colorMap[colorName] || colorMap.red;

  return (
    <div className={`group relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 ${
      isDark 
        ? 'bg-slate-800/80 border-slate-700/80 backdrop-blur-md shadow-lg shadow-slate-950/20' 
        : 'bg-white border-gray-100 shadow-sm shadow-gray-100/50'
    } hover:-translate-y-1 hover:shadow-xl ${currentStyles.glow}`}>
      {/* Decorative gradient light reflection */}
      <div className={`absolute -right-10 -top-10 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${
        isDark ? 'bg-white/10' : 'bg-gray-100'
      }`} />

      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <p className={`text-xs font-bold uppercase tracking-wider ${
            isDark ? 'text-slate-400' : 'text-gray-500'
          }`}>{title}</p>
          
          {loading ? (
            <div className={`h-9 w-20 rounded-lg animate-pulse ${
              isDark ? 'bg-slate-700' : 'bg-gray-200'
            }`} />
          ) : (
            <p className={`text-3xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{value}</p>
          )}
        </div>

        <div className={`p-3 rounded-2xl transition-all duration-300 group-hover:scale-110 shadow-sm ${
          currentStyles.iconBg
        }`}>
          {icon}
        </div>
      </div>

      {/* Modern bottom animated accent bar */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 w-0 group-hover:w-full ${
        colorName === 'amber' ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
        colorName === 'emerald' ? 'bg-gradient-to-r from-emerald-400 to-green-500' :
        colorName === 'red' ? 'bg-gradient-to-r from-rose-400 to-red-500' :
        'bg-gradient-to-r from-blue-400 to-indigo-500'
      }`} />
    </div>
  );
};

export default StaffStatsCard;
