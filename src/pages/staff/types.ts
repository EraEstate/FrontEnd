// ─── Staff Dashboard shared types ───

export type StaffView =
  | 'dashboard' | 'property-moderation' | 'inquiry-management'
  | 'user-management' | 'kyc-management'
  | 'news-management' | 'project-management'
  | 'notifications' | 'profile';

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
