// ─── Staff Dashboard shared types ───

export type StaffView =
  | 'dashboard' | 'property-moderation' | 'inquiry-management'
  | 'properties' | 'post-property' | 'projects' | 'inquiries'
  | 'news' | 'wiki' | 'notifications' | 'payments' | 'profile'
  // Management views
  | 'user-management' | 'kyc-management' | 'property-management'
  | 'news-management' | 'project-management' | 'agency-management'
  | 'agent-management' | 'payment-management' | 'market-analysis';

export interface StaffStats {
  pendingCount: number;
  activeCount: number;
  rejectedCount: number;
  totalCount: number;
  recentPending: any[];
}

export interface MenuSection {
  title: string;
  items: { id: StaffView; icon: React.ReactNode; label: string; badge?: number }[];
}
