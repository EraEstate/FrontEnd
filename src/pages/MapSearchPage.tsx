import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, FeatureGroup, CircleMarker, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { propertyAPI } from '../api/property';
import { ChevronLeft, MapPin, X, Loader2, Layers } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { getImageUrl, getImagePlaceholder } from '../utils/imageUtils';
import { formatVND } from '../utils/format';
import toast from '../utils/toast';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const propertyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// Heatmap color scale: green (cheap) → yellow → orange → red (expensive)
const getHeatColor = (normalized: number) => {
  if (normalized < 0.25) return '#22c55e'; // green
  if (normalized < 0.5) return '#eab308';  // yellow
  if (normalized < 0.75) return '#f97316'; // orange
  return '#ef4444';                        // red
};

const MapSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [heatmapMode, setHeatmapMode] = useState(false);
  const [heatLoading, setHeatLoading] = useState(false);
  const featureGroupRef = useRef<L.FeatureGroup>(null);
  
  const defaultCenter: [number, number] = [10.762622, 106.660172];

  // Load all properties for heatmap
  useEffect(() => {
    if (heatmapMode && allProperties.length === 0) {
      setHeatLoading(true);
      propertyAPI.search({ size: 200 })
        .then(res => {
          const props = (res.content || res || []).filter((p: any) => p.latitude && p.longitude && p.price && p.area);
          setAllProperties(props);
        })
        .catch(() => {})
        .finally(() => setHeatLoading(false));
    }
  }, [heatmapMode]);

  // Compute price range for normalization
  const priceRange = React.useMemo(() => {
    if (allProperties.length === 0) return { min: 0, max: 1 };
    const prices = allProperties.map(p => Number(p.price) / Number(p.area));
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [allProperties]);

  const handleCreated = async (e: any) => {
    const type = e.layerType;
    const layer = e.layer;
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
      featureGroupRef.current.addLayer(layer);
    }
    let polygon: number[][] = [];
    if (type === 'polygon' || type === 'rectangle') {
      polygon = layer.getLatLngs()[0].map((ll: any) => [ll.lat, ll.lng]);
    } else if (type === 'circle') {
      const bounds = layer.getBounds();
      polygon = [
        [bounds.getNorthWest().lat, bounds.getNorthWest().lng],
        [bounds.getNorthEast().lat, bounds.getNorthEast().lng],
        [bounds.getSouthEast().lat, bounds.getSouthEast().lng],
        [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
        [bounds.getNorthWest().lat, bounds.getNorthWest().lng],
      ];
    }
    if (polygon.length > 0) {
      try {
        setLoading(true);
        const res = await propertyAPI.searchByGeo(polygon);
        setProperties(res);
      } catch (err) {
        toast.error('Lỗi tìm kiếm trên bản đồ');
      } finally {
        setLoading(false);
      }
    }
  };

  const formatPrice = formatVND;

  return (
    <div className="h-screen w-full flex flex-col pt-16 bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 h-14 flex items-center justify-between px-4 z-10 relative">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-600" />
            <h1 className="text-lg font-bold text-gray-900">Tìm kiếm trên bản đồ</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Heatmap Toggle */}
          <button
            onClick={() => setHeatmapMode(!heatmapMode)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              heatmapMode
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Bản đồ nhiệt
          </button>
          <p className="text-sm text-gray-500 hidden lg:block">Vẽ vùng để tìm kiếm BĐS</p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`w-full md:w-[380px] flex flex-col bg-white border-r border-gray-200 z-10 shadow-lg ${properties.length === 0 && !loading ? 'hidden md:flex' : 'flex'} absolute md:relative h-[calc(100vh-64px)] md:h-auto`}>
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center sticky top-0 z-20">
            <h2 className="font-bold text-gray-900 text-sm">Kết quả tìm kiếm</h2>
            <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-semibold">{properties.length}</span>
            {properties.length > 0 && (
              <button className="md:hidden p-1 text-gray-500 hover:bg-gray-200 rounded" onClick={() => setProperties([])}><X className="w-4 h-4" /></button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-3">
                <Loader2 className="w-7 h-7 animate-spin text-red-600" />
                <p className="text-sm">Đang tìm kiếm...</p>
              </div>
            ) : properties.length > 0 ? (
              properties.map(p => (
                <Link key={p.id} to={`/properties/${p.id}`} className="flex gap-3 border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-all group p-2">
                  <div className="w-20 h-20 flex-shrink-0 bg-cover bg-center rounded-lg" style={{ backgroundImage: `url(${getImageUrl(p.mainImageUrl || p.imageUrl) || getImagePlaceholder(200, 200)})` }} />
                  <div className="flex-1 min-w-0 py-0.5">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-red-600 transition-colors mb-1">{p.title}</h3>
                    <div className="font-bold text-red-600 text-sm">{formatPrice(p.price)}</div>
                    <div className="text-xs text-gray-400 truncate mt-0.5">{p.area}m² • {p.address}</div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-3">
                <MapPin className="w-10 h-10 opacity-30" />
                <div>
                  <p className="font-medium text-gray-600 text-sm">Chưa có kết quả</p>
                  <p className="text-xs mt-1 max-w-[220px]">Vẽ một vùng trên bản đồ để tìm</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative z-0">
          <MapContainer center={defaultCenter} zoom={13} className="w-full h-full" zoomControl={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FeatureGroup ref={featureGroupRef}>
              <EditControl
                position="topright"
                onCreated={handleCreated}
                onDeleted={() => setProperties([])}
                draw={{ rectangle: true, polygon: true, circle: true, polyline: false, marker: false, circlemarker: false }}
              />
            </FeatureGroup>

            {/* Heatmap Layer */}
            {heatmapMode && allProperties.map(p => {
              const pricePerSqm = Number(p.price) / Number(p.area);
              const normalized = priceRange.max > priceRange.min
                ? (pricePerSqm - priceRange.min) / (priceRange.max - priceRange.min)
                : 0.5;
              return (
                <CircleMarker
                  key={`heat-${p.id}`}
                  center={[p.latitude, p.longitude]}
                  radius={12}
                  pathOptions={{ color: 'transparent', fillColor: getHeatColor(normalized), fillOpacity: 0.55, weight: 0 }}
                >
                  <Popup>
                    <div className="min-w-[120px]">
                      <p className="font-semibold text-xs text-gray-900">{p.title}</p>
                      <p className="text-xs text-red-600 font-bold mt-0.5">{formatPrice(p.price)}</p>
                      <p className="text-[10px] text-gray-400">{formatPrice(Math.round(pricePerSqm))}/m²</p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            {/* Normal Markers */}
            {!heatmapMode && properties.map(p => {
              if (!p.latitude || !p.longitude) return null;
              return (
                <Marker key={p.id} position={[p.latitude, p.longitude]} icon={propertyIcon}>
                  <Popup>
                    <div className="w-44">
                      <div className="h-20 w-full bg-cover bg-center rounded-t" style={{ backgroundImage: `url(${getImageUrl(p.mainImageUrl || p.imageUrl) || getImagePlaceholder(200, 150)})` }} />
                      <div className="p-2">
                        <p className="font-bold text-red-600 text-sm mb-0.5">{formatPrice(p.price)}</p>
                        <p className="font-semibold text-[11px] text-gray-900 line-clamp-2 mb-1">{p.title}</p>
                        <Link to={`/properties/${p.id}`} className="block text-center text-[11px] bg-red-600 text-white py-1 rounded hover:bg-red-700">Xem chi tiết</Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Heatmap Legend + Stats */}
          {heatmapMode && (
            <div className="absolute bottom-6 left-4 z-[1000] bg-white rounded-xl shadow-lg border border-gray-100 p-4 min-w-[180px]">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Bản đồ nhiệt giá / m²</p>
              
              {/* Gradient Bar */}
              <div className="h-2.5 rounded-full mb-1.5" style={{ background: 'linear-gradient(to right, #22c55e, #eab308, #f97316, #ef4444)' }} />
              <div className="flex justify-between text-[10px] text-gray-400 mb-3">
                <span>{allProperties.length > 0 ? formatPrice(priceRange.min) : '—'}</span>
                <span>{allProperties.length > 0 ? formatPrice(priceRange.max) : '—'}/m²</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-lg font-bold text-gray-900">{allProperties.length}</p>
                  <p className="text-[10px] text-gray-400">BĐS hiển thị</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {allProperties.length > 0 ? formatPrice(Math.round(allProperties.reduce((s, p) => s + Number(p.price) / Number(p.area), 0) / allProperties.length)) : '—'}
                  </p>
                  <p className="text-[10px] text-gray-400">Giá TB/m²</p>
                </div>
              </div>

              {heatLoading && <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Đang tải dữ liệu...</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapSearchPage;
