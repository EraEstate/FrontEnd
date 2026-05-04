import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import PageSkeleton from './components/PageSkeleton';
import ErrorBoundary from './components/ErrorBoundary';
import { Header } from './components/Header';
import Footer from './components/Footer';
import AccountDisabledBanner from './components/AccountDisabledBanner';
import FloatingActionHub from './components/FloatingActionHub';
import ScrollToTop from './components/ScrollToTop';
import TopProgressBar from './components/TopProgressBar';
import { useAuthStore } from './store/authStore';
const HomePage = lazy(() => import('./components/HomePage'));
const PropertiesPage = lazy(() => import('./pages/PropertiesPage'));
const PropertyDetailPage = lazy(() => import('./pages/PropertyDetailPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const AgentsPage = lazy(() => import('./pages/AgentsPage'));
const AgenciesPage = lazy(() => import('./pages/AgenciesPage'));
const AgencyDetailPage = lazy(() => import('./pages/AgencyDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PostPropertyPage = lazy(() => import('./pages/PostPropertyPage'));
const EditPropertyPage = lazy(() => import('./pages/EditPropertyPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const MyPropertiesPage = lazy(() => import('./pages/MyPropertiesPage'));
const NewsDetailPage = lazy(() => import('./pages/NewsDetailPage'));
const AgentDetailPage = lazy(() => import('./pages/AgentDetailPage'));
const RentPage = lazy(() => import('./pages/RentPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const CompaniesPage = lazy(() => import('./pages/CompaniesPage'));
const CompanyDetailPage = lazy(() => import('./pages/CompanyDetailPage'));
const MarketAnalysisListPage = lazy(() => import('./pages/MarketAnalysisListPage'));
const MarketAnalysisDetailPage = lazy(() => import('./pages/MarketAnalysisDetailPage'));
const WikiPage = lazy(() => import('./pages/WikiPage'));
const UtilitiesPage = lazy(() => import('./pages/UtilitiesPage'));
const NotificationCenter = lazy(() => import('./pages/NotificationCenter'));
const PaymentHistoryPage = lazy(() => import('./pages/PaymentHistoryPage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const PaymentFailedPage = lazy(() => import('./pages/PaymentFailedPage'));
const InquiryPage = lazy(() => import('./pages/InquiryPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const WikiDetailPage = lazy(() => import('./pages/WikiDetailPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const StaffDashboard = lazy(() => import('./pages/StaffDashboard'));
import ProtectedRoute from './components/ProtectedRoute';
const RentalManagementPage = lazy(() => import('./pages/RentalManagementPage'));
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage'));
const TransactionContractPage = lazy(() => import('./pages/TransactionContractPage'));
const TransactionOverviewPage = lazy(() => import('./pages/TransactionOverviewPage'));
const TransactionContractReviewPage = lazy(() => import('./pages/TransactionContractReviewPage'));
const MyTransactionsPage = lazy(() => import('./pages/MyTransactionsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const WalletGuidePage = lazy(() => import('./pages/WalletGuidePage'));
const LegalCenterPage = lazy(() => import('./pages/LegalCenterPage'));
const SecurityCenterPage = lazy(() => import('./pages/SecurityCenterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const NotificationSettingsPage = lazy(() => import('./pages/NotificationSettingsPage'));
const PropertyComparisonPage = lazy(() => import('./pages/PropertyComparisonPage'));
const MapSearchPage = lazy(() => import('./pages/MapSearchPage'));
import CompareFloatingBar from './components/CompareFloatingBar';
const EscrowDashboard = lazy(() => import('./pages/EscrowDashboard'));
const KycVerificationPage = lazy(() => import('./pages/KycVerificationPage'));
const LandlordAnalyticsPage = lazy(() => import('./pages/LandlordAnalyticsPage'));
const ValuationPage = lazy(() => import('./pages/ValuationPage'));
const MyViewingsPage = lazy(() => import('./pages/MyViewingsPage'));
const TransactionHistoryPage = lazy(() => import('./pages/TransactionHistoryPage'));
const BankAccountManagementPage = lazy(() => import('./pages/BankAccountManagementPage'));
const ActivityLogPage = lazy(() => import('./pages/ActivityLogPage'));
const TestimonialsPage = lazy(() => import('./pages/TestimonialsPage'));

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isStaffRoute = location.pathname.startsWith('/staff');
  const isDashboardRoute = isAdminRoute || isStaffRoute;

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Top Progress Bar — hiệu ứng loading khi chuyển trang */}
      <TopProgressBar />
      
      {/* Conditionally render Header - hide on dashboard pages */}
      {!isDashboardRoute && <Header />}
      
      {/* Account Disabled Banner - hiển thị khi tài khoản chưa kích hoạt */}
      {!isDashboardRoute && <AccountDisabledBanner />}
      
      <main className={`flex-1 w-full ${!isDashboardRoute ? 'pt-16' : ''}`}>
        <ErrorBoundary>
          <Suspense fallback={<PageSkeleton />}>
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
          <Route path="/compare" element={<PropertyComparisonPage />} />
          <Route path="/map-search" element={<MapSearchPage />} />
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
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
          <Route path="/post-property" element={<ProtectedRoute><PostPropertyPage /></ProtectedRoute>} />
          <Route path="/my-properties" element={<ProtectedRoute><MyPropertiesPage /></ProtectedRoute>} />
          <Route path="/edit-property/:id" element={<ProtectedRoute><EditPropertyPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationCenter /></ProtectedRoute>} />
          <Route path="/notifications/settings" element={<ProtectedRoute><NotificationSettingsPage /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><PaymentHistoryPage /></ProtectedRoute>} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/failed" element={<PaymentFailedPage />} />
          <Route path="/my-transactions" element={<ProtectedRoute><MyTransactionsPage /></ProtectedRoute>} />
          <Route path="/landlord-analytics" element={<ProtectedRoute><LandlordAnalyticsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/help/wallet" element={<WalletGuidePage />} />
          <Route path="/transactions/:id" element={<ProtectedRoute><TransactionOverviewPage /></ProtectedRoute>} />
          <Route path="/transactions/:id/contract" element={<ProtectedRoute><TransactionContractReviewPage /></ProtectedRoute>} />
          <Route path="/transactions/:id/blockchain" element={<ProtectedRoute><TransactionContractPage /></ProtectedRoute>} />
          <Route path="/escrow" element={<ProtectedRoute><EscrowDashboard /></ProtectedRoute>} />
          <Route path="/kyc-verify" element={<ProtectedRoute><KycVerificationPage /></ProtectedRoute>} />
          <Route path="/inquiries" element={<ProtectedRoute><InquiryPage /></ProtectedRoute>} />
          <Route path="/my-viewings" element={<ProtectedRoute><MyViewingsPage /></ProtectedRoute>} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/valuation" element={<ValuationPage />} />
          <Route path="/legal" element={<LegalCenterPage />} />
          <Route path="/security" element={<SecurityCenterPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/transaction-history" element={<ProtectedRoute><TransactionHistoryPage /></ProtectedRoute>} />
          <Route path="/bank-accounts" element={<ProtectedRoute><BankAccountManagementPage /></ProtectedRoute>} />
          <Route path="/activity-log" element={<ProtectedRoute><ActivityLogPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      
      {/* Conditionally render Footer - hide on dashboard pages */}
      {!isDashboardRoute && <Footer />}
      
      {/* Floating Action Hub (AI Chat & Owner Chat) */}
      {!isDashboardRoute && <FloatingActionHub />}
      
      {/* Scroll to Top Button */}
      {!isDashboardRoute && <ScrollToTop />}
      {/* Compare Floating Bar */}
      {!isDashboardRoute && <CompareFloatingBar />}

      {/* Toast Notifications */}
      <Toaster position="top-right" richColors />
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
