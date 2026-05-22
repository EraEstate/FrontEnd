import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../api/auth';
import toast from '../utils/toast';
import eraLogo from '../assets/ERA_Real_Estate_logo-244x300.png';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Thiếu liên kết xác thực. Mở lại email hoặc yêu cầu gửi lại.');
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
      const data = await authAPI.resetPassword(token, password);
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
        <h1 className="text-center text-2xl font-semibold text-gray-900">Đặt lại mật khẩu</h1>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
          {!token && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
              Không có mã trong URL. Dùng đúng liên kết từ email hoặc{' '}
              <Link to="/forgot-password" className="underline font-medium text-red-700">
                gửi lại yêu cầu
              </Link>
              .
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="reset-password-new" className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
              <div className="mt-1 relative">
                <input
                  id="reset-password-new"

                  type={show ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 sm:text-sm"
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
              <label htmlFor="reset-password-confirm" className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
              <input
                id="reset-password-confirm"

                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-2.5 px-4 rounded-md text-white bg-red-600 hover:bg-red-700 font-medium disabled:opacity-50 flex justify-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Cập nhật mật khẩu'}
            </button>
            <Link
              to="/login"
              className="flex items-center justify-center text-sm text-gray-600 hover:text-red-600"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Đăng nhập
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
