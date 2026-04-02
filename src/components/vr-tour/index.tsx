import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';
import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import { GalleryPlugin } from '@photo-sphere-viewer/gallery-plugin';
import { CompassPlugin } from '@photo-sphere-viewer/compass-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { Loader2 } from 'lucide-react';

import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/virtual-tour-plugin/index.css';
import '@photo-sphere-viewer/gallery-plugin/index.css';
import '@photo-sphere-viewer/compass-plugin/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';

import type { VRTourProps, VRScene } from './VRTourTypes';
import VRTourHeader from './VRTourHeader';
import VRTourControls from './VRTourControls';
import { HelpOverlay, WelcomeToast, captureScreenshot, AutoTourBadge } from './VRTourExtras';
import { getImageUrl } from '../../utils/imageUtils';

// ═══════════════════════════════════════════════════════════
// VR Tour — dùng plugin virtual-tour chính thức
// Mũi tên 3D chuyển cảnh + Gallery dải ảnh built-in
// ═══════════════════════════════════════════════════════════

const AUTO_TOUR_INTERVAL = 8; // seconds per scene

const VRTour: React.FC<VRTourProps> = ({
  isOpen,
  onClose,
  propertyImages,
  propertyTitle,
  propertyAddress,
}) => {
  // ─── Build scenes from DB images ───
  const scenes: VRScene[] = useMemo(() => {
    if (!propertyImages || propertyImages.length === 0) return [];
    return propertyImages.map((img, idx) => ({
      id: String(img.id || idx),
      name: img.description || `Ảnh ${idx + 1}`,
      panoramaUrl: getImageUrl(img.imageUrl) || img.imageUrl,
      description: img.description,
    }));
  }, [propertyImages]);

  // ─── State ───
  const [loading, setLoading] = useState(true);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentSceneName, setCurrentSceneName] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-tour state
  const [isAutoTouring, setIsAutoTouring] = useState(false);
  const [autoTourCountdown, setAutoTourCountdown] = useState(AUTO_TOUR_INTERVAL);

  const psvRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ─── Build virtual-tour nodes & links ───
  const tourNodes = useMemo(() => {
    return scenes.map((scene, idx) => ({
      id: scene.id,
      panorama: scene.panoramaUrl,
      name: scene.name,
      thumbnail: scene.panoramaUrl,
      caption: scene.description || scene.name,
      links: [
        // Link to previous
        ...(idx > 0 ? [{ nodeId: scenes[idx - 1].id, position: { yaw: Math.PI, pitch: 0 } }] : []),
        // Link to next
        ...(idx < scenes.length - 1 ? [{ nodeId: scenes[idx + 1].id, position: { yaw: 0, pitch: 0 } }] : []),
      ],
    }));
  }, [scenes]);

  // ─── Build gallery items ───
  const galleryItems = useMemo(() => {
    return scenes.map((scene) => ({
      id: scene.id,
      panorama: scene.panoramaUrl,
      name: scene.name,
      thumbnail: scene.panoramaUrl,
    }));
  }, [scenes]);

  // ─── Plugins ───
  const plugins = useMemo((): any[] => [
    [AutorotatePlugin, { autostartDelay: null, autorotateSpeed: '1rpm' }],
    [CompassPlugin, { size: '80px', position: 'bottom left' }],
    [MarkersPlugin, { markers: [] }],
    [GalleryPlugin, {
      items: galleryItems,
      visibleOnLoad: scenes.length > 1,
      hideOnClick: false,
    }],
    [VirtualTourPlugin, {
      renderMode: '3d',
      nodes: tourNodes,
      startNodeId: tourNodes[0]?.id,
    }],
  ], [tourNodes, galleryItems, scenes.length]);

  // ─── Viewer ready ───
  const handleReady = useCallback((instance: any) => {
    psvRef.current = instance;
    setLoading(false);

    // Listen for node changes from virtual-tour plugin
    const vtPlugin = instance.getPlugin(VirtualTourPlugin);
    if (vtPlugin) {
      vtPlugin.addEventListener('node-changed', (e: any) => {
        const nodeId = e.node?.id;
        const idx = scenes.findIndex((s) => s.id === nodeId);
        if (idx >= 0) {
          setCurrentSceneName(scenes[idx].name);
          setCurrentIndex(idx);
        }
      });
    }

    // Set initial scene info
    if (scenes.length > 0) {
      setCurrentSceneName(scenes[0].name);
      setCurrentIndex(0);
    }
  }, [scenes]);

  // ─── Auto-rotate ───
  const toggleAutoRotate = useCallback(() => {
    if (!psvRef.current) return;
    const plugin = psvRef.current.getPlugin(AutorotatePlugin);
    if (!plugin) return;
    if (isAutoRotating) plugin.stop(); else plugin.start();
    setIsAutoRotating((p) => !p);
  }, [isAutoRotating]);

  // ─── Zoom ───
  const zoomIn = useCallback(() => psvRef.current?.zoom(psvRef.current.getZoomLevel() + 20), []);
  const zoomOut = useCallback(() => psvRef.current?.zoom(psvRef.current.getZoomLevel() - 20), []);

  // ─── Reset view ───
  const resetView = useCallback(() => {
    psvRef.current?.animate({ yaw: 0, pitch: 0, zoom: 50, speed: '2rpm' });
  }, []);

  // ─── Fullscreen ───
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current.requestFullscreen();
  }, []);

  // ─── Screenshot ───
  const handleScreenshot = useCallback(() => {
    captureScreenshot(psvRef.current, propertyTitle);
  }, [propertyTitle]);

  // ─── Prev / Next via VirtualTourPlugin ───
  const goPrev = useCallback(() => {
    if (!psvRef.current || currentIndex <= 0) return;
    const vtPlugin = psvRef.current.getPlugin(VirtualTourPlugin);
    vtPlugin?.setCurrentNode(scenes[currentIndex - 1].id);
  }, [currentIndex, scenes]);

  const goNext = useCallback(() => {
    if (!psvRef.current || currentIndex >= scenes.length - 1) return;
    const vtPlugin = psvRef.current.getPlugin(VirtualTourPlugin);
    vtPlugin?.setCurrentNode(scenes[currentIndex + 1].id);
  }, [currentIndex, scenes]);

  // ─── Auto-tour toggle ───
  const toggleAutoTour = useCallback(() => {
    setIsAutoTouring((p) => {
      if (!p) setAutoTourCountdown(AUTO_TOUR_INTERVAL);
      return !p;
    });
  }, []);

  // ─── Auto-tour timer ───
  useEffect(() => {
    if (!isAutoTouring || loading) return;

    const timer = setInterval(() => {
      setAutoTourCountdown((prev) => {
        if (prev <= 1) {
          const nextIndex = currentIndex + 1;
          if (nextIndex < scenes.length) {
            goNext();
          } else {
            // Loop back to first scene
            const vtPlugin = psvRef.current?.getPlugin(VirtualTourPlugin);
            vtPlugin?.setCurrentNode(scenes[0].id);
          }
          return AUTO_TOUR_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoTouring, loading, currentIndex, scenes, goNext]);

  // ─── Keyboard shortcuts ───
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (showHelp && e.key !== 'Escape' && e.key !== 'h' && e.key !== 'H') return;
      switch (e.key) {
        case 'Escape': showHelp ? setShowHelp(false) : onClose(); break;
        case 'ArrowLeft': goPrev(); break;
        case 'ArrowRight': goNext(); break;
        case ' ': e.preventDefault(); toggleAutoRotate(); break;
        case '+': case '=': zoomIn(); break;
        case '-': zoomOut(); break;
        case 'f': case 'F': toggleFullscreen(); break;
        case 'h': case 'H': setShowHelp((p) => !p); break;
        case 's': case 'S': handleScreenshot(); break;
        case 't': case 'T': toggleAutoTour(); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose, goPrev, goNext, toggleAutoRotate, zoomIn, zoomOut, toggleFullscreen, handleScreenshot, showHelp, toggleAutoTour]);

  // ─── Reset on open ───
  useEffect(() => {
    if (isOpen && scenes.length > 0) {
      setLoading(true);
      setIsAutoRotating(false);
      setShowHelp(false);
      setShowWelcome(true);
      setIsAutoTouring(false);
      setCurrentIndex(0);
      setCurrentSceneName(scenes[0].name);
    }
  }, [isOpen, scenes]);

  if (!isOpen || scenes.length === 0) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-black flex flex-col select-none" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .psv-navbar { display: none !important; }
        .psv-gallery { border-top: 1px solid rgba(255,255,255,0.08) !important; background: rgba(0,0,0,0.7) !important; backdrop-filter: blur(12px) !important; }
        .psv-gallery-item { border-radius: 8px !important; overflow: hidden !important; }
        .psv-gallery-item--active { outline: 2px solid #ef4444 !important; outline-offset: 2px; }
        .psv-gallery-item-title { font-size: 10px !important; background: rgba(0,0,0,0.7) !important; }
        .psv-compass { opacity: 0.7; }
        .psv-virtual-tour-link { transition: transform 0.2s; }
        .psv-virtual-tour-link:hover { transform: scale(1.2); }
        @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out both; }
      `}</style>

      {/* Header */}
      <VRTourHeader
        propertyTitle={propertyTitle}
        propertyAddress={propertyAddress}
        sceneName={currentSceneName || scenes[0]?.name || ''}
        totalScenes={scenes.length}
        currentIndex={currentIndex}
        onClose={onClose}
      />

      {/* Auto-tour badge */}
      <AutoTourBadge
        isRunning={isAutoTouring}
        onToggle={toggleAutoTour}
        countdown={autoTourCountdown}
        totalScenes={scenes.length}
        currentIndex={currentIndex}
      />

      {/* Right-side Controls */}
      <VRTourControls
        isAutoRotating={isAutoRotating}
        onToggleAutoRotate={toggleAutoRotate}
        onPrevScene={goPrev}
        onNextScene={goNext}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetView={resetView}
        onFullscreen={toggleFullscreen}
        onScreenshot={handleScreenshot}
        onToggleHelp={() => setShowHelp((p) => !p)}
        onToggleAutoTour={toggleAutoTour}
        isAutoTouring={isAutoTouring}
        hasPrev={currentIndex > 0}
        hasNext={currentIndex < scenes.length - 1}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-[101] flex flex-col items-center justify-center bg-black/80">
          <Loader2 className="w-10 h-10 text-red-500 animate-spin mb-3" />
          <p className="text-white/70 text-sm">Đang tải VR Tour…</p>
        </div>
      )}

      {/* 360 Viewer with VirtualTour + Gallery built-in */}
      <div className="flex-1 w-full h-full">
        <ReactPhotoSphereViewer
          key={`vr-tour-${isOpen}`}
          src={scenes[0]?.panoramaUrl || ''}
          height="100vh"
          width="100%"
          onReady={handleReady}
          plugins={plugins}
          littlePlanet={false}
          defaultYaw={0}
          defaultPitch={0}
        />
      </div>

      {/* Welcome toast */}
      <WelcomeToast visible={showWelcome && !loading} onDismiss={() => setShowWelcome(false)} />

      {/* Help overlay */}
      <HelpOverlay isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
};

export default VRTour;
