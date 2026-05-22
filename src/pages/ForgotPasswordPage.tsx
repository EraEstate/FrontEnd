import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, Lock, Key, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../api/auth';
import toast from '../utils/toast';
import eraLogo from '../assets/ERA_Real_Estate_logo-244x300.png';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập OTP & mật khẩu mới
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Vui lòng nhập email.');
      return;
    }
    setLoading(true);
    try {
      const data = await authAPI.forgotPassword(email.trim());
      toast.success((data as any)?.message || 'Mã OTP đã được gửi đến email của bạn.');
      
      // Hỗ trợ tự động hiển thị mã OTP cho môi trường DEV trong console
      if (import.meta.env.DEV && (data as any)?.otpCode) {
        console.info(`[DEV ONLY] OTP Code: ${(data as any).otpCode}`);
      }
      
      setStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Không gửi được yêu cầu.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      toast.error('Vui lòng nhập mã OTP.');
      return;
    }
    if (password.length < 6) {
      toast.error('Mật khẩu tối thiểu 6 ký tự.');
      return;
    }
    if (password !== confirm) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return;
    }
    setLoading(true);
    try {
      const data = await authAPI.resetPassword(email.trim(), otpCode.trim(), password);
      toast.success((data as any)?.message || 'Đặt lại mật khẩu thành công.');
      navigate('/login', { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Không đặt lại được mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img src={eraLogo} alt="" className="h-14 mx-auto mb-4" />
        <h1 className="text-center text-2xl font-semibold text-gray-900">
          {step === 1 ? 'Quên mật khẩu' : 'Đặt lại mật khẩu'}
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 1
            ? 'Nhập email đã đăng ký. Hệ thống sẽ gửi mã OTP để đặt lại mật khẩu.'
            : `Nhập mã OTP gửi đến ${email} và điền mật khẩu mới.`}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="you@example.com"
                  />
                  <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Gửi mã OTP'
                )}
              </button>
              <Link
                to="/login"
                className="flex items-center justify-center text-sm text-gray-600 hover:text-red-600"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại đăng nhập
              </Link>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Mã OTP (6 chữ số)
                </label>
                <div className="mt-1 relative">
                  <input
                    id="otp"
                    type="text"
                    required
                    maxLength={6}
                    pattern="\d{6}"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 sm:text-sm tracking-widest text-center font-semibold text-lg"
                    placeholder="123456"
                  />
                  <Key className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mật khẩu mới
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    type={show ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                  <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-2.5 text-gray-400"
                  >
                    {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
                  Xác nhận mật khẩu mới
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirm"
                    type="password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                  <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Cập nhật mật khẩu'
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full flex items-center justify-center text-sm text-gray-600 hover:text-red-600 mt-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Nhập lại email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
