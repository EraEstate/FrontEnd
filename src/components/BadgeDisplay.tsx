import { type ComponentType, useEffect, useState } from 'react';
import { Award, Building2, Loader2, ShieldCheck, Star, Users, Zap } from 'lucide-react';
import { badgeAPI, type UserBadge } from '../api/badge';

interface BadgeDisplayProps {
  userId: string;
  title?: string;
  compact?: boolean;
}

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  'shield-check': ShieldCheck,
  'building-2': Building2,
  star: Star,
  zap: Zap,
  handshake: Users,
};

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  userId,
  title = 'Huy hiệu đã đạt',
  compact = false,
}) => {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const loadBadges = async () => {
      try {
        setLoading(true);
        const data = await badgeAPI.getUserBadges(userId);
        setBadges(data);
      } catch {
        setBadges([]);
      } finally {
        setLoading(false);
      }
    };
    void loadBadges();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Đang tải huy hiệu…
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
        Chưa có huy hiệu nào.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!compact && (
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Award className="h-4 w-4 text-amber-500" />
          {title}
        </h3>
      )}
      <div className="flex flex-wrap gap-2">
        {badges.map((userBadge) => {
          const badge = userBadge.badge;
          const Icon = iconMap[(badge?.iconUrl || '').toLowerCase()] || Award;
          return (
            <div
              key={userBadge.id}
              className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800"
              title={`${badge?.description || badge?.name || 'Badge'} • ${new Date(userBadge.earnedAt).toLocaleDateString('vi-VN')}`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{badge?.name || 'Badge'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgeDisplay;
