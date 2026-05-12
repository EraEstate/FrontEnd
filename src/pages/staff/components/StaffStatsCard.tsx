import React from 'react';
import { useAdminTheme } from '../../../contexts/AdminThemeContext';

// ─── Stats Card ───
const StaffStatsCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string;
  bgColor: string;
  loading?: boolean;
}> = ({ icon, title, value, color, bgColor, loading }) => {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`${bgColor} rounded-2xl p-5 border ${isDark ? 'border-transparent' : 'border-white/20'} hover:scale-[1.02] transition-transform duration-200`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2.5 rounded-xl shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white/80'}`}>
          <div className={`${isDark ? color.replace('text-', 'text-') : ''}`}>{icon}</div>
        </div>
      </div>
      <p className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{title}</p>
      {loading ? 
        <div className={`h-8 w-16 rounded animate-pulse ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`} /> 
      : 
        <p className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{value}</p>
      }
    </div>
  );
};

export default StaffStatsCard;
