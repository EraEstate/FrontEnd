import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Map files to commit messages - 100 commits total
const fileCommits = [
  { files: ['package.json'], message: 'Initialize React project with package.json' },
  { files: ['vite.config.ts'], message: 'Configure Vite build tool' },
  { files: ['tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json'], message: 'Set up TypeScript configuration' },
  { files: ['tailwind.config.js', 'postcss.config.js'], message: 'Configure Tailwind CSS and PostCSS' },
  { files: ['eslint.config.js'], message: 'Set up ESLint for code quality' },
  { files: ['index.html'], message: 'Create main HTML entry point' },
  { files: ['src/main.tsx'], message: 'Create React application entry point' },
  { files: ['src/App.tsx'], message: 'Implement main App component with routing' },
  { files: ['src/App.css'], message: 'Add App component styles' },
  { files: ['src/index.css'], message: 'Add global CSS styles' },
  { files: ['src/index_clean.css'], message: 'Add clean CSS reset styles' },
  { files: ['src/components/Header.tsx'], message: 'Create Header component with navigation' },
  { files: ['src/components/Footer.tsx'], message: 'Create Footer component' },
  { files: ['src/components/HomePage.tsx'], message: 'Implement HomePage component' },
  { files: ['src/components/HomePage_Old.tsx'], message: 'Add backup HomePage component' },
  { files: ['src/components/LanguageSwitcher.tsx'], message: 'Create LanguageSwitcher component' },
  { files: ['src/components/AddressAutocomplete.tsx'], message: 'Implement AddressAutocomplete component' },
  { files: ['src/components/MapPicker.tsx'], message: 'Create MapPicker component with Leaflet' },
  { files: ['src/components/FloatingChatBox.tsx'], message: 'Implement FloatingChatBox component' },
  { files: ['src/components/PropertyChatList.tsx'], message: 'Create PropertyChatList component' },
  { files: ['src/components/ActivityTab.tsx'], message: 'Implement ActivityTab component' },
  { files: ['src/components/ProtectedRoute.tsx'], message: 'Create ProtectedRoute component for authentication' },
  { files: ['src/components/Settings.tsx'], message: 'Implement Settings component' },
  { files: ['src/pages/LoginPage.tsx'], message: 'Create LoginPage component' },
  { files: ['src/pages/RegisterPage.tsx'], message: 'Create RegisterPage component' },
  { files: ['src/pages/DashboardPage.tsx'], message: 'Implement DashboardPage component' },
  { files: ['src/pages/ProfilePage.tsx'], message: 'Create ProfilePage component' },
  { files: ['src/pages/PropertiesPage.tsx'], message: 'Implement PropertiesPage component' },
  { files: ['src/pages/PropertyDetailPage.tsx'], message: 'Create PropertyDetailPage component' },
  { files: ['src/pages/PostPropertyPage.tsx'], message: 'Implement PostPropertyPage component' },
  { files: ['src/pages/EditPropertyPage.tsx'], message: 'Create EditPropertyPage component' },
  { files: ['src/pages/MyPropertiesPage.tsx'], message: 'Implement MyPropertiesPage component' },
  { files: ['src/pages/FavoritesPage.tsx'], message: 'Create FavoritesPage component' },
  { files: ['src/pages/InquiryPage.tsx'], message: 'Implement InquiryPage component' },
  { files: ['src/pages/NewsPage.tsx'], message: 'Create NewsPage component' },
  { files: ['src/pages/NewsPage_Old.tsx'], message: 'Add backup NewsPage component' },
  { files: ['src/pages/NewsDetailPage.tsx'], message: 'Implement NewsDetailPage component' },
  { files: ['src/pages/WikiPage.tsx'], message: 'Create WikiPage component' },
  { files: ['src/pages/WikiDetailPage.tsx'], message: 'Implement WikiDetailPage component' },
  { files: ['src/pages/MarketAnalysisListPage.tsx'], message: 'Create MarketAnalysisListPage component' },
  { files: ['src/pages/MarketAnalysisDetailPage.tsx'], message: 'Implement MarketAnalysisDetailPage component' },
  { files: ['src/pages/ProjectsPage.tsx'], message: 'Create ProjectsPage component' },
  { files: ['src/pages/ProjectDetailPage.tsx'], message: 'Implement ProjectDetailPage component' },
  { files: ['src/pages/AgenciesPage.tsx'], message: 'Create AgenciesPage component' },
  { files: ['src/pages/AgencyDetailPage.tsx'], message: 'Implement AgencyDetailPage component' },
  { files: ['src/pages/AgentsPage.tsx'], message: 'Create AgentsPage component' },
  { files: ['src/pages/AgentDetailPage.tsx'], message: 'Implement AgentDetailPage component' },
  { files: ['src/pages/CompaniesPage.tsx'], message: 'Create CompaniesPage component' },
  { files: ['src/pages/CompanyDetailPage.tsx'], message: 'Implement CompanyDetailPage component' },
  { files: ['src/pages/ContactPage.tsx'], message: 'Create ContactPage component' },
  { files: ['src/pages/AboutPage.tsx'], message: 'Implement AboutPage component' },
  { files: ['src/pages/PricingPage.tsx'], message: 'Create PricingPage component' },
  { files: ['src/pages/UtilitiesPage.tsx'], message: 'Implement UtilitiesPage component' },
  { files: ['src/pages/NotFoundPage.tsx'], message: 'Create NotFoundPage component' },
  { files: ['src/pages/NotificationCenter.tsx'], message: 'Implement NotificationCenter component' },
  { files: ['src/pages/PaymentHistoryPage.tsx'], message: 'Create PaymentHistoryPage component' },
  { files: ['src/pages/PublicProfilePage.tsx'], message: 'Implement PublicProfilePage component' },
  { files: ['src/pages/RentPage.tsx'], message: 'Create RentPage component' },
  { files: ['src/pages/AdminDashboard.tsx'], message: 'Implement AdminDashboard component' },
  { files: ['src/pages/admin/PropertyManagement.tsx'], message: 'Create PropertyManagement admin page' },
  { files: ['src/pages/admin/UserManagement.tsx'], message: 'Implement UserManagement admin page' },
  { files: ['src/pages/admin/AgencyManagement.tsx'], message: 'Create AgencyManagement admin page' },
  { files: ['src/pages/admin/AgentManagement.tsx'], message: 'Implement AgentManagement admin page' },
  { files: ['src/pages/admin/NewsManagement.tsx'], message: 'Create NewsManagement admin page' },
  { files: ['src/pages/admin/ProjectManagement.tsx'], message: 'Implement ProjectManagement admin page' },
  { files: ['src/pages/admin/PaymentManagement.tsx'], message: 'Create PaymentManagement admin page' },
  { files: ['src/pages/admin/InquiryManagement.tsx'], message: 'Implement InquiryManagement admin page' },
  { files: ['src/pages/admin/AnalyticsPage.tsx'], message: 'Create AnalyticsPage admin page' },
  { files: ['src/api/client.ts'], message: 'Create axios client configuration' },
  { files: ['src/api/types.ts'], message: 'Define TypeScript types for API' },
  { files: ['src/api/auth.ts'], message: 'Implement authentication API service' },
  { files: ['src/api/property.ts'], message: 'Create property API service' },
  { files: ['src/api/propertyDetail.ts'], message: 'Implement property detail API service' },
  { files: ['src/api/propertyFavorite.ts'], message: 'Create property favorite API service' },
  { files: ['src/api/propertyInquiry.ts'], message: 'Implement property inquiry API service' },
  { files: ['src/api/propertyView.ts'], message: 'Create property view API service' },
  { files: ['src/api/user.ts'], message: 'Implement user API service' },
  { files: ['src/api/profile.ts'], message: 'Create profile API service' },
  { files: ['src/api/settings.ts'], message: 'Implement settings API service' },
  { files: ['src/api/news.ts'], message: 'Create news API service' },
  { files: ['src/api/wiki.ts'], message: 'Implement wiki API service' },
  { files: ['src/api/project.ts'], message: 'Create project API service' },
  { files: ['src/api/agency.ts'], message: 'Implement agency API service' },
  { files: ['src/api/agent.ts'], message: 'Create agent API service' },
  { files: ['src/api/company.ts'], message: 'Implement company API service' },
  { files: ['src/api/payment.ts'], message: 'Create payment API service' },
  { files: ['src/api/chat.ts'], message: 'Implement chat API service' },
  { files: ['src/api/location.ts'], message: 'Create location API service' },
  { files: ['src/api/marketAnalysis.ts'], message: 'Implement market analysis API service' },
  { files: ['src/api/activity.ts'], message: 'Create activity API service' },
  { files: ['src/api/admin.ts'], message: 'Implement admin API service' },
  { files: ['src/api/upload.ts'], message: 'Create upload API service' },
  { files: ['src/api/services.ts'], message: 'Implement services API' },
  { files: ['src/api/misc.ts'], message: 'Create misc API service' },
  { files: ['src/api/hooks.ts'], message: 'Create custom React hooks for API' },
  { files: ['src/api/index.ts'], message: 'Create API index file with exports' },
  { files: ['src/api/examples.tsx'], message: 'Add API usage examples' },
  { files: ['src/api/updatedExamples.tsx'], message: 'Update API usage examples' },
  { files: ['src/api/INTEGRATION_SUMMARY.md'], message: 'Add API integration documentation' },
  { files: ['src/i18n/index.ts'], message: 'Configure i18n with react-i18next' },
  { files: ['src/i18n/locales/en.json'], message: 'Add English language translations' },
  { files: ['src/i18n/locales/vi.json'], message: 'Add Vietnamese language translations' },
  { files: ['src/i18n/locales/zh.json'], message: 'Add Chinese language translations' },
  { files: ['src/i18n/locales/ja.json'], message: 'Add Japanese language translations' },
  { files: ['src/i18n/locales/ko.json'], message: 'Add Korean language translations' },
  { files: ['src/i18n/locales/th.json'], message: 'Add Thai language translations' },
  { files: ['src/i18n/locales/id.json'], message: 'Add Indonesian language translations' },
  { files: ['src/i18n/locales/ms.json'], message: 'Add Malay language translations' },
  { files: ['src/i18n/locales/fr.json'], message: 'Add French language translations' },
  { files: ['src/i18n/locales/de.json'], message: 'Add German language translations' },
  { files: ['src/i18n/locales/es.json'], message: 'Add Spanish language translations' },
  { files: ['src/i18n/locales/pt.json'], message: 'Add Portuguese language translations' },
  { files: ['src/i18n/locales/ru.json'], message: 'Add Russian language translations' },
  { files: ['src/i18n/locales/hi.json'], message: 'Add Hindi language translations' },
  { files: ['src/i18n/locales/ar.json'], message: 'Add Arabic language translations' },
  { files: ['src/i18n/locales/it.json'], message: 'Add Italian language translations' },
  { files: ['src/i18n/locales/km.json'], message: 'Add Khmer language translations' },
  { files: ['src/i18n/locales/tl.json'], message: 'Add Tagalog language translations' },
  { files: ['src/i18n/locales/my.json'], message: 'Add Myanmar language translations' },
  { files: ['src/store/authStore.ts'], message: 'Create auth store with Zustand' },
  { files: ['src/store/propertyStore.ts'], message: 'Implement property store' },
  { files: ['src/services/websocket.ts'], message: 'Create WebSocket service for real-time chat' },
  { files: ['src/utils/imageUtils.ts'], message: 'Create image utility helpers' },
  { files: ['src/types/index.ts'], message: 'Define TypeScript types' },
  { files: ['src/contexts/AdminThemeContext.tsx'], message: 'Create AdminThemeContext for theme management' },
  { files: ['README.md'], message: 'Add project README documentation' },
  { files: ['AUTOCOMMIT_README.md'], message: 'Add autocommit script documentation' },
  { files: ['HEADER_MODERNIZATION.md'], message: 'Add header modernization documentation' },
  { files: ['HEADER_COMPACT_REDESIGN.md'], message: 'Add header compact redesign documentation' }
];

