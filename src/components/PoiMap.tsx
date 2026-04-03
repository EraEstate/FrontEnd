import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Loader2 } from 'lucide-react';
import { formatDistance } from '../utils/format';

interface POI {
  id: number;
  lat: number;
  lon: number;
  name: string;
  type: string;
  distance?: number;
}

interface Props {
  lat: number;
  lng: number;
  address?: string;
}

/* ── SVG Icon Factory ── */
const svgIcon = (pathD: string, color: string) =>
  L.divIcon({
    html: `<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.25)">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${pathD}</svg>
    </div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });

// Lucide-style SVG paths
const SVG_PATHS: Record<string, string> = {
  school:    '<path d="m4 6 8-4 8 4"/><path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"/><path d="M14 22v-4a2 2 0 0 0-4 0v4"/><path d="M18 5v17"/><path d="M6 5v17"/>',
  hospital:  '<path d="M12 6v4"/><path d="M14 14h-4"/><path d="M14 18h-4"/><path d="M14 8h-4"/><rect width="16" height="20" x="4" y="2" rx="2"/>',
  shop:      '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  park:      '<path d="M17 14v7"/><path d="M7 14v7"/><path d="M12 2a5 5 0 0 0-5 5c0 2 1.5 3.5 3 4.5L12 13l2-1.5c1.5-1 3-2.5 3-4.5a5 5 0 0 0-5-5Z"/>',
  transport: '<rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><circle cx="7.5" cy="15.5" r="1.5" fill="white"/><circle cx="16.5" cy="15.5" r="1.5" fill="white"/><path d="M7 19l-2 3"/><path d="M17 19l2 3"/>',
};

const SVG_COLORS: Record<string, string> = {
  school: '#3b82f6',
  hospital: '#ef4444',
  shop: '#f59e0b',
  park: '#10b981',
  transport: '#8b5cf6',
};

const homeIcon = L.divIcon({
  html: `<div style="width:20px;height:20px;background:#ef4444;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(239,68,68,.5)"></div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -12],
});

const POI_CATEGORIES = [
  { key: 'school',    label: 'Trường học',    query: '"amenity"~"school|university|college"' },
  { key: 'hospital',  label: 'Y tế',          query: '"amenity"~"hospital|clinic|pharmacy"' },
  { key: 'shop',      label: 'Mua sắm',       query: '"shop"~"supermarket|mall|convenience"' },
  { key: 'park',      label: 'Công viên',      query: '"leisure"~"park|garden|playground"' },
  { key: 'transport', label: 'Giao thông',     query: '"amenity"~"bus_station|ferry_terminal"|"highway"="bus_stop"' },
];

const RADIUS_OPTIONS = [500, 1000, 2000];

const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3;
  const f1 = (lat1 * Math.PI) / 180;
  const f2 = (lat2 * Math.PI) / 180;
  const df = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(df / 2) ** 2 + Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const RecenterMap: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], map.getZoom()); }, [lat, lng, map]);
  return null;
};

