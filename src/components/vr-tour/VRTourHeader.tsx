import React from 'react';
import { X, MapPin, Image } from 'lucide-react';

interface Props {
  propertyTitle?: string;
  propertyAddress?: string;
  sceneName: string;
  totalScenes: number;
  currentIndex: number;
  onClose: () => void;
}

const VRTourHeader: React.FC<Props> = ({
  propertyTitle,
  propertyAddress,
  sceneName,
  totalScenes,
  currentIndex,
  onClose,
}) => (
  <div className="absolute top-0 left-0 right-0 z-[102] flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
    {/* Left — branding + property info */}
    <div className="flex items-center gap-3 pointer-events-auto min-w-0">
      {/* VR badge */}
      <span className="flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg flex-shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
        VR 360°
      </span>

      {/* Property title */}
      {propertyTitle && (
        <div className="hidden sm:block min-w-0">
          <div className="text-white/90 text-sm font-medium truncate max-w-[240px]">
            {propertyTitle}
          </div>
          {propertyAddress && (
            <div className="flex items-center gap-1 text-white/50 text-[11px] truncate max-w-[240px]">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {propertyAddress}
            </div>
          )}
        </div>
      )}

      {/* Scene indicator */}
      <span className="flex items-center gap-1.5 text-white/60 text-xs bg-white/10 px-2.5 py-1 rounded-full flex-shrink-0">
        <Image className="w-3 h-3" />
        {sceneName} ({currentIndex + 1}/{totalScenes})
      </span>
    </div>

    {/* Right — close */}
    <button
      onClick={onClose}
      className="pointer-events-auto p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
      title="Đóng (Esc)"
    >
      <X className="w-5 h-5" />
    </button>
  </div>
);

export default VRTourHeader;
