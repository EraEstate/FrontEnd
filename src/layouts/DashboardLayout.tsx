import React from 'react';
import { Outlet } from 'react-router-dom';
import TopProgressBar from '../components/TopProgressBar';

const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <TopProgressBar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;