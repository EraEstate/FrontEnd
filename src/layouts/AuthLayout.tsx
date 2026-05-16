import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import TopProgressBar from '../components/TopProgressBar';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-gray-50">
      <TopProgressBar />
      <div className="w-full px-4 pt-6 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-gray-700 transition-colors hover:text-red-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Về trang chủ
        </Link>
      </div>
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
