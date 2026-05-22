import React from 'react';
import {
  Play, Pause, SkipForward, SkipBack,
  Maximize, ZoomIn, ZoomOut, RotateCcw,
  Camera, Keyboard, ListVideo,
} from 'lucide-react';

interface Props {
  isAutoRotating: boolean;
  onToggleAutoRotate: () => void;
  onPrevScene: () => void;
  onNextScene: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onFullscreen: () => void;
  onScreenshot: () => void;
  onToggleHelp: () => void;
  onToggleAutoTour: () => void;
  isAutoTouring: boolean;
  hasPrev: boolean;
  hasNext: boolean;
}

const Btn: React.FC<{
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}> = ({ onClick, active, disabled, title, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2.5 rounded-xl transition-all border ${
      disabled
        ? 'opacity-20 cursor-not-allowed border-white/5 bg-gray-950/20 text-white/20'
        : active
          ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30'
          : 'bg-gray-950/50 backdrop-blur-sm border-white/10 text-white/70 hover:bg-white/15 hover:text-white'
    }`}
  >
    {children}
  </button>
);

const VRTourControls: React.FC<Props> = ({
  isAutoRotating, onToggleAutoRotate,
  onPrevScene, onNextScene,
  onZoomIn, onZoomOut,
  onResetView, onFullscreen,
  onScreenshot, onToggleHelp,
  onToggleAutoTour, isAutoTouring,
  hasPrev, hasNext,
}) => (
  <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[102] flex flex-col gap-1.5">
    <Btn onClick={onPrevScene} disabled={!hasPrev} title="Ảnh trước (←)">
      <SkipBack className="w-4 h-4" />
    </Btn>
    <Btn onClick={onNextScene} disabled={!hasNext} title="Ảnh tiếp (→)">
      <SkipForward className="w-4 h-4" />
    </Btn>

    <div className="w-full h-px bg-white/10 my-0.5" />

    <Btn onClick={onToggleAutoRotate} active={isAutoRotating} title="Tự động xoay (Space)">
      {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
    </Btn>
    <Btn onClick={onToggleAutoTour} active={isAutoTouring} title="Auto-tour toàn bộ (T)">
      <ListVideo className="w-4 h-4" />
    </Btn>
    <Btn onClick={onZoomIn} title="Phóng to (+)">
      <ZoomIn className="w-4 h-4" />
    </Btn>
    <Btn onClick={onZoomOut} title="Thu nhỏ (-)">
      <ZoomOut className="w-4 h-4" />
    </Btn>
    <Btn onClick={onResetView} title="Về góc nhìn ban đầu">
      <RotateCcw className="w-4 h-4" />
    </Btn>

    <div className="w-full h-px bg-white/10 my-0.5" />

    <Btn onClick={onScreenshot} title="Chụp ảnh (S)">
      <Camera className="w-4 h-4" />
    </Btn>
    <Btn onClick={onFullscreen} title="Toàn màn hình (F)">
      <Maximize className="w-4 h-4" />
    </Btn>
    <Btn onClick={onToggleHelp} title="Phím tắt (H)">
      <Keyboard className="w-4 h-4" />
    </Btn>
  </div>
);

export default VRTourControls;
