import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle, KeyRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import type { RegisterForm } from '../types';
import eraLogo from '../assets/ERA_Real_Estate_logo-244x300.png';

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegisterForm>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    otpCode: '',
  });

  const { register, sendOtp, isLoading, error, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect based on role
      if (user?.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (user?.role === 'STAFF') {
        navigate('/staff', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    // Nếu chưa hiện form OTP, gửi OTP trước
    if (!showOtpForm) {
      setSendingOtp(true);
      setOtpError(null);
      try {
        await sendOtp(formData.email);
        setShowOtpForm(true);
      } catch (error: any) {
        setOtpError(error.response?.data?.error || 'Không thể gửi mã OTP');
      } finally {
        setSendingOtp(false);
      }
      return;
    }

    // Nếu đã có form OTP, submit đăng ký
    if (!formData.otpCode || formData.otpCode.length !== 6) {
      setOtpError('Vui lòng nhập mã OTP 6 chữ số');
      return;
    }

    try {
      await register(formData);
      // Redirect will be handled by useEffect above
    } catch (error: any) {
      // Nếu lỗi OTP, hiển thị lỗi
      if (error.response?.data?.error?.includes('OTP')) {
        setOtpError(error.response.data.error);
      }
      // Error is handled by the store
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear OTP error when user types
    if (e.target.name === 'otpCode') {
      setOtpError(null);
    }
  };

  const passwordsMatch = formData.password === formData.confirmPassword;
  const isPasswordValid = formData.password.length >= 6;

  return (
    <div className="min-h-[150vh] bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 pt-24">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex flex-col items-center">
            <img src={eraLogo} alt="ERA Estate" className="h-16 w-auto mb-2" />
          
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          {t('auth.register.createAccount')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('auth.register.haveAccount')}{' '}
          <Link
            to="/login"
            className="font-medium text-red-600 hover:text-orange-500"
          >
            {t('auth.register.loginLink')}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                {t('auth.register.fullName')} <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder={t('auth.register.enterFullName')}
                />
                <User className="h-5 w-5 text-gray-400 absolute left-3 top-2" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('auth.login.email')} <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={showOtpForm}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm disabled:bg-gray-100"
                  placeholder={t('auth.login.email')}
                />
                <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-2" />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                {t('auth.register.phone')} <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder={t('auth.register.enterPhone')}
                />
                <Phone className="h-5 w-5 text-gray-400 absolute left-3 top-2" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('auth.register.password')} <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder={t('auth.register.enterPassword')}
                />
                <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2 flex items-center">
                  {isPasswordValid ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`ml-2 text-sm ${isPasswordValid ? 'text-green-600' : 'text-red-600'}`}>
                    {t('auth.register.passwordMinLength')}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t('auth.register.confirmPassword')} <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder={t('auth.register.reEnterPassword')}
                />
                <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-2" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formData.confirmPassword && (
                <div className="mt-2 flex items-center">
                  {passwordsMatch ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`ml-2 text-sm ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordsMatch ? t('auth.register.passwordMatch') : t('auth.register.passwordNotMatch')}
                  </span>
                </div>
              )}
            </div>

            {showOtpForm && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                <p className="text-sm text-blue-800 mb-3">
                  Mã OTP đã được gửi đến email <strong>{formData.email}</strong>. Vui lòng kiểm tra email và nhập mã OTP bên dưới.
                </p>
                <div>
                  <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700">
                    Mã OTP <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="otpCode"
                      name="otpCode"
                      type="text"
                      required
                      maxLength={6}
                      value={formData.otpCode}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      placeholder="Nhập mã OTP 6 chữ số"
                    />
                    <KeyRound className="h-5 w-5 text-gray-400 absolute left-3 top-2" />
                  </div>
                  {otpError && (
                    <p className="mt-1 text-sm text-red-600">{otpError}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                required
                disabled={showOtpForm}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded disabled:opacity-50"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                {t('auth.loginFooter.termsAgreement')}{' '}
                <a href="#" className="text-orange-600 hover:text-orange-500">
                  {t('auth.loginFooter.termsOfService')}
                </a>{' '}
                {t('auth.loginFooter.and')}{' '}
                <a href="#" className="text-orange-600 hover:text-orange-500">
                  {t('auth.loginFooter.privacyPolicy')}
                </a>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || sendingOtp || !passwordsMatch || !isPasswordValid || (showOtpForm && !formData.otpCode)}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingOtp ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Đang gửi OTP...
                  </div>
                ) : isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    {t('common.loading')}
                  </div>
                ) : showOtpForm ? (
                  'Xác nhận đăng ký'
                ) : (
                  t('auth.register.createAccountButton')
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t('auth.register.orRegisterWith')}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="ml-2">Google</span>
              </button>

              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="ml-2">Facebook</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer để tạo chiều cao scroll */}
      <div className="mt-16 pb-16 text-center text-gray-400">
        <div className="max-w-md mx-auto px-4">
          <p className="text-sm mb-4">
            {t('auth.register.registerToExperience')}
          </p>
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Quyền lợi thành viên</h3>
            <div className="space-y-3 text-xs text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                <span>Đăng tin bán/cho thuê bất động sản miễn phí</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                <span>Lưu tin yêu thích và tìm kiếm nhanh</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                <span>Nhận thông báo tin đăng mới phù hợp</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                <span>Quản lý tin đăng hiệu quả</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                <span>Kết nối trực tiếp với khách hàng</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;