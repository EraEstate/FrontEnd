import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

import { useTranslation } from 'react-i18next';

import type { UserView } from './types';
import UserSidebar, { buildUserMenuSections } from './UserSidebar';
import UserContentRouter from './UserContentRouter';

const UserDashboardLayout: React.FC = () => {
  const { t } = useTranslation();
  const logout = useAuthStore(state => state.logout);
  const [currentView, setCurrentView] = useState<UserView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleMenuClick = (view: UserView) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  const menuSections = buildUserMenuSections(t);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <UserSidebar
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
          <UserContentRouter currentView={currentView} />
        </div>
      </main>
    </div>
  );
};

export default UserDashboardLayout;
