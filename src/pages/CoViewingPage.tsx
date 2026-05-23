import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { propertyAPI } from '../api/property';
import { 
  connectWebSocket, 
  disconnectWebSocket, 
  subscribeToCoViewing, 
  sendCoViewingState
} from '../services/websocket';
import type { CoViewingPayload } from '../services/websocket';
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';
import { 
  Users, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Share2, 
  Compass, 
  Crown,
  Lock,
  Unlock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Settings
} from 'lucide-react';
import { getImageUrl, getImagePlaceholder } from '../utils/imageUtils';
import toast from '../utils/toast';

export const CoViewingPage: React.FC = () => {
  const { sessionToken } = useParams<{ sessionToken: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  // Parse query params (e.g. ?propertyId=xxx)
  const searchParams = new URLSearchParams(location.search);
  const propertyId = searchParams.get('propertyId');

  // Co-Viewing states
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasControl, setHasControl] = useState<boolean>(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [onlineUsersCount, setOnlineUsersCount] = useState<number>(2); // Mock count for UI premium feel
  const [connected, setConnected] = useState<boolean>(false);

  // Photo sphere viewer ref
  const viewerRef = useRef<any>(null);

  // Audio/Video mock toggles for custom overlays (since Jitsi handles actual call)
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  // Check if current user is the listing owner/agent to auto-assign controller rights
  useEffect(() => {
    if (property && user) {
      const isAgent = property.userId === user.id || user.role === 'STAFF' || user.role === 'ADMIN';
      setHasControl(isAgent);
    }
  }, [property, user]);

  // Load property details
  useEffect(() => {
    if (!propertyId) {
      toast.error('Mã bất động sản không hợp lệ!');
      setLoading(false);
      return;
    }
    setLoading(true);
    propertyAPI.getById(propertyId)
      .then((res) => {
        setProperty(res);
      })
      .catch((err) => {
        console.error('Failed to load property:', err);
        toast.error('Không thể tải thông tin bất động sản!');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [propertyId]);

  // Connect WebSocket & Subscribe to Co-Viewing channel
  useEffect(() => {
    if (!sessionToken) return;

    const handleCoViewingSync = (payload: CoViewingPayload) => {
      // If we are NOT the sender, update our view state
      if (payload.senderId !== user?.id) {
        // Sync scene index if changed
        if (payload.sceneId) {
          const index = parseInt(payload.sceneId, 10);
          if (!isNaN(index) && index !== activeSceneIndex) {
            setActiveSceneIndex(index);
          }
        }

        // Sync camera coordinates
        if (viewerRef.current && payload.yaw !== undefined && payload.pitch !== undefined) {
          // Temporarily disable callbacks to avoid infinite ping-pong loops
          viewerRef.current.animate({
            yaw: payload.yaw,
            pitch: payload.pitch,
            zoom: 50,
            speed: '10rpm'
          });
        }
      }
    };

    let unsubscribe: (() => void) | null = null;

    connectWebSocket(
      () => {
        setConnected(true);
        unsubscribe = subscribeToCoViewing(sessionToken, handleCoViewingSync);
      },
      (err) => {
        console.error('WS Error:', err);
        toast.error('Kết nối máy chủ WebSocket thất bại!');
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
      disconnectWebSocket();
    };
  }, [sessionToken, user, activeSceneIndex]);

  // Handle local rotation (Publish updates to other participants)
  const handlePositionChange = useCallback((position: { yaw: number; pitch: number }) => {
    if (hasControl && sessionToken && user) {
      sendCoViewingState(
        sessionToken,
        user.id,
        position.yaw,
        position.pitch,
        activeSceneIndex.toString()
      );
    }
  }, [hasControl, sessionToken, user, activeSceneIndex]);

  // Handle scene (image) hopping
  const handleSceneChange = (index: number) => {
    setActiveSceneIndex(index);
    if (hasControl && sessionToken && user) {
      sendCoViewingState(
        sessionToken,
        user.id,
        0, // Reset yaw for new scene
        0, // Reset pitch for new scene
        index.toString()
      );
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Đã sao chép liên kết chia sẻ phòng xem chung!');
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
        <p className="text-sm font-semibold tracking-wide text-gray-400">Đang khởi tạo phòng xem nhà ảo Co-Viewing...</p>
      </div>
    );
  }

  // Get active images
  const images = property?.images || [];
  if (images.length === 0) {
    return (
      <div className="h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-6 text-center text-white">
        <div className="max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
          <Compass className="w-16 h-16 text-gray-500 mx-auto mb-4 animate-bounce" />
          <h3 className="text-xl font-black mb-2">Bất động sản chưa có ảnh 360°</h3>
          <p className="text-gray-400 text-xs mb-6 leading-relaxed">
            Chức năng Co-Viewing yêu cầu bất động sản phải có sẵn hình ảnh Panorama 360 độ. Vui lòng quay lại sau khi chủ nhà đã bổ sung dữ liệu VR Tour.
          </p>
          <button onClick={() => navigate(-1)} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all text-xs">
            Quay lại trang chi tiết BĐS
          </button>
        </div>
      </div>
    );
  }

  const currentImage = images[activeSceneIndex];
  const imageUrl = getImageUrl(currentImage?.imageUrl);

  return (
    <div className="h-screen w-full bg-[#030303] overflow-hidden flex relative select-none" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* 1. TOP CONTROL HEADER */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-start justify-between z-20 pointer-events-none bg-gradient-to-b from-black/85 via-black/40 to-transparent">
        <div className="flex flex-col gap-1 pointer-events-auto max-w-[50%]">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate(-1)} 
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white backdrop-blur-md border border-white/10 transition-all mr-1"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-white text-base md:text-lg font-black drop-shadow-md truncate">
              🔴 Co-Viewing: {property?.title}
            </h2>
          </div>
          
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow-lg">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              Xem nhà chung 360
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/15 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase border border-white/10">
              <Users className="w-3 h-3 mr-0.5" />
              {onlineUsersCount} trực tuyến
            </span>
            {hasControl ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 text-black text-[10px] font-black rounded-full uppercase shadow-md">
                <Crown className="w-3 h-3" /> Bạn giữ Tour Guide
              </span>
            ) : (
              <button 
                onClick={() => {
                  setHasControl(true);
                  toast.success('Bạn đã chiếm quyền dẫn Tour thành công!');
                }}
                className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-gray-100 text-black text-[10px] font-black rounded-full uppercase shadow-md transition-all active:scale-95"
              >
                <Lock className="w-3 h-3 text-red-600" /> Nhận quyền dẫn tour
              </button>
            )}
          </div>
        </div>

        {/* Share & Options Area */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <button
            onClick={copyShareLink}
            className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl transition-all border border-white/10 flex items-center gap-1.5 text-xs font-black shadow-lg"
            title="Copy link mời người khác vào xem chung"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>Mời xem chung</span>
          </button>
        </div>
      </div>

      {/* 2. FULLSCREEN 360 PANORAMA VIEWER */}
      <div className="flex-1 h-full w-full relative z-0">
        {imageUrl ? (
          <ReactPhotoSphereViewer
            key={`${imageUrl}-${activeSceneIndex}`}
            src={imageUrl}
            height="100%"
            width="100%"
            navbar={['zoom', 'caption']}
            onPositionChange={handlePositionChange}
            onReady={(instance) => {
              viewerRef.current = instance;
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* 3. MULTI-SCENE SCENE SELECTOR (Bottom Left) */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-6 z-20 max-w-[60vw]">
          <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider mb-2 drop-shadow-md">Chọn khu vực tham quan</p>
          <div className="flex gap-2.5 overflow-x-auto p-2 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl custom-scrollbar">
            {images.map((img: any, idx: number) => {
              const isActive = idx === activeSceneIndex;
              return (
                <button
                  key={img.id || idx}
                  onClick={() => handleSceneChange(idx)}
                  className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 transition-all duration-200 ${
                    isActive 
                      ? 'ring-2 ring-red-500 scale-105 shadow-lg opacity-100' 
                      : 'opacity-50 hover:opacity-90'
                  }`}
                >
                  <img 
                    src={getImageUrl(img.imageUrl) || getImagePlaceholder(100, 80)} 
                    alt={`Scene ${idx + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <span className="text-[10px] font-black text-white px-1.5 py-0.5 bg-black/40 rounded-md">
                      #{idx + 1}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. REAL-TIME JITSI VOICE CALL IFRAME overlay (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-30 w-72 md:w-80 bg-gray-950/95 border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden backdrop-blur-md flex flex-col">
        {/* Call Panel Header */}
        <div className="p-3.5 bg-gradient-to-r from-red-950/50 to-rose-950/50 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <h4 className="text-xs font-bold text-white tracking-wide">Cuộc gọi thoại (Jitsi)</h4>
          </div>
          <span className="text-[9px] bg-white/15 px-2 py-0.5 rounded text-white/80 font-bold uppercase">
            Hội thoại
          </span>
        </div>

        {/* Embedded Jitsi IFrame */}
        <div className="h-48 w-full bg-[#111111] relative">
          <iframe
            src={`https://meet.jit.si/coviewing-${sessionToken}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=true`}
            allow="camera; microphone; display-capture"
            className="w-full h-full border-0 rounded-b-xl"
            title="Co-Viewing Jitsi Meet Video Call"
          />
        </div>

        {/* Local Sync Indicator */}
        <div className="p-3 bg-white/5 flex items-center justify-between text-[10px]">
          <span className="text-gray-400 font-medium">Trạng thái đồng bộ:</span>
          {connected ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              🟢 Đang đồng bộ hóa
            </span>
          ) : (
            <span className="text-red-400 font-bold flex items-center gap-1">
              🔴 Mất kết nối
            </span>
          )}
        </div>
      </div>

    </div>
  );
};

export default CoViewingPage;
