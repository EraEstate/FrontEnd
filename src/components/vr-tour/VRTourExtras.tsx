import React, { useEffect, useState, useRef } from 'react';
import { PlayCircle, PauseCircle, Keyboard, Camera, X, Monitor } from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// Auto-Tour: tự động chuyển scene theo timer
// ═══════════════════════════════════════════════════════════

interface AutoTourProps {
  isRunning: boolean;
  onToggle: () => void;
  /** Seconds remaining before next scene */
  countdown: number;
  totalScenes: number;
  currentIndex: number;
}

export const AutoTourBadge: React.FC<AutoTourProps> = ({
  isRunning, onToggle, countdown, totalScenes, currentIndex,
}) => {
  if (!isRunning) return null;

  const progress = ((currentIndex + 1) / totalScenes) * 100;

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[102]">
      <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 shadow-2xl">
        <button onClick={onToggle} className="text-red-400 hover:text-red-300 transition-colors">
          <PauseCircle className="w-5 h-5" />
        </button>
        <div className="flex flex-col min-w-[120px]">
          <div className="flex items-center justify-between text-[10px] text-white/50 mb-0.5">
            <span>Đang tự động tour</span>
            <span>{countdown}s</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// Help Overlay: hiển thị phím tắt
// ═══════════════════════════════════════════════════════════

interface HelpOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: '← →', desc: 'Chuyển ảnh trước / sau' },
  { key: 'Space', desc: 'Bật/tắt tự động xoay' },
  { key: 'T', desc: 'Bật/tắt chế độ Auto-tour' },
  { key: '+ / -', desc: 'Phóng to / Thu nhỏ' },
  { key: 'F', desc: 'Toàn màn hình' },
  { key: 'H', desc: 'Hiện/ẩn hướng dẫn này' },
  { key: 'S', desc: 'Chụp ảnh màn hình' },
  { key: 'Esc', desc: 'Đóng VR Tour' },
];

export const HelpOverlay: React.FC<HelpOverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[105] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gray-900/95 border border-white/10 rounded-2xl p-6 w-80 max-w-[90vw] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Keyboard className="w-4 h-4 text-red-400" />
            Phím tắt VR Tour
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="flex items-center justify-between">
              <span className="text-white/60 text-xs">{s.desc}</span>
              <kbd className="text-[11px] text-white/80 bg-white/10 border border-white/10 px-2 py-0.5 rounded font-mono">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-[11px] text-white/30">
          <Monitor className="w-3.5 h-3.5" />
          Kéo chuột để xoay camera • Cuộn để zoom
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// Screenshot: chụp ảnh canvas hiện tại
// ═══════════════════════════════════════════════════════════

export function captureScreenshot(psvInstance: any, propertyTitle?: string) {
  if (!psvInstance) return;

  try {
    // PSV stores the Three.js renderer internally
    const renderer = psvInstance.renderer?.renderer;
    if (!renderer) return;

    const canvas = renderer.domElement as HTMLCanvasElement;
    const dataUrl = canvas.toDataURL('image/png');

    // Trigger download
    const link = document.createElement('a');
    link.download = `vr-tour-${propertyTitle?.replace(/\s+/g, '-') || 'screenshot'}-${Date.now()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.warn('Screenshot failed:', err);
  }
}

// ═══════════════════════════════════════════════════════════
// Welcome toast khi mở VR lần đầu
// ═══════════════════════════════════════════════════════════

interface WelcomeToastProps {
  visible: boolean;
  onDismiss: () => void;
}

export const WelcomeToast: React.FC<WelcomeToastProps> = ({ visible, onDismiss }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onDismiss, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-[103] animate-fade-in">
      <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 text-center shadow-2xl max-w-sm">
        <p className="text-white/80 text-xs leading-relaxed">
          Kéo chuột để quan sát xung quanh • Cuộn để zoom • Bấm <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono mx-0.5">H</kbd> để xem phím tắt
        </p>
      </div>
    </div>
  );
};
