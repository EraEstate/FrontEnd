import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { authAPI } from '../api/auth';
import { toast } from 'react-toastify';
import eraLogo from '../assets/ERA_Real_Estate_logo-244x300.png';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authAPI.forgotPassword(email.trim());
      setSent(true);
      toast.success((data as any)?.message || 'Đã gửi hướng dẫn đặt lại mật khẩu.');
      if (import.meta.env.DEV && (data as any)?.resetToken) {
        toast.info(
          `Dev: token đặt lại — dán vào URL /reset-password?token=${encodeURIComponent((data as any).resetToken)}`,
          { autoClose: 8000 }
        );
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Không gửi được yêu cầu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img src={eraLogo} alt="" className="h-14 mx-auto mb-4" />
        <h1 className="text-center text-2xl font-bold text-gray-900">Quên mật khẩu</h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Nhập email đã đăng ký. Nếu tồn tại, hệ thống sẽ gửi hướng dẫn đặt lại mật khẩu.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-gray-700 text-sm">Kiểm tra hộp thư (và mục spam). Sau đó đặt lại mật khẩu qua liên kết trong email.</p>
              <Link
                to="/login"
                className="inline-flex items-center text-red-600 font-medium hover:text-red-700"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Về đăng nhập
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  'Gửi yêu cầu'
                )}
              </button>
              <Link
                to="/login"
                className="flex items-center justify-center text-sm text-gray-600 hover:text-red-600"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại đăng nhập
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