console.log('Starting autocommit for Frontend...\n');

// Change to frontend directory
process.chdir(__dirname);

let successCount = 0;
let skipCount = 0;

fileCommits.forEach((item, index) => {
  try {
    console.log(`[${index + 1}/100] Committing: ${item.message}`);
    
    // Check if files exist
    const existingFiles = item.files.filter(file => fs.existsSync(file));
    
    if (existingFiles.length === 0) {
      console.log(`  -> Skipped (files not found)\n`);
      skipCount++;
      return;
    }
    
    // Stage specific files
    existingFiles.forEach(file => {
      try {
        execSync(`git add "${file}"`, { stdio: 'ignore' });
      } catch (e) {
        // File might not be tracked, continue
      }
    });
    
    // Check if there are changes to commit
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf-8' });
      if (status.trim() === '') {
        console.log(`  -> Skipped (no changes)\n`);
        skipCount++;
        return;
      }
    } catch (e) {
      // If git status fails, continue anyway
    }
    
    // Commit with message
    execSync(`git commit -m "${item.message}"`, { stdio: 'inherit' });
    
    console.log(`  -> Success (${existingFiles.length} file(s))\n`);
    successCount++;
    
    // Small delay to ensure commits are sequential
    try {
      if (process.platform === 'win32') {
        execSync('timeout /t 1 /nobreak >nul 2>&1', { stdio: 'ignore' });
      } else {
        execSync('sleep 1', { stdio: 'ignore' });
      }
    } catch (e) {
      // Ignore delay errors
    }
    
  } catch (error) {
    console.log(`  -> Error: ${error.message}\n`);
    skipCount++;
  }
});

console.log('\n========================================');
console.log('Autocommit completed!');
console.log(`Total commits: ${successCount}`);
console.log(`Skipped: ${skipCount}`);
console.log('========================================\n');
