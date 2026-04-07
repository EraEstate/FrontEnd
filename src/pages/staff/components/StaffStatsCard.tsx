import React from 'react';

// ─── Stats Card ───
const StaffStatsCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string;
  bgColor: string;
  loading?: boolean;
}> = ({ icon, title, value, color, bgColor, loading }) => (
  <div className={`${bgColor} rounded-2xl p-5 border border-white/20 hover:scale-[1.02] transition-transform duration-200`}>
    <div className="flex items-center gap-3 mb-3">
      <div className={`p-2.5 rounded-xl ${color} bg-white/80 shadow-sm`}>{icon}</div>
    </div>
    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
    {loading ? <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" /> : <p className="text-2xl font-bold text-gray-900">{value}</p>}
  </div>
);

export default StaffStatsCard;
