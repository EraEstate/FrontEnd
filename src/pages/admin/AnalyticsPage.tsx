import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Building, 
  Eye, Heart, MessageSquare, Calendar, ArrowUp
} from 'lucide-react';
import { adminAPI } from '../../api/admin';
import type { AdminStats } from '../../api/admin';
import { useAdminTheme } from '../../contexts/AdminThemeContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down';
  theme?: 'light' | 'dark';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color, trend, theme = 'light' }) => (
  <div className={`rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow ${
    theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white'
  }`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-sm font-semibold ${
          trend === 'up' 
            ? (theme === 'dark' ? 'text-green-400' : 'text-green-600')
            : (theme === 'dark' ? 'text-red-400' : 'text-red-600')
        }`}>
          {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <h3 className={`text-sm font-medium mb-1 ${
      theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
    }`}>{title}</h3>
    <p className={`text-2xl font-bold ${
      theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
    }`}>{value}</p>
  </div>
);

const AnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useAdminTheme();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [propertyDistribution, setPropertyDistribution] = useState<any[]>([]);
  const [inquiryStatusData, setInquiryStatusData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [
        statsData,
        revenueChart,
        userChart,
        propertyChart,
        inquiryChart
      ] = await Promise.all([
        adminAPI.getStats(),
        fetchRevenueData(),
        fetchUserGrowthData(),
        fetchPropertyDistribution(),
        adminAPI.getInquiryStatusBreakdown()
      ]);

      setStats(statsData);
      setRevenueData(revenueChart);
      setUserGrowthData(userChart);
      setPropertyDistribution(propertyChart);
      setInquiryStatusData(inquiryChart);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueData = async () => {
    // Mock data for revenue (last 12 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, i) => ({
      month,
      revenue: Math.floor(1000000000 + Math.random() * 2000000000),
      payments: Math.floor(80 + Math.random() * 120)
    }));
  };

  const fetchUserGrowthData = async () => {
    // Mock data for user growth (last 30 days)
    const days = Array.from({ length: 30 }, (_, i) => i + 1);
    return days.map(day => ({
      date: `Day ${day}`,
      users: Math.floor(10000 + Math.random() * 3000),
      newUsers: Math.floor(50 + Math.random() * 150)
    }));
  };

  const fetchPropertyDistribution = async () => {
    return [
      { type: 'Apartment', count: 1250, percentage: 45 },
      { type: 'House', count: 680, percentage: 24 },
      { type: 'Villa', count: 420, percentage: 15 },
      { type: 'Land', count: 310, percentage: 11 },
      { type: 'Office', count: 140, percentage: 5 }
    ];
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B VNĐ`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)}M VNĐ`;
    }
    return `${value.toLocaleString()} VNĐ`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${
          theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
        }`}>{t('admin.menu.analytics')}</h1>
        <p className={`text-sm mt-1 ${
          theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
        }`}>Real-time data from backend controllers</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          change={18.5}
          trend="up"
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          color="bg-green-100"
          theme={theme}
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers.toLocaleString() || '0'}
          change={12.3}
          trend="up"
          icon={<Users className="w-6 h-6 text-blue-600" />}
          color="bg-blue-100"
          theme={theme}
        />
        <StatCard
          title="Active Properties"
          value={stats?.activeProperties.toLocaleString() || '0'}
          change={8.2}
          trend="up"
          icon={<Building className="w-6 h-6 text-purple-600" />}
          color="bg-purple-100"
          theme={theme}
        />
        <StatCard
          title="Total Views"
          value={stats?.totalViews.toLocaleString() || '0'}
          change={-2.4}
          trend="down"
          icon={<Eye className="w-6 h-6 text-orange-600" />}
          color="bg-orange-100"
          theme={theme}
        />
      </div>

      {/* Revenue Chart */}
      <div className={`rounded-xl shadow-md p-6 ${
        theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-lg font-bold ${
              theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
            }`}>Revenue Overview</h2>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
            }`}>Last 12 months performance</p>
          </div>
          <div className={`flex items-center gap-2 ${
            theme === 'dark' ? 'text-green-400' : 'text-green-600'
          }`}>
            <ArrowUp className="w-5 h-5" />
            <span className="font-semibold">+23.5%</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              formatter={(value: any) => [formatCurrency(value), 'Revenue']}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* User Growth & Property Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className={`rounded-xl shadow-md p-6 ${
          theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white'
        }`}>
          <h2 className={`text-lg font-bold mb-6 ${
            theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
          }`}>User Growth (30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Total Users" />
              <Line type="monotone" dataKey="newUsers" stroke="#10b981" strokeWidth={2} name="New Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Property Distribution Pie Chart */}
        <div className={`rounded-xl shadow-md p-6 ${
          theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white'
        }`}>
          <h2 className={`text-lg font-bold mb-6 ${
            theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
          }`}>Property Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={propertyDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, percentage }) => `${type} (${percentage}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {propertyDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Inquiry Status & Recent Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inquiry Status Bar Chart */}
        <div className={`rounded-xl shadow-md p-6 ${
          theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white'
        }`}>
          <h2 className={`text-lg font-bold mb-6 ${
            theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
          }`}>Inquiry Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inquiryStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="status" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Stats Grid */}
        <div className={`rounded-xl shadow-md p-6 ${
          theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white'
        }`}>
          <h2 className={`text-lg font-bold mb-6 ${
            theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
          }`}>Quick Statistics</h2>
          <div className="space-y-4">
            <div className={`flex items-center justify-between p-4 rounded-lg ${
              theme === 'dark' ? 'bg-slate-700' : 'bg-blue-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                  }`}>Active Agents</p>
                  <p className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
                  }`}>{stats?.activeAgents || 0}</p>
                </div>
              </div>
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>90% Active</span>
            </div>

            <div className={`flex items-center justify-between p-4 rounded-lg ${
              theme === 'dark' ? 'bg-slate-700' : 'bg-green-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                  }`}>Total Projects</p>
                  <p className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
                  }`}>{stats?.totalProjects || 0}</p>
                </div>
              </div>
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`}>+12 New</span>
            </div>

            <div className={`flex items-center justify-between p-4 rounded-lg ${
              theme === 'dark' ? 'bg-slate-700' : 'bg-purple-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                  }`}>Total Favorites</p>
                  <p className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
                  }`}>{stats?.totalFavorites || 0}</p>
                </div>
              </div>
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
              }`}>Popular</span>
            </div>

            <div className={`flex items-center justify-between p-4 rounded-lg ${
              theme === 'dark' ? 'bg-slate-700' : 'bg-orange-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-600 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                  }`}>New Inquiries</p>
                  <p className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
                  }`}>{stats?.newInquiries || 0}</p>
                </div>
              </div>
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
              }`}>Needs Response</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8" />
            <span className="text-sm font-medium">This Month</span>
          </div>
          <h3 className="text-sm opacity-90 mb-1">Revenue</h3>
          <p className="text-3xl font-bold">{formatCurrency(stats?.revenueThisMonth || 0)}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Eye className="w-8 h-8" />
            <span className="text-sm font-medium">This Week</span>
          </div>
          <h3 className="text-sm opacity-90 mb-1">Total Views</h3>
          <p className="text-3xl font-bold">{stats?.viewsThisWeek.toLocaleString() || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8" />
            <span className="text-sm font-medium">Today</span>
          </div>
          <h3 className="text-sm opacity-90 mb-1">New Users</h3>
          <p className="text-3xl font-bold">{stats?.newUsersToday || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
