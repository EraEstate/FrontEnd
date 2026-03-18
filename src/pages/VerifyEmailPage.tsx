import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { authAPI } from '../api/auth';
import eraLogo from '../assets/ERA_Real_Estate_logo-244x300.png';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('err');
      setMessage('Thiếu mã xác thực trong liên kết.');
      return;
    }
    let cancelled = false;
    (async () => {
      setStatus('loading');
      try {
        const data = await authAPI.verifyEmail(token);
        if (cancelled) return;
        setStatus('ok');
        setMessage((data as any)?.message || 'Email đã được xác thực.');
      } catch (err: any) {
        if (cancelled) return;
        setStatus('err');
        setMessage(err.response?.data?.error || err.response?.data?.message || 'Xác thực không thành công.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 pt-24">
      <div className="max-w-md mx-auto text-center">
        <img src={eraLogo} alt="" className="h-14 mx-auto mb-6" />
        <div className="bg-white rounded-lg shadow p-8">
          {status === 'loading' && (
            <>
              <Loader2 className="w-10 h-10 text-red-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-700">Đang xác thực email…</p>
            </>
          )}
          {status === 'ok' && (
            <>
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 mb-2">Thành công</h1>
              <p className="text-gray-600 text-sm mb-6">{message}</p>
              <Link
                to="/login"
                className="inline-block px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
              >
                Đăng nhập
              </Link>
            </>
          )}
          {status === 'err' && (
            <>
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 mb-2">Không xác thực được</h1>
              <p className="text-gray-600 text-sm mb-6">{message}</p>
              <Link to="/contact" className="text-red-600 font-medium hover:underline">
                Liên hệ hỗ trợ
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
