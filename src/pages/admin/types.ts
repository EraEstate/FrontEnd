// ─── Admin Dashboard shared types ───

export type AdminView =
  | 'overview' | 'analytics' | 'inquiries'
  // Kiểm duyệt (Admin override Staff)
  | 'moderation'
  // Quản lý (Admin full quyền)
  | 'users' | 'kyc'
  // Giám sát (read-heavy)
  | 'properties' | 'agents' | 'agencies' | 'projects'
  // Nội dung
  | 'news' | 'market-analysis' | 'wiki'
  // Tài chính
  | 'payments'
  // Hệ thống
  | 'notifications' | 'settings';


export interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  totalAgents: number;
  totalAgencies: number;
  totalProjects: number;
  totalRevenue: number;
  totalPayments: number;
  totalViews: number;
  totalFavorites: number;
  totalNews: number;
  totalAnalysis: number;
  activeProperties: number;
  activeAgents: number;
  activeAgencies: number;
  newInquiries: number;
  newUsersToday: number;
  revenueThisMonth: number;
  viewsThisWeek: number;
}

export interface AdminMenuSection {
  title: string;
  items: { id: AdminView; icon: React.ReactNode; label: string; badge?: number }[];
}
