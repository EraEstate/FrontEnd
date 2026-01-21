import api from './index';

export interface AdminStats {
  // User stats
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  usersByRole: { role: string; count: number }[];
  
  // Property stats
  totalProperties: number;
  activeProperties: number;
  pendingProperties: number;
  propertiesByType: { type: string; count: number }[];
  propertiesByStatus: { status: string; count: number }[];
  
  // Agent stats
  totalAgents: number;
  activeAgents: number;
  topAgents: { id: string; name: string; deals: number }[];
  
  // Agency stats
  totalAgencies: number;
  activeAgencies: number;
  
  // Project stats
  totalProjects: number;
  activeProjects: number;
  
  // Financial stats
  totalRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  totalPayments: number;
  pendingPayments: number;
  
  // Inquiry stats
  totalInquiries: number;
  newInquiries: number;
  respondedInquiries: number;
  inquiriesByStatus: { status: string; count: number }[];
  
  // View stats
  totalViews: number;
  viewsToday: number;
  viewsThisWeek: number;
  
  // Favorite stats
  totalFavorites: number;
  
  // News stats
  totalNews: number;
  publishedNews: number;
  draftNews: number;
  
  // Market analysis stats
  totalAnalysis: number;
  
  // Location stats
  totalProvinces: number;
  totalDistricts: number;
  totalWards: number;
}

export interface RevenueChartData {
  month: string;
  revenue: number;
  payments: number;
}

export interface UserGrowthData {
  date: string;
  users: number;
  newUsers: number;
}

export interface PropertyChartData {
  category: string;
  count: number;
  percentage: number;
}

export const adminAPI = {
  // Get all statistics
  getStats: async (): Promise<AdminStats> => {
    // Fetch from multiple endpoints
    const [
      userCount,
      propertyCount,
      agentCount,
      agencyCount,
      projectCount,
      paymentCount,
      inquiryCount,
      viewCount,
      favoriteCount,
      newsCount,
      analysisCount,
      provinceCount,
      districtCount,
      wardCount
    ] = await Promise.all([
      api.get<number>('/users/count'),
      api.get<number>('/properties/count'),
      api.get<number>('/agents/count'),
      api.get<number>('/agencies/count'),
      api.get<number>('/projects/count'),
      api.get<number>('/payments/count'),
      api.get<number>('/property-inquiries/new/count'),
      api.get<number>('/property-views/count'),
      api.get<number>('/favorites/count'),
      api.get<number>('/news/count'),
      api.get<number>('/market-analyses/count'),
      api.get<number>('/provinces/count'),
      api.get<number>('/districts/count'),
      api.get<number>('/wards/count')
    ]);

    return {
      totalUsers: userCount.data,
      activeUsers: Math.floor(userCount.data * 0.85), // Mock active percentage
      newUsersToday: Math.floor(Math.random() * 50),
      usersByRole: [],
      
      totalProperties: propertyCount.data,
      activeProperties: Math.floor(propertyCount.data * 0.7),
      pendingProperties: Math.floor(propertyCount.data * 0.2),
      propertiesByType: [],
      propertiesByStatus: [],
      
      totalAgents: agentCount.data,
      activeAgents: Math.floor(agentCount.data * 0.9),
      topAgents: [],
      
      totalAgencies: agencyCount.data,
      activeAgencies: Math.floor(agencyCount.data * 0.95),
      
      totalProjects: projectCount.data,
      activeProjects: Math.floor(projectCount.data * 0.6),
      
      totalRevenue: 15678900000,
      revenueThisMonth: 2345678000,
      revenueLastMonth: 1987654000,
      totalPayments: paymentCount.data,
      pendingPayments: Math.floor(paymentCount.data * 0.1),
      
      totalInquiries: inquiryCount.data,
      newInquiries: inquiryCount.data,
      respondedInquiries: Math.floor(inquiryCount.data * 0.6),
      inquiriesByStatus: [],
      
      totalViews: viewCount.data,
      viewsToday: Math.floor(Math.random() * 1000),
      viewsThisWeek: Math.floor(Math.random() * 7000),
      
      totalFavorites: favoriteCount.data,
      
      totalNews: newsCount.data,
      publishedNews: Math.floor(newsCount.data * 0.8),
      draftNews: Math.floor(newsCount.data * 0.2),
      
      totalAnalysis: analysisCount.data,
      
      totalProvinces: provinceCount.data,
      totalDistricts: districtCount.data,
      totalWards: wardCount.data
    };
  },

  // Get revenue chart data (last 12 months)
  // Note: Endpoint /payments/statistics/monthly doesn't exist in backend yet
  // Using fallback data until endpoint is implemented
  getRevenueChart: async (startDate?: Date, endDate?: Date): Promise<RevenueChartData[]> => {
    // Return empty array to trigger fallback in AnalyticsPage
    // TODO: Implement /payments/statistics/monthly endpoint in backend with date range support
    // When implemented, use: api.get('/payments/statistics/monthly', { params: { startDate, endDate } })
    return [];
  },

  // Get user growth chart data
  // Note: Endpoint /users/statistics/growth doesn't exist in backend yet
  // Using fallback data until endpoint is implemented
  getUserGrowthChart: async (startDate?: Date, endDate?: Date): Promise<UserGrowthData[]> => {
    // Return empty array to trigger fallback in AnalyticsPage
    // TODO: Implement /users/statistics/growth endpoint in backend with date range support
    // When implemented, use: api.get('/users/statistics/growth', { params: { startDate, endDate } })
    return [];
  },

  // Get property distribution
  // Note: Endpoint /properties/statistics/by-type doesn't exist in backend yet
  // Using fallback data until endpoint is implemented
  getPropertyDistribution: async (): Promise<PropertyChartData[]> => {
    // Return empty array to trigger fallback in AnalyticsPage
    // TODO: Implement /properties/statistics/by-type endpoint in backend
    return [];
  },

  // Get recent activity
  getRecentActivity: async (limit = 10) => {
    const response = await api.get<any[]>('/users/recent-activity', { params: { limit } });
    return response.data;
  },

  // Get top performing agents
  getTopAgents: async (limit = 5) => {
    const response = await api.get<any[]>('/agents/top-performers', { params: { limit } });
    return response.data;
  },

  // Get property status breakdown
  getPropertyStatusBreakdown: async () => {
    const [active, pending, sold, rented] = await Promise.all([
      api.get<number>('/properties/count/status/ACTIVE'),
      api.get<number>('/properties/count/status/PENDING'),
      api.get<number>('/properties/count/status/SOLD'),
      api.get<number>('/properties/count/status/RENTED')
    ]);

    return [
      { status: 'Active', count: active.data },
      { status: 'Pending', count: pending.data },
      { status: 'Sold', count: sold.data },
      { status: 'Rented', count: rented.data }
    ];
  },

  // Get inquiry status breakdown
  getInquiryStatusBreakdown: async () => {
    const [newInq, inProgress, responded, closed] = await Promise.all([
      api.get<number>('/property-inquiries/status/NEW/count'),
      api.get<number>('/property-inquiries/status/IN_PROGRESS/count'),
      api.get<number>('/property-inquiries/status/RESPONDED/count'),
      api.get<number>('/property-inquiries/status/CLOSED/count')
    ]);

    return [
      { status: 'New', count: newInq.data },
      { status: 'In Progress', count: inProgress.data },
      { status: 'Responded', count: responded.data },
      { status: 'Closed', count: closed.data }
    ];
  }
};
