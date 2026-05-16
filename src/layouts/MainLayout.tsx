import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import Footer from '../components/Footer';
import AccountDisabledBanner from '../components/AccountDisabledBanner';
import FloatingActionHub from '../components/FloatingActionHub';
import ScrollToTop from '../components/ScrollToTop';
import TopProgressBar from '../components/TopProgressBar';
import CompareFloatingBar from '../components/CompareFloatingBar';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <TopProgressBar />
      <Header />
      <AccountDisabledBanner />

      <main className="flex-1 w-full pt-16">
        <Outlet />
      </main>

      <Footer />
      <FloatingActionHub />
      <ScrollToTop />
      <CompareFloatingBar />
    </div>
  );
};

export default MainLayout;