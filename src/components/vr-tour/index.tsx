import React, { useMemo, useEffect, useState, useRef } from 'react';
import { X, MapPin, Maximize, Minimize, Loader2, Info, ExternalLink } from 'lucide-react';
import type { VRTourProps } from './VRTourTypes';

const VRTour: React.FC<VRTourProps> = ({
  isOpen,
  onClose,
  propertyTitle,
  propertyAddress,
  propertyLat,
  propertyLng,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  // Tạo URL nhúng Google Street View 360 mượt mà
  const streetViewUrl = useMemo(() => {
    if (typeof propertyLat === 'number' && typeof propertyLng === 'number') {
      // Ưu tiên dùng toạ độ chính xác (Latitude, Longitude)
      return `https://maps.google.com/maps?layer=c&cbll=${propertyLat},${propertyLng}&output=svembed`;
    }
    if (propertyAddress) {
      // Fallback dùng địa chỉ
      return `https://maps.google.com/maps?layer=c&q=${encodeURIComponent(propertyAddress)}&output=svembed`;
    }
    if (propertyTitle) {
      // Fallback dùng tên
      return `https://maps.google.com/maps?layer=c&q=${encodeURIComponent(propertyTitle)}&output=svembed`;
    }
    return '';
  }, [propertyLat, propertyLng, propertyAddress, propertyTitle]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    
    // Reset loading state khi mở lại
    setIsIframeLoading(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col select-none" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header mờ mờ sang trọng */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-start justify-between z-20 pointer-events-none bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex flex-col gap-1 pointer-events-auto max-w-[70%]">
          <h2 className="text-white text-lg md:text-xl font-semibold drop-shadow-md truncate">
            {propertyTitle || 'VR Tour 360'}
          </h2>
          <div className="flex items-center text-white/80 text-xs md:text-sm drop-shadow-md truncate">
            <MapPin className="w-3.5 h-3.5 mr-1" />
            <span className="truncate">{propertyAddress || 'Đang tải vị trí...'}</span>
          </div>
          <div className="mt-2">
            <span className="inline-block px-2.5 py-1 bg-red-600/90 backdrop-blur-md text-white text-[10px] font-medium rounded-full uppercase tracking-wider shadow-lg">
              Google Street View 360
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => window.open(`https://www.google.com/maps?q=${propertyLat || ''},${propertyLng || ''}`, '_blank')}
            className="p-2.5 md:p-3 bg-blue-600 hover:bg-blue-700 backdrop-blur-md text-white rounded-full transition-all duration-200 shadow-lg border border-white/20"
            title="Mở Google Maps (Có đầy đủ 360 độ)"
          >
            <ExternalLink className="w-5 h-5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2.5 md:p-3 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full transition-all duration-200 border border-white/10 hover:border-white/30"
            title="Toàn màn hình (F)"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2.5 md:p-3 bg-black/40 hover:bg-red-600/90 backdrop-blur-md text-white rounded-full transition-all duration-200 border border-white/10 hover:border-white/30 group"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Vùng hiển thị nội dung chính */}
      <div className="flex-1 w-full h-full relative flex items-center justify-center">
        
        {/* Loading Spinner sang trọng hiển thị khi iframe chưa load xong */}
        {streetViewUrl && isIframeLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0a0a0a]">
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute w-24 h-24 border-t-2 border-r-2 border-red-500 rounded-full animate-spin"></div>
              <div className="absolute w-20 h-20 border-b-2 border-l-2 border-red-500/50 rounded-full animate-[spin_1.5s_linear_reverse]"></div>
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h3 className="text-white text-lg font-medium tracking-wide">Đang kết nối VR Tour</h3>
            <p className="text-gray-500 text-sm mt-2">Vui lòng chờ trong giây lát...</p>
          </div>
        )}

        {/* Iframe hiển thị VR Tour từ Google Maps */}
        {streetViewUrl ? (
          <iframe
            title="Google Street View 360 VR"
            src={streetViewUrl}
            onLoad={() => setIsIframeLoading(false)}
            className={`w-full h-full border-0 transition-opacity duration-1000 ease-in-out ${isIframeLoading ? 'opacity-0' : 'opacity-100'}`}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="text-white/60 flex flex-col items-center z-10">
            <MapPin className="w-12 h-12 mb-3 opacity-50" />
            <p>Không tìm thấy dữ liệu vị trí để tải VR Tour.</p>
          </div>
        )}
      </div>

      {/* Hướng dẫn sử dụng VR/2D */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-[90%] max-w-lg transition-opacity duration-1000 ease-in-out">
        <div className="bg-black/80 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex items-start sm:items-center gap-3">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-white/90 text-[13px] sm:text-sm font-medium leading-relaxed">
            Khu vực này chưa có ảnh 360 độ. Vui lòng bấm vào nút màu xanh dương (🔗) ở góc trên cùng bên phải để mở vị trí này trên trang chủ Google Maps.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VRTour;
