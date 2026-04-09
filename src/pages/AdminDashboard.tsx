import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { adminAPI } from '../api/admin';
import { propertyAPI } from '../api/property';
import api from '../api/index';
import { AdminThemeProvider, useAdminTheme } from '../contexts/AdminThemeContext';

import type { AdminView, AdminStats } from './admin/types';
import AdminSidebar, { buildAdminMenuSections } from './admin/components/AdminSidebar';
import AdminContentRouter from './admin/AdminContentRouter';

const AdminDashboardContent: React.FC = () => {
  const { theme, resetTheme } = useAdminTheme();
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);
  const [currentView, setCurrentView] = useState<AdminView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [pendingInquiries, setPendingInquiries] = useState(0);
  const [pendingModeration, setPendingModeration] = useState(0);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  // ── Fetch stats ──
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await adminAPI.getStats();
      setStats(data as unknown as AdminStats);
    } catch {
      // Fallback — keep null
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Fetch pending inquiries for badge ──
  const fetchInquiryBadge = useCallback(async () => {
    try {
      const breakdown = await adminAPI.getInquiryStatusBreakdown();
      const n = breakdown.find((s: any) => s.status === 'New')?.count || 0;
      const ip = breakdown.find((s: any) => s.status === 'In Progress')?.count || 0;
      setPendingInquiries(n + ip);
    } catch {
      setPendingInquiries(0);
    }
  }, []);

  // ── Fetch pending moderation for badge ──
  const fetchModerationBadge = useCallback(async () => {
    try {
      const response = await propertyAPI.getByStatus('PENDING', 0, 1);
      setPendingModeration(response?.totalElements || response?.content?.length || 0);
    } catch {
      setPendingModeration(0);
    }
  }, []);

  // ── Fetch recent activity ──
  const fetchActivities = useCallback(async () => {
    try {
      setActivitiesLoading(true);
      const response = await api.get('/properties', {
        params: { page: 0, size: 5, sortBy: 'createdAt', sortDir: 'desc' },
      });
      const properties = response.data?.content || response.data || [];
      setRecentActivities(
        properties.map((prop: any) => ({
          id: `property_${prop.id}`,
          type: 'PROPERTY_POSTED',
          timestamp: prop.createdAt,
          title: prop.title || 'Bất động sản',
          description: prop.owner?.fullName
            ? `${prop.owner.fullName} đã tạo tin đăng: ${prop.title || 'Bất động sản'}`
            : `Tin đăng mới: ${prop.title || 'Bất động sản'}`,
          propertyId: prop.id,
        }))
      );
    } catch {
      setRecentActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchInquiryBadge();
    fetchModerationBadge();
    fetchActivities();
  }, [fetchStats, fetchInquiryBadge, fetchModerationBadge, fetchActivities]);

  // Auto-refresh when back to overview
  useEffect(() => {
    if (currentView === 'overview') {
      fetchStats();
      const interval = setInterval(fetchStats, 60000);
      return () => clearInterval(interval);
    }
  }, [currentView, fetchStats]);

  const handleLogout = () => {
    resetTheme();
    logout();
    navigate('/login');
  };

  const handleMenuClick = (view: AdminView) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  const menuSections = buildAdminMenuSections(pendingInquiries, pendingModeration);

  return (
    <div className={`h-screen flex overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <AdminSidebar
        currentView={currentView}
        sidebarOpen={sidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        menuSections={menuSections}
        onMenuClick={handleMenuClick}
        onToggleSidebar={setSidebarOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onOpenMobile={() => setMobileMenuOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto h-full">
        <div className="p-4 md:p-6 max-w-7xl pt-14 md:pt-6">
          <AdminContentRouter
            currentView={currentView}
            stats={stats}
            statsLoading={statsLoading}
            recentActivities={recentActivities}
            activitiesLoading={activitiesLoading}
            onNavigate={handleMenuClick}
          />
        </div>
      </main>
    </div>
  );
};

// Wrap with ThemeProvider
const AdminDashboard: React.FC = () => (
  <AdminThemeProvider>
    <AdminDashboardContent />
  </AdminThemeProvider>
);

export default AdminDashboard;
