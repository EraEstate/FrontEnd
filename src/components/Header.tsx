import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Heart,
  ChevronDown,
  Wallet,
  Receipt,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { settingsAPI } from '../api/settings';
import { getImageUrl, getAvatarPlaceholder } from '../utils/imageUtils';
import LanguageSwitcher from './LanguageSwitcher';
import eraLogo from '../assets/ERA_Real_Estate_logo-244x300.png';

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPropertiesMenuOpen, setIsPropertiesMenuOpen] = useState(false);
  const [isNewsMenuOpen, setIsNewsMenuOpen] = useState(false);
  const [isServicesMenuOpen, setIsServicesMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string>('');
  const { isAuthenticated, user, logout, updateUser } = useAuthStore();
  const location = useLocation();
  const isAdmin = user?.role === 'ADMIN';

  // Load avatar from backend
  useEffect(() => {
    if (isAuthenticated && user) {
      settingsAPI.getCurrentSettings()
        .then((settings) => {
          if (settings.avatarUrl) {
            const avatarUrl = getImageUrl(settings.avatarUrl);
            if (avatarUrl) {
              setUserAvatar(avatarUrl);
              // Update user in store with avatar
              updateUser({ ...user, avatar: avatarUrl });
            }
          }
        })
        .catch((error) => {
          console.error('Failed to load avatar:', error);
        });
    }
  }, [isAuthenticated, user?.id]);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  // Modern scroll detection with throttle for better performance
  useEffect(() => {
    const forceSmallOnAuth = location.pathname === '/login' || location.pathname === '/register';
    let ticking = false;

    const handleScroll = () => {
      if (forceSmallOnAuth) return;
      
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Set initial state
    if (forceSmallOnAuth) {
      setIsScrolled(true);
    } else {
      setIsScrolled(window.scrollY > 50);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  // Close dropdowns when clicking outside (but not when hovering)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Only close if clicking outside AND not hovering over any dropdown
      if (!target.closest('.properties-dropdown') && 
          !target.closest('.news-dropdown') && 
          !target.closest('.services-dropdown') && 
          !target.closest('.user-dropdown')) {
        setIsPropertiesMenuOpen(false);
        setIsNewsMenuOpen(false);
        setIsServicesMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[9999] w-full bg-white transition-shadow duration-300 ${
        isScrolled 
          ? 'shadow-md border-b border-gray-100' 
          : 'shadow-sm'
      }`}
    >
      {/* Main Header - Modern & Clean */}
      <div className="w-full">
        <div
          className={`px-6 lg:px-12 flex items-center justify-between transition-all duration-300 ease-out ${
            isScrolled ? 'h-16 py-3' : 'h-20 py-4'
          }`}
        >
          {/* Logo - Simplified with ERA asset */}
          <div className="flex items-center pr-10 lg:pr-12">
            <Link to="/" className="flex items-center group">
              <img
                src={eraLogo}
                alt="ERA Real Estate"
                className={`mr-3 transition-all duration-200 ${isScrolled ? 'h-10 w-auto' : 'h-12 w-auto'} group-hover:scale-105 group-hover:shadow-lg rounded-md`}
              />
              <div>
                <div className="font-extrabold tracking-tight text-l lg:text-xl text-red-600">
                  ERA Estate
                </div>
              
              </div>
            </Link>
          </div>

          {/* Navigation Menu - Compact with Dropdowns */}
          <nav className="hidden lg:flex items-center space-x-1">
            {/* Mua bán & Cho thuê Dropdown */}
            <div 
              className="relative properties-dropdown"
              onMouseEnter={() => {
                setIsPropertiesMenuOpen(true);
                setIsNewsMenuOpen(false);
                setIsServicesMenuOpen(false);
                setIsUserMenuOpen(false);
              }}
              onMouseLeave={() => {
                setIsPropertiesMenuOpen(false);
              }}
            >
              <button
                onClick={() => {
                  setIsPropertiesMenuOpen(!isPropertiesMenuOpen);
                  setIsNewsMenuOpen(false);
                  setIsServicesMenuOpen(false);
                  setIsUserMenuOpen(false);
                }}
                className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-lg ${
                  isPropertiesMenuOpen 
                    ? 'text-red-600 bg-red-50' 
                    : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <span>{t('header.properties')}</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                  isPropertiesMenuOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {isPropertiesMenuOpen && (
                <div className="absolute top-full left-0 pt-1 w-56 z-50">
                  <div className="bg-white rounded-xl shadow-xl py-2 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link
                      to="/properties"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                      onClick={() => setIsPropertiesMenuOpen(false)}
                    >
                      {t('header.properties')}
                    </Link>
                    <Link
                      to="/rent"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                      onClick={() => setIsPropertiesMenuOpen(false)}
                    >
                      {t('header.rent')}
                    </Link>
                    <Link
                      to="/projects"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                      onClick={() => setIsPropertiesMenuOpen(false)}
                    >
                      {t('header.projects')}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Tin tức & Thông tin Dropdown */}
            <div 
              className="relative news-dropdown"
              onMouseEnter={() => {
                setIsNewsMenuOpen(true);
                setIsPropertiesMenuOpen(false);
                setIsServicesMenuOpen(false);
                setIsUserMenuOpen(false);
              }}
              onMouseLeave={() => {
                setIsNewsMenuOpen(false);
              }}
            >
              <button
                onClick={() => {
                  setIsNewsMenuOpen(!isNewsMenuOpen);
                  setIsPropertiesMenuOpen(false);
                  setIsServicesMenuOpen(false);
                  setIsUserMenuOpen(false);
                }}
                className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-lg ${
                  isNewsMenuOpen 
                    ? 'text-red-600 bg-red-50' 
                    : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <span>{t('header.news')}</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                  isNewsMenuOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {isNewsMenuOpen && (
                <div className="absolute top-full left-0 pt-1 w-56 z-50">
                  <div className="bg-white rounded-xl shadow-xl py-2 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link
                      to="/news"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                      onClick={() => setIsNewsMenuOpen(false)}
                    >
                      {t('header.news')}
                    </Link>
                    <Link
                      to="/market-analysis"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                      onClick={() => setIsNewsMenuOpen(false)}
                    >
                      {t('header.marketAnalysis')}
                    </Link>
                    <Link
                      to="/wiki"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                      onClick={() => setIsNewsMenuOpen(false)}
                    >
                      {t('header.wiki')}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Dịch vụ Dropdown */}
            <div 
              className="relative services-dropdown"
              onMouseEnter={() => {
                setIsServicesMenuOpen(true);
                setIsPropertiesMenuOpen(false);
                setIsNewsMenuOpen(false);
                setIsUserMenuOpen(false);
              }}
              onMouseLeave={() => {
                setIsServicesMenuOpen(false);
              }}
            >
              <button
                onClick={() => {
                  setIsServicesMenuOpen(!isServicesMenuOpen);
                  setIsPropertiesMenuOpen(false);
                  setIsNewsMenuOpen(false);
                  setIsUserMenuOpen(false);
                }}
                className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-lg ${
                  isServicesMenuOpen 
                    ? 'text-red-600 bg-red-50' 
                    : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <span>{t('header.brokerage')}</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                  isServicesMenuOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {isServicesMenuOpen && (
                <div className="absolute top-full left-0 pt-1 w-56 z-50">
                  <div className="bg-white rounded-xl shadow-xl py-2 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link
                      to="/agents"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                      onClick={() => setIsServicesMenuOpen(false)}
                    >
                      {t('header.agents')}
                    </Link>
                    <Link
                      to="/agencies"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                      onClick={() => setIsServicesMenuOpen(false)}
                    >
                      {t('header.agencies')}
                    </Link>
                    <Link
                      to="/companies"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                      onClick={() => setIsServicesMenuOpen(false)}
                    >
                      {t('header.companies')}
                    </Link>
                    <Link
                      to="/utilities"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                      onClick={() => setIsServicesMenuOpen(false)}
                    >
                      {t('header.utilities')}
                    </Link>
                    <Link
                      to="/pricing"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                      onClick={() => setIsServicesMenuOpen(false)}
                    >
                      {t('header.pricing')}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Side Actions - Modern & Clean */}
          <div className="flex items-center space-x-2">
            {/* Language Switcher */}
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            {/* Favorites Icon */}
            <Link
              to="/favorites"
              className="hidden md:flex items-center justify-center w-10 h-10 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title={t('header.favorites')}
            >
              <Heart className="h-5 w-5" />
            </Link>
            
            {isAuthenticated ? (
              <>
                {/* User Menu - Modern */}
                <div className="relative user-dropdown">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(!isUserMenuOpen);
                      setIsPropertiesMenuOpen(false);
                      setIsNewsMenuOpen(false);
                      setIsServicesMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <div className="relative w-8 h-8">
                      {/* Fallback div - luôn hiển thị */}
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user?.fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      {/* Avatar image - overlay lên trên nếu có */}
                      {(userAvatar || user?.avatar) && (
                        <img 
                          src={getImageUrl(userAvatar || user?.avatar) || getAvatarPlaceholder(32)} 
                          alt={user?.fullName || 'User'} 
                          className="absolute inset-0 w-8 h-8 rounded-full object-cover border-2 border-red-600"
                          onError={(e) => {
                            // Ẩn img nếu lỗi, fallback div sẽ hiển thị
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-12 h-12">
                            {/* Fallback div - luôn hiển thị */}
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              {user?.fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            {/* Avatar image - overlay lên trên nếu có */}
                            {(userAvatar || user?.avatar) && (
                              <img 
                                src={getImageUrl(userAvatar || user?.avatar) || getAvatarPlaceholder(48)} 
                                alt={user?.fullName || 'User'} 
                                className="absolute inset-0 w-12 h-12 rounded-full object-cover border-2 border-red-600"
                                onError={(e) => {
                                  // Ẩn img nếu lỗi, fallback div sẽ hiển thị
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{user?.fullName || 'User'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      {isAdmin && (
                        <>
                          <Link
                            to="/admin"
                            className="flex items-center px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors duration-150"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            🛡️ {t('admin.menu.overview')}
                          </Link>
                          <div className="border-t border-gray-100 my-1"></div>
                        </>
                      )}
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {t('header.profile')}
                      </Link>
                      <Link
                        to="/my-transactions"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Receipt className="w-4 h-4 opacity-70" />
                        {t('header.myTransactions')}
                      </Link>
                      <Link
                        to="/my-properties"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {t('header.myProperties')}
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {t('header.settings')}
                      </Link>
                      <Link
                        to="/help/wallet"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Wallet className="w-4 h-4 opacity-70" />
                        {t('header.walletGuide')}
                      </Link>
                      <Link
                        to="/security"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {t('header.securityCenter')}
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                      >
                        {t('header.logout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden md:inline-flex whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  {t('header.login')}
                </Link>
                <Link
                  to="/register"
                  className="hidden md:inline-flex whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  {t('header.register')}
                </Link>
              </>
            )}

            <Link
              to="/post-property"
              className="whitespace-nowrap bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
            >
              {t('header.postProperty')}
            </Link>

            {/* Mobile menu button */}
            <button
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 focus:outline-none transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Modern & Smooth */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top duration-200">
          <div className="px-6 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
            {/* Main Links */}
            <Link
              to="/properties"
              className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('header.properties')}
            </Link>
            <Link
              to="/rent"
              className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('header.rent')}
            </Link>
            <Link
              to="/projects"
              className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('header.projects')}
            </Link>
            <Link
              to="/news"
              className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('header.news')}
            </Link>

            {/* Khám phá Section */}
            <div className="pt-3 mt-3 border-t border-gray-100">
              <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t('header.explore')}
              </div>
              <Link
                to="/companies"
                className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.companies')}
              </Link>
              <Link
                to="/market-analysis"
                className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.marketAnalysis')}
              </Link>
              <Link
                to="/wiki"
                className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.wiki')}
              </Link>
              <Link
                to="/utilities"
                className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.utilities')}
              </Link>
            </div>

            {/* Môi giới Section */}
            <div className="pt-3 mt-3 border-t border-gray-100">
              <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t('header.brokerage')}
              </div>
              <Link
                to="/agents"
                className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.agents')}
              </Link>
              <Link
                to="/agencies"
                className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.agencies')}
              </Link>
              <Link
                to="/pricing"
                className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.pricing')}
              </Link>
            </div>

            {/* Auth Links - Mobile Only */}
            {!isAuthenticated && (
              <div className="pt-3 mt-3 border-t border-gray-100 space-y-2">
                <Link
                  to="/login"
                  className="flex items-center justify-center px-4 py-3 text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('header.login')}
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center px-4 py-3 text-base font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-150"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('header.register')}
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <div className="pt-3 mt-3 border-t border-gray-100">
                <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t('header.accountSection')}
                </div>
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('header.profile')}
                </Link>
                <Link
                  to="/my-transactions"
                  className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('header.myTransactions')}
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('header.settings')}
                </Link>
                <Link
                  to="/help/wallet"
                  className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('header.walletGuide')}
                </Link>
                <Link
                  to="/security"
                  className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('header.securityCenter')}
                </Link>
              </div>
            )}

            {/* Language Switcher - Mobile */}
            <div className="pt-3 mt-3 border-t border-gray-100">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