const PoiMap: React.FC<Props> = ({ lat, lng, address }) => {
  const [radius, setRadius] = useState(1000);
  const [activeCategories, setActiveCategories] = useState<string[]>(['school', 'hospital', 'shop']);
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleCategory = (key: string) => {
    setActiveCategories(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const fetchPOIs = useCallback(async () => {
    if (activeCategories.length === 0) { setPois([]); return; }
    setLoading(true);
    try {
      const queries = activeCategories.map(catKey => {
        const cat = POI_CATEGORIES.find(c => c.key === catKey);
        return cat ? `node[${cat.query}](around:${radius},${lat},${lng});` : '';
      }).filter(Boolean);

      const overpassQuery = `[out:json][timeout:10];(${queries.join('')});out body 30;`;
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: `data=${encodeURIComponent(overpassQuery)}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const data = await res.json();

      const results: POI[] = (data.elements || []).map((el: any) => {
        const dist = haversine(lat, lng, el.lat, el.lon);
        const tags = el.tags || {};
        let type = 'shop';
        if (tags.amenity?.match(/school|university|college/)) type = 'school';
        else if (tags.amenity?.match(/hospital|clinic|pharmacy/)) type = 'hospital';
        else if (tags.shop?.match(/supermarket|mall|convenience/)) type = 'shop';
        else if (tags.leisure?.match(/park|garden|playground/)) type = 'park';
        else if (tags.amenity?.match(/bus_station|ferry_terminal/) || tags.highway === 'bus_stop') type = 'transport';
        return { id: el.id, lat: el.lat, lon: el.lon, name: tags.name || tags['name:vi'] || 'Không tên', type, distance: Math.round(dist) };
      });
      setPois(results);
    } catch (err) {
      console.error('POI fetch error:', err);
      setPois([]);
    } finally {
      setLoading(false);
    }
  }, [lat, lng, radius, activeCategories]);

  useEffect(() => { if (lat && lng) fetchPOIs(); }, [fetchPOIs, lat, lng]);

  const getCategoryLabel = (type: string) => POI_CATEGORIES.find(c => c.key === type)?.label || type;
  const getMarkerIcon = (type: string) => svgIcon(SVG_PATHS[type] || SVG_PATHS.shop, SVG_COLORS[type] || '#6b7280');

  const formatDist = formatDistance;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Tiện ích khu vực</h2>
              <p className="text-xs text-gray-500">Khám phá các tiện ích xung quanh vị trí này</p>
            </div>
          </div>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-red-500" />}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {POI_CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => toggleCategory(cat.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                activeCategories.includes(cat.key)
                  ? 'text-white border-transparent'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
              style={activeCategories.includes(cat.key) ? { backgroundColor: SVG_COLORS[cat.key] } : {}}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeCategories.includes(cat.key) ? 'white' : SVG_COLORS[cat.key] }} />
              {cat.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            {RADIUS_OPTIONS.map(r => (
              <button
                key={r}
                onClick={() => setRadius(r)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  radius === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r >= 1000 ? `${r / 1000}km` : `${r}m`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ height: '360px' }}>
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap lat={lat} lng={lng} />

          <Marker position={[lat, lng]} icon={homeIcon}>
            <Popup><strong className="text-sm">Vị trí BĐS</strong>{address && <p className="text-xs text-gray-600 mt-1">{address}</p>}</Popup>
          </Marker>

          <Circle
            center={[lat, lng]}
            radius={radius}
            pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.04, weight: 1.5, dashArray: '6 4' }}
          />

          {pois.map(poi => (
            <Marker key={poi.id} position={[poi.lat, poi.lon]} icon={getMarkerIcon(poi.type)}>
              <Popup>
                <div className="min-w-[140px]">
                  <p className="font-semibold text-sm text-gray-900">{poi.name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SVG_COLORS[poi.type] }} />
                    <span className="text-xs text-gray-500">{getCategoryLabel(poi.type)}</span>
                    <span className="text-xs text-gray-400 ml-auto">{formatDist(poi.distance || 0)}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* POI List */}
      {pois.length > 0 && (
        <div className="p-5 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tiện ích gần nhất</p>
            <p className="text-xs text-gray-400">{pois.length} kết quả</p>
          </div>
          <div className="space-y-1 max-h-52 overflow-y-auto">
            {pois
              .sort((a, b) => (a.distance || 0) - (b.distance || 0))
              .slice(0, 12)
              .map(poi => (
                <div key={poi.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: SVG_COLORS[poi.type] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{poi.name}</p>
                    <p className="text-xs text-gray-400">{getCategoryLabel(poi.type)}</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">{formatDist(poi.distance || 0)}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {pois.length === 0 && !loading && activeCategories.length > 0 && (
        <div className="p-6 text-center border-t border-gray-100">
          <p className="text-sm text-gray-400">Không tìm thấy tiện ích nào trong bán kính {radius >= 1000 ? `${radius / 1000}km` : `${radius}m`}</p>
        </div>
      )}
    </div>
  );
};

export default PoiMap;
