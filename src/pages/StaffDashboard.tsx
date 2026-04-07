import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { staffDashboardAPI } from '../api/staffDashboard';
import toast from '../utils/toast';

import type { StaffView, StaffStats } from './staff/types';
import StaffSidebar, { buildMenuSections } from './staff/components/StaffSidebar';
import StaffContentRouter from './staff/StaffContentRouter';

const StaffDashboard: React.FC = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<StaffView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await staffDashboardAPI.getStats();
      setStats(data);
    } catch {
      toast.error('Không thể tải thống kê');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Refresh stats khi quay lại dashboard + auto-refresh 60s
  useEffect(() => {
    if (currentView === 'dashboard') {
      fetchStats();
      const interval = setInterval(fetchStats, 60000);
      return () => clearInterval(interval);
    }
  }, [currentView, fetchStats]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleMenuClick = (view: StaffView) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  const menuSections = buildMenuSections(stats);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <StaffSidebar
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
        <div className="p-4 md:p-6 max-w-6xl pt-14 md:pt-6">
          <StaffContentRouter
            currentView={currentView}
            stats={stats}
            statsLoading={statsLoading}
            onNavigate={handleMenuClick}
          />
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;
