import React from 'react';

const AdminStatsCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'up' | 'down';
  color: string;
  theme?: 'light' | 'dark';
}> = ({ icon, title, value, change, changeType, color, theme = 'light' }) => (
  <div className={`rounded-2xl p-5 hover:shadow-lg transition-all duration-200 ${
    theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white shadow-sm border border-gray-100'
  }`}>
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2.5 rounded-xl ${color}`}>
        {icon}
      </div>
      {change && (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          changeType === 'up'
            ? (theme === 'dark' ? 'text-green-400 bg-green-900/30' : 'text-green-700 bg-green-50')
            : (theme === 'dark' ? 'text-red-400 bg-red-900/30' : 'text-red-700 bg-red-50')
        }`}>
          {change}
        </span>
      )}
    </div>
    <p className={`text-sm font-medium mb-1 ${
      theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
    }`}>{title}</p>
    <p className={`text-2xl font-bold ${
      theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
    }`}>{value}</p>
  </div>
);

export default AdminStatsCard;
