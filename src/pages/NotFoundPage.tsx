import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, Building2, Compass } from 'lucide-react';

const PARTICLES = Array.from({ length: 6 }, (_, i) => ({
  id: `particle-${i}`,
  index: i,
  bgColor: ['#3b82f6', '#f97316', '#8b5cf6', '#10b981', '#ec4899', '#06b6d4'][i],
}));

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center px-4 py-12 overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl" 
          style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }} />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl"
          style={{ transform: `translate(${-mousePos.x * 0.3}px, ${-mousePos.y * 0.3}px)` }} />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-100/20 rounded-full blur-3xl" />
        {/* Floating particles */}
        {PARTICLES.map((p) => (
          <div key={p.id}
            className="absolute rounded-full opacity-20 animate-pulse"
            style={{
              width: `${8 + p.index * 4}px`, height: `${8 + p.index * 4}px`,
              backgroundColor: p.bgColor,
              top: `${15 + p.index * 14}%`, left: `${10 + p.index * 15}%`,
              animationDelay: `${p.index * 0.7}s`, animationDuration: `${2 + p.index * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* 404 Number — parallax */}
        <div className="mb-6" style={{ transform: `translate(${mousePos.x * 0.15}px, ${mousePos.y * 0.15}px)` }}>
          <h1 className="text-[140px] md:text-[180px] font-semibold leading-none select-none"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 40%, #f97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 4px 12px rgba(59,130,246,0.15))',
            }}>
            404
          </h1>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-xl shadow-blue-100/50 flex items-center justify-center border border-gray-100"
              style={{ transform: `translate(${-mousePos.x * 0.08}px, ${-mousePos.y * 0.08}px)` }}>
              <Compass className="w-10 h-10 text-blue-500" style={{
                transform: `rotate(${mousePos.x * 2}deg)`,
                transition: 'transform 0.3s ease',
              }} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-bold">?</span>
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
          Trang không tồn tại
        </h2>
        <p className="text-gray-500 mb-8 text-base leading-relaxed max-w-sm mx-auto">
          Có vẻ trang bạn tìm đã bị di chuyển hoặc không có quyền truy cập. Hãy quay lại trang chủ.
        </p>

        {/* Primary CTA */}
        <Link to="/"
          className="inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-7 py-3.5 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold text-base shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-200/60 hover:-translate-y-0.5 active:translate-y-0">
          <Home className="w-5 h-5" />
          Về trang chủ
        </Link>

        {/* Secondary Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-5">
          <button onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <Link to="/properties"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
            <Building2 className="w-4 h-4" />
            Xem bất động sản
          </Link>
          <Link to="/properties"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
            <Search className="w-4 h-4" />
            Tìm kiếm
          </Link>
        </div>

        {/* Subtle branding */}
        <p className="text-xs text-gray-300 mt-12 font-medium tracking-wider uppercase">
          EraEstate - Nền tảng Bất Động Sản
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
