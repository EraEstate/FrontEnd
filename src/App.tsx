import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Header } from './components/Header';
import Footer from './components/Footer';
import AccountDisabledBanner from './components/AccountDisabledBanner';
import { useAuthStore } from './store/authStore';
import HomePage from './components/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import NewsPage from './pages/NewsPage';
import AgentsPage from './pages/AgentsPage';
import AgenciesPage from './pages/AgenciesPage';
import AgencyDetailPage from './pages/AgencyDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import PostPropertyPage from './pages/PostPropertyPage';
import EditPropertyPage from './pages/EditPropertyPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import FavoritesPage from './pages/FavoritesPage';
import MyPropertiesPage from './pages/MyPropertiesPage';
// import SettingsPage from './pages/SettingsPage'; // TODO: Create this page
import NewsDetailPage from './pages/NewsDetailPage';
import AgentDetailPage from './pages/AgentDetailPage';
import RentPage from './pages/RentPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import MarketAnalysisListPage from './pages/MarketAnalysisListPage';
import MarketAnalysisDetailPage from './pages/MarketAnalysisDetailPage';
import WikiPage from './pages/WikiPage';
import UtilitiesPage from './pages/UtilitiesPage';
import NotificationCenter from './pages/NotificationCenter';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import InquiryPage from './pages/InquiryPage';
import DashboardPage from './pages/DashboardPage';
import PricingPage from './pages/PricingPage';
import WikiDetailPage from './pages/WikiDetailPage';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PublicProfilePage from './pages/PublicProfilePage';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isStaffRoute = location.pathname.startsWith('/staff');
  const isDashboardRoute = isAdminRoute || isStaffRoute;

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Conditionally render Header - hide on dashboard pages */}
      {!isDashboardRoute && <Header />}
      
      {/* Account Disabled Banner - hiển thị khi tài khoản chưa kích hoạt */}
      {!isDashboardRoute && <AccountDisabledBanner />}
      
      <main className={`flex-1 w-full ${!isDashboardRoute ? 'pt-16' : ''}`}>
        <Routes>
          {/* Admin Routes - Protected and fullscreen */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Staff Routes - Protected and fullscreen */}
          <Route path="/staff" element={
            <ProtectedRoute requireRole="STAFF">
              <StaffDashboard />
            </ProtectedRoute>
          } />

          {/* Main Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/rent" element={<RentPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/:id" element={<CompanyDetailPage />} />
          <Route path="/market-analysis" element={<MarketAnalysisListPage />} />
          <Route path="/market-analysis/:slug" element={<MarketAnalysisDetailPage />} />
          <Route path="/wiki" element={<WikiPage />} />
          <Route path="/wiki/:category" element={<WikiPage />} />
          <Route path="/wiki/article/:slug" element={<WikiDetailPage />} />
          <Route path="/utilities" element={<UtilitiesPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/agents/:id" element={<AgentDetailPage />} />
          <Route path="/users/:id" element={<PublicProfilePage />} />
          <Route path="/agencies" element={<AgenciesPage />} />
          <Route path="/agencies/:id" element={<AgencyDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
          <Route path="/post-property" element={<ProtectedRoute><PostPropertyPage /></ProtectedRoute>} />
          <Route path="/my-properties" element={<ProtectedRoute><MyPropertiesPage /></ProtectedRoute>} />
          <Route path="/edit-property/:id" element={<ProtectedRoute><EditPropertyPage /></ProtectedRoute>} />
          {/* <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} /> */}
          <Route path="/notifications" element={<ProtectedRoute><NotificationCenter /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><PaymentHistoryPage /></ProtectedRoute>} />
          <Route path="/inquiries" element={<ProtectedRoute><InquiryPage /></ProtectedRoute>} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      
      {/* Conditionally render Footer - hide on dashboard pages */}
      {!isDashboardRoute && <Footer />}
      
      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth state when app starts
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
