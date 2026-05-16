// ─── User Dashboard shared types ───

export type UserView =
  | 'overview' | 'my-properties' | 'favorites'
  | 'inquiries' | 'viewings' | 'rental-management'
  | 'contracts' | 'payments' | 'analytics'
  | 'transaction-history' | 'bank-accounts'
  | 'calendar' | 'activity-log'
  | 'settings';

export interface UserMenuSection {
  title: string;
  items: { id: UserView; icon: React.ReactNode; label: string; badge?: number }[];
}
