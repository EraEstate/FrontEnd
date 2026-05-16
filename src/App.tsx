import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { Toaster } from 'sonner';
import PageSkeleton from './components/PageSkeleton';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import { useAuthStore } from './store/authStore';
import NotFoundPage from './pages/NotFoundPage';

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
const RentalContractsPage = lazy(() => import('./pages/RentalContractsPage'));
const RentalContractDetailPage = lazy(() => import('./pages/RentalContractDetailPage'));
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
const EscrowDashboard = lazy(() => import('./pages/EscrowDashboard'));
const KycVerificationPage = lazy(() => import('./pages/KycVerificationPage'));
const LandlordAnalyticsPage = lazy(() => import('./pages/LandlordAnalyticsPage'));
const ValuationPage = lazy(() => import('./pages/ValuationPage'));
const InvestmentCalculatorPage = lazy(() => import('./pages/InvestmentCalculatorPage'));
const PriceAlertsPage = lazy(() => import('./pages/PriceAlertsPage'));
const RevenueDashboardPage = lazy(() => import('./pages/RevenueDashboardPage'));
const MaintenanceRequestsPage = lazy(() => import('./pages/MaintenanceRequestsPage'));
const CreateMaintenanceRequestPage = lazy(() => import('./pages/CreateMaintenanceRequestPage'));
const BadgesPage = lazy(() => import('./pages/BadgesPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const ForumPage = lazy(() => import('./pages/ForumPage'));
const ForumPostDetailPage = lazy(() => import('./pages/ForumPostDetailPage'));
const CreateForumPostPage = lazy(() => import('./pages/CreateForumPostPage'));
const MyViewingsPage = lazy(() => import('./pages/MyViewingsPage'));
const TransactionHistoryPage = lazy(() => import('./pages/TransactionHistoryPage'));
const BankAccountManagementPage = lazy(() => import('./pages/BankAccountManagementPage'));
const ActivityLogPage = lazy(() => import('./pages/ActivityLogPage'));
const TestimonialsPage = lazy(() => import('./pages/TestimonialsPage'));
const RentalManagementPage = lazy(() => import('./pages/RentalManagementPage'));
const UserDashboardLayout = lazy(() => import('./pages/user/UserDashboardLayout'));

function AppContent() {
  return (
    <div className="min-h-screen w-full">
      <ErrorBoundary>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route element={<DashboardLayout />}>
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff"
                element={
                  <ProtectedRoute requireRole="STAFF">
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* User Dashboard with Sidebar */}
            <Route element={<DashboardLayout />}>
              <Route
                path="/user-dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboardLayout />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
            </Route>

            <Route element={<MainLayout />}>
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
              <Route path="/forum" element={<ForumPage />} />
              <Route
                path="/forum/create"
                element={
                  <ProtectedRoute>
                    <CreateForumPostPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/forum/:id" element={<ForumPostDetailPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/:id" element={<NewsDetailPage />} />
              <Route path="/agents" element={<AgentsPage />} />
              <Route path="/agents/:id" element={<AgentDetailPage />} />
              <Route path="/users/:id" element={<PublicProfilePage />} />
              <Route path="/agencies" element={<AgenciesPage />} />
              <Route path="/agencies/:id" element={<AgencyDetailPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <FavoritesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/post-property"
                element={
                  <ProtectedRoute>
                    <PostPropertyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-properties"
                element={
                  <ProtectedRoute>
                    <MyPropertiesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-property/:id"
                element={
                  <ProtectedRoute>
                    <EditPropertyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationCenter />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications/settings"
                element={
                  <ProtectedRoute>
                    <NotificationSettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payments"
                element={
                  <ProtectedRoute>
                    <PaymentHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/payment/success" element={<PaymentSuccessPage />} />
              <Route path="/payment/failed" element={<PaymentFailedPage />} />
              <Route
                path="/my-transactions"
                element={
                  <ProtectedRoute>
                    <MyTransactionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/landlord-analytics"
                element={
                  <ProtectedRoute>
                    <LandlordAnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rental-management"
                element={
                  <ProtectedRoute>
                    <RentalManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/help/wallet" element={<WalletGuidePage />} />
              <Route
                path="/transactions/:id"
                element={
                  <ProtectedRoute>
                    <TransactionOverviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions/:id/contract"
                element={
                  <ProtectedRoute>
                    <TransactionContractReviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions/:id/blockchain"
                element={
                  <ProtectedRoute>
                    <TransactionContractPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/escrow"
                element={
                  <ProtectedRoute>
                    <EscrowDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kyc-verify"
                element={
                  <ProtectedRoute>
                    <KycVerificationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inquiries"
                element={
                  <ProtectedRoute>
                    <InquiryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-viewings"
                element={
                  <ProtectedRoute>
                    <MyViewingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rental-contracts"
                element={
                  <ProtectedRoute>
                    <RentalContractsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rental-contracts/:id"
                element={
                  <ProtectedRoute>
                    <RentalContractDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/valuation" element={<ValuationPage />} />
              <Route
                path="/investment-calculator"
                element={
                  <ProtectedRoute>
                    <InvestmentCalculatorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/price-alerts"
                element={
                  <ProtectedRoute>
                    <PriceAlertsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/revenue"
                element={
                  <ProtectedRoute>
                    <RevenueDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/maintenance-requests"
                element={
                  <ProtectedRoute>
                    <MaintenanceRequestsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/maintenance-requests/new"
                element={
                  <ProtectedRoute>
                    <CreateMaintenanceRequestPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <CalendarPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/badges" element={<BadgesPage />} />
              <Route path="/legal" element={<LegalCenterPage />} />
              <Route path="/security" element={<SecurityCenterPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/testimonials" element={<TestimonialsPage />} />
              <Route
                path="/transaction-history"
                element={
                  <ProtectedRoute>
                    <TransactionHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bank-accounts"
                element={
                  <ProtectedRoute>
                    <BankAccountManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activity-log"
                element={
                  <ProtectedRoute>
                    <ActivityLogPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>

      <Toaster position="top-right" richColors />
    </div>
  );
}

function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;