import { useEffect, useMemo, useState } from 'react';
import { Award, Loader2 } from 'lucide-react';
import { badgeAPI, type Badge, type UserBadge } from '../api/badge';
import { useAuthStore } from '../store/authStore';

const BadgesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [allBadges, earnedBadges] = await Promise.all([
          badgeAPI.getAllBadges(),
          user?.id ? badgeAPI.getUserBadges(user.id) : Promise.resolve([] as UserBadge[]),
        ]);
        setBadges(allBadges);
        setUserBadges(earnedBadges);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user?.id]);

  const earnedMap = useMemo(() => {
    const map = new Map<string, UserBadge>();
    userBadges.forEach((item) => map.set(item.badgeId, item));
    return map;
  }, [userBadges]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 pt-20">
        <Loader2 className="h-7 w-7 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Award className="h-6 w-6 text-amber-500" />
            Hệ thống huy hiệu
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Tổng {badges.length} huy hiệu • Đã đạt {userBadges.length}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((badge) => {
            const earned = earnedMap.get(badge.id);
            return (
              <div
                key={badge.id}
                className={`rounded-2xl border p-5 shadow-sm ${
                  earned ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-white'
                }`}
              >
                <h3 className="text-base font-semibold text-gray-900">{badge.name}</h3>
                <p className="mt-1 text-sm text-gray-600">{badge.description}</p>
                {badge.criteria && (
                  <p className="mt-2 text-xs text-gray-500">Điều kiện: {badge.criteria}</p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">{badge.category}</span>
                  {earned ? (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      Đã đạt • {new Date(earned.earnedAt).toLocaleDateString('vi-VN')}
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                      Chưa đạt
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BadgesPage;

