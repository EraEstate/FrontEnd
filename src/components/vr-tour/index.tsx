import React, { useEffect, useState, useRef } from 'react';
import { X, MapPin, Maximize, Minimize, Loader2, ChevronLeft, ChevronRight, EyeOff } from 'lucide-react';
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';
import type { VRTourProps } from './VRTourTypes';
import { getImageUrl } from '../../utils/imageUtils';

const VRTour: React.FC<VRTourProps> = ({
  isOpen,
  onClose,
  propertyTitle,
  propertyAddress,
  propertyImages,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

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

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      if (propertyImages && propertyImages.length > 1) {
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, propertyImages]);

  const nextImage = () => {
    if (propertyImages && propertyImages.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % propertyImages.length);
    }
  };

  const prevImage = () => {
    if (propertyImages && propertyImages.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
    }
  };

  if (!isOpen) return null;

  if (!propertyImages || propertyImages.length === 0) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
        <div className="text-white text-center max-w-sm w-full bg-black/60 p-8 rounded-2xl border border-white/10 backdrop-blur-md">
          <EyeOff className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Chưa có ảnh 360 độ</h3>
          <p className="text-gray-400 text-sm mb-6">Bất động sản này hiện tại chưa được cung cấp hình ảnh 360 độ để trải nghiệm VR Tour.</p>
          <button 
            onClick={onClose} 
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 transition-colors rounded-xl font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  const currentImage = propertyImages[currentIndex];
  // Convert S3 URL to fully qualified URL if necessary
  const imageUrl = getImageUrl(currentImage?.imageUrl);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col select-none overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header mờ mờ sang trọng */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-start justify-between z-20 pointer-events-none bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex flex-col gap-1 pointer-events-auto max-w-[70%]">
          <h2 className="text-white text-lg md:text-xl font-semibold drop-shadow-md truncate">
            {propertyTitle || 'Tham quan căn hộ VR 360'}
          </h2>
          <div className="flex items-center text-white/80 text-xs md:text-sm drop-shadow-md truncate">
            <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
            <span className="truncate">{propertyAddress || 'Vị trí bất động sản'}</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-block px-2.5 py-1 bg-red-600/90 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-lg">
              VR Tour 360°
            </span>
            {propertyImages.length > 1 && (
              <span className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-lg border border-white/10">
                Góc nhìn {currentIndex + 1} / {propertyImages.length}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={toggleFullscreen}
            className="p-2.5 md:p-3 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full transition-all duration-200 border border-white/10 hover:border-white/30 shadow-lg"
            title="Toàn màn hình (F)"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2.5 md:p-3 bg-black/40 hover:bg-red-600/90 backdrop-blur-md text-white rounded-full transition-all duration-200 border border-white/10 hover:border-white/30 group shadow-lg"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Vùng hiển thị nội dung chính */}
      <div className="flex-1 w-full h-full relative bg-gray-900 cursor-grab active:cursor-grabbing">
        {imageUrl ? (
          <ReactPhotoSphereViewer
            key={imageUrl}
            src={imageUrl}
            height="100%"
            width="100%"
            navbar={[
              'zoom',
              'fullscreen',
              'caption',
              'description'
            ]}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Điều hướng nếu có nhiều ảnh */}
      {propertyImages.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-red-600/90 backdrop-blur-md text-white rounded-full transition-all duration-200 border border-white/10 hover:border-white/30 z-20 shadow-[0_0_20px_rgba(0,0,0,0.5)] group"
          >
            <ChevronLeft className="w-7 h-7 group-hover:-translate-x-1 transition-transform" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-red-600/90 backdrop-blur-md text-white rounded-full transition-all duration-200 border border-white/10 hover:border-white/30 z-20 shadow-[0_0_20px_rgba(0,0,0,0.5)] group"
          >
            <ChevronRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
          </button>
          
          {/* Thumbnails Navigator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-black/50 backdrop-blur-md p-2 rounded-2xl border border-white/10 flex gap-2 max-w-[90vw] overflow-x-auto shadow-2xl">
            {propertyImages.map((img, idx) => (
              <button
                key={img.id || idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 ${
                  idx === currentIndex 
                    ? 'ring-2 ring-red-500 scale-105' 
                    : 'opacity-50 hover:opacity-100'
                }`}
              >
                <img 
                  src={getImageUrl(img.imageUrl) || ''} 
                  alt={`View ${idx + 1}`} 
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default VRTour;
