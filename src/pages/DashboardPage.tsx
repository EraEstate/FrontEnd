import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PersonalizedRecommendations from '../components/PersonalizedRecommendations';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  CalendarDays,
  Eye,
  Heart,
  MessageSquare,
  DollarSign,
  MapPin,
  TrendingUp,
  Home,
  FileText,
  CreditCard,
  Activity,
  ChevronRight,
  Wallet
} from 'lucide-react';
import { revenueAPI } from '../api/revenue';
import { propertyAPI } from '../api/property';
import { propertyFavoriteAPI } from '../api/propertyFavorite';
import { activityAPI } from '../api/activity';
import type { ActivityResponse } from '../api/activity';

interface DashboardPageProps {
  /** When true, renders without extra page wrapper (used inside UserDashboardLayout) */
  embedded?: boolean;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ embedded = false }) => {
  const { t } = useTranslation();
  const [revenueTotal, setRevenueTotal] = useState<number>(0);
  const [revenueLoading, setRevenueLoading] = useState<boolean>(true);

  // Real data states
  const [totalProperties, setTotalProperties] = useState(0);
  const [activeProperties, setActiveProperties] = useState(0);
  const [totalFavorites, setTotalFavorites] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [totalInquiries, setTotalInquiries] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<ActivityResponse[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [topProperties, setTopProperties] = useState<any[]>([]);
  const [topLoading, setTopLoading] = useState(true);

  // Fetch real stats
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const [myPropsRes, favsRes] = await Promise.all([
        propertyAPI.getMyProperties(0, 100).catch(() => null),
        propertyFavoriteAPI.getMyFavorites(0, 1).catch(() => null),
      ]);

      const props = myPropsRes?.content || [];
      setTotalProperties(props.length);
      setActiveProperties(props.filter((p: any) => p.status === 'ACTIVE' || p.status === 'AVAILABLE').length);

      // Sum views & inquiries from properties
      const views = props.reduce((sum: number, p: any) => sum + (p.views || 0), 0);
      setTotalViews(views);

      setTotalFavorites((favsRes as any)?.totalElements ?? 0);
      setTotalInquiries(0); // will be populated from activity count
    } catch {
      // Keep defaults
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch recent activities
  const fetchActivities = useCallback(async () => {
    try {
      setActivitiesLoading(true);
      const data = await activityAPI.getUserActivities(0, 6);
      setRecentActivities(data.content || []);
    } catch {
      setRecentActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  // Fetch top properties
  const fetchTopProperties = useCallback(async () => {
    try {
      setTopLoading(true);
      const res = await propertyAPI.getMyProperties(0, 5);
      const props = (res?.content || [])
        .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
        .slice(0, 3);
      setTopProperties(props);
    } catch {
      setTopProperties([]);
    } finally {
      setTopLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadRevenue = async () => {
      try {
        const summary = await revenueAPI.getSummary();
        if (mounted) {
          setRevenueTotal(Number(summary.totalRevenue || 0));
        }
      } catch {
        // keep fallback
      } finally {
        if (mounted) {
          setRevenueLoading(false);
        }
      }
    };
    void loadRevenue();
    fetchStats();
    fetchActivities();
    fetchTopProperties();
    return () => {
      mounted = false;
    };
  }, [fetchStats, fetchActivities, fetchTopProperties]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'PROPERTY_VIEWED': return { icon: Eye, color: 'text-green-600', bg: 'bg-green-100' };
      case 'PROPERTY_FAVORITED': return { icon: Heart, color: 'text-red-600', bg: 'bg-red-100' };
      case 'PROPERTY_INQUIRY': return { icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-100' };
      case 'PROPERTY_POSTED': return { icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'PROPERTY_UPDATED': return { icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100' };
      default: return { icon: Activity, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)} ${t('common.billion')}`;
    if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)} ${t('common.million')}`;
    return price.toLocaleString();
  };

  const relativeTime = (ts: string) => {
    if (!ts) return '';
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('time.justNow', { defaultValue: 'Vừa xong' });
    if (mins < 60) return t('time.minutesAgo', { count: mins, defaultValue: `${mins} phút trước` });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t('time.hoursAgo', { count: hours, defaultValue: `${hours} giờ trước` });
    const days = Math.floor(hours / 24);
    if (days < 7) return t('time.daysAgo', { count: days, defaultValue: `${days} ngày trước` });
    return new Date(ts).toLocaleDateString();
  };

  const content = (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-6 mb-8 text-white shadow-lg">
        <div className="flex items-center gap-x-3 mb-2">
          <BarChart3 className="h-8 w-8 opacity-90" />
          <h1 className="text-2xl font-semibold">{t('dashboard.title')}</h1>
        </div>
        <p className="opacity-80 text-sm">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('dashboard.stats.totalProperties')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {statsLoading ? <span className="inline-block w-8 h-6 bg-gray-200 rounded animate-pulse" /> : totalProperties}
              </p>
              <p className="text-xs text-emerald-600 mt-1 font-medium">{activeProperties} {t('dashboard.stats.active')}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('dashboard.stats.views')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {statsLoading ? <span className="inline-block w-8 h-6 bg-gray-200 rounded animate-pulse" /> : totalViews.toLocaleString()}
              </p>
              <p className="text-xs text-emerald-600 mt-1 font-medium">{t('dashboard.stats.allProperties')}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-50">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('dashboard.stats.favorites')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {statsLoading ? <span className="inline-block w-8 h-6 bg-gray-200 rounded animate-pulse" /> : totalFavorites}
              </p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{t('dashboard.stats.savedProperties')}</p>
            </div>
            <div className="p-3 rounded-xl bg-red-50">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('dashboard.stats.inquiries')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {statsLoading ? <span className="inline-block w-8 h-6 bg-gray-200 rounded animate-pulse" /> : totalInquiries}
              </p>
              <Link to="/inquiries" className="text-xs text-red-600 hover:text-red-700 font-medium mt-1 inline-block">
                {t('dashboard.stats.viewDetails')}
              </Link>
            </div>
            <div className="p-3 rounded-xl bg-purple-50">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('dashboard.stats.revenue')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {revenueLoading ? <span className="inline-block w-12 h-6 bg-gray-200 rounded animate-pulse" /> : `${formatPrice(revenueTotal)}`}
              </p>
              <Link to="/revenue" className="text-xs text-red-600 hover:text-red-700 font-medium mt-1 inline-block">
                {t('dashboard.stats.revenueDashboard')}
              </Link>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">{t('dashboard.recentActivities.title')}</h2>
              <Link to="/activity-log" className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
                {t('dashboard.recentActivities.viewAll')} <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {activitiesLoading ? (
              <div className="p-5 space-y-4">
                {[1, 2, 3].map(slot => (
                  <div key={`activity-skeleton-${slot}`} className="flex items-start gap-x-4 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="p-8 text-center">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">{t('dashboard.recentActivities.empty')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentActivities.map((activity, index) => {
                  const { icon: IconComp, color, bg } = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id || index} className="p-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start gap-x-3">
                        <div className={`p-2 rounded-xl ${bg} flex-shrink-0`}>
                          <IconComp className={`h-4 w-4 ${color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{activity.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{relativeTime(activity.timestamp)}</p>
                        </div>
                        {activity.propertyId && (
                          <Link to={`/properties/${activity.propertyId}`}
                            className="text-xs text-red-600 hover:text-red-700 font-medium whitespace-nowrap">
                            {t('dashboard.recentActivities.view')}
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Top Properties */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">{t('dashboard.topProperties.title')}</h2>
            </div>

            {topLoading ? (
              <div className="p-5 space-y-4">
                {[1, 2, 3].map(slot => (
                  <div key={`top-property-skeleton-${slot}`} className="flex gap-3 animate-pulse">
                    <div className="w-14 h-14 rounded-lg bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : topProperties.length === 0 ? (
              <div className="p-8 text-center">
                <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">{t('dashboard.topProperties.empty')}</p>
                <Link to="/post-property" className="text-sm text-red-600 hover:text-red-700 font-medium mt-2 inline-block">
                  {t('dashboard.topProperties.postNow')}
                </Link>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {topProperties.map((property) => (
                  <Link key={property.id} to={`/properties/${property.id}`}
                    className="flex items-start gap-x-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                      {property.mainImageUrl ? (
                        <img src={property.mainImageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {property.title}
                      </h4>
                      <div className="flex items-center gap-x-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center text-red-600 font-semibold">
                          {formatPrice(property.price)} VND
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Eye className="h-3 w-3" />
                          {property.views || 0}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">{t('dashboard.quickActions.title')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { href: '/post-property', icon: MapPin, label: t('dashboard.quickActions.postProperty'), color: 'from-red-500 to-red-600' },
            { href: '/my-properties', icon: Home, label: t('dashboard.quickActions.manageProperties'), color: 'from-blue-500 to-blue-600' },
            { href: '/inquiries', icon: MessageSquare, label: t('dashboard.quickActions.inquiries'), color: 'from-purple-500 to-purple-600' },
            { href: '/payments', icon: CreditCard, label: t('dashboard.quickActions.payments'), color: 'from-green-500 to-green-600' },
            { href: '/calendar', icon: CalendarDays, label: t('dashboard.quickActions.calendar'), color: 'from-indigo-500 to-indigo-600' },
            { href: '/revenue', icon: TrendingUp, label: t('dashboard.quickActions.revenue'), color: 'from-emerald-500 to-emerald-600' },
          ].map(item => (
            <Link key={item.href} to={item.href}
              className={`bg-gradient-to-br ${item.color} text-white rounded-2xl p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-center`}>
              <item.icon className="h-7 w-7 mx-auto mb-2 opacity-90" />
              <span className="text-xs font-semibold">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div className="mt-8">
        <PersonalizedRecommendations />
      </div>
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-10">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {content}
      </div>
    </div>
  );
};

export default DashboardPage;
