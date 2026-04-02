import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, FeatureGroup, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { propertyAPI } from '../api/property';
import { ChevronLeft, MapPin, X, Loader2, Home } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { getImageUrl, getImagePlaceholder } from '../utils/imageUtils';

// Fix Leaflet marker icons issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom property icon
const propertyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const featureGroupRef = useRef<L.FeatureGroup>(null);
  
  // HCMC Coordinates
  const defaultCenter: [number, number] = [10.762622, 106.660172];
  
  const handleCreated = async (e: any) => {
    const type = e.layerType;
    const layer = e.layer;
    
    // Clear previous drawings to only have one search area
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
      featureGroupRef.current.addLayer(layer);
    }
    
    let polygon: number[][] = [];
    
    if (type === 'polygon' || type === 'rectangle') {
      const latlngs = layer.getLatLngs()[0];
      polygon = latlngs.map((ll: any) => [ll.lat, ll.lng]);
    } else if (type === 'circle') {
      // Circle approximation by bounding box for simplicity
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
        console.error('Lỗi tìm kiếm theo bản đồ:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleted = () => {
    setProperties([]);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)} tỷ`;
    if (price >= 1000000) return `${(price / 1000000).toFixed(0)} tr`;
    return price.toLocaleString();
  };

  return (
    <div className="h-screen w-full flex flex-col pt-16 bg-gray-50">
      {/* Header Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 z-10 relative">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-red-600" />
            <h1 className="text-xl font-bold text-gray-900">Tìm kiếm trên bản đồ</h1>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 hidden md:block">
          Sử dụng công cụ vẽ (Hình đa giác, Hình chữ nhật) để khoanh vùng tìm kiếm
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Results */}
        <div className={`w-full md:w-[400px] flex flex-col bg-white border-r border-gray-200 z-10 shadow-lg ${properties.length === 0 && !loading ? 'hidden md:flex' : 'flex'} transition-all duration-300 absolute md:relative h-[calc(100vh-64px)] md:h-auto`}>
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center sticky top-0 z-20">
            <h2 className="font-bold text-gray-900">Kết quả tìm kiếm</h2>
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-semibold">
              {properties.length} BDS
            </span>
            {properties.length > 0 && (
              <button className="md:hidden p-1 text-gray-500 hover:bg-gray-200 rounded" onClick={() => setProperties([])}>
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                <p>Đang tìm kiếm trong khu vực...</p>
              </div>
            ) : properties.length > 0 ? (
              properties.map((property) => (
                <Link 
                  key={property.id} 
                  to={`/properties/${property.id}`}
                  className="flex gap-3 border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all group p-2"
                >
                  <div 
                    className="w-24 h-24 flex-shrink-0 bg-cover bg-center rounded-md"
                    style={{ backgroundImage: `url(${getImageUrl(property.mainImageUrl || property.imageUrl) || getImagePlaceholder(200, 200)})` }}
                  />
                  <div className="flex-1 min-w-0 py-1">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-red-600 transition-colors mb-1">
                      {property.title}
                    </h3>
                    <div className="font-bold text-red-600 mb-1">
                      {formatPrice(property.price)}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 gap-2 truncate">
                      <span>{property.area}m²</span>
                      <span>•</span>
                      <span className="truncate">{property.address}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-gray-300" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Chưa có kết quả</p>
                  <p className="text-sm mt-1 max-w-[250px]">Vẽ một vùng trên bản đồ để xem các bất động sản trong khu vực đó.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative z-0">
          <MapContainer 
            center={defaultCenter} 
            zoom={13} 
            className="w-full h-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <FeatureGroup ref={featureGroupRef}>
              <EditControl
                position="topright"
                onCreated={handleCreated}
                onDeleted={handleDeleted}
                draw={{
                  rectangle: true,
                  polygon: true,
                  circle: true, // we mapped circle to bounding box
                  polyline: false,
                  marker: false,
                  circlemarker: false,
                }}
              />
            </FeatureGroup>

            {properties.map(p => {
              if (!p.latitude || !p.longitude) return null;
              return (
                <Marker 
                  key={p.id} 
                  position={[p.latitude, p.longitude]}
                  icon={propertyIcon}
                >
                  <Popup className="property-popup">
                    <div className="w-48">
                      <div 
                        className="h-24 w-full bg-cover bg-center rounded-t-sm"
                        style={{ backgroundImage: `url(${getImageUrl(p.mainImageUrl || p.imageUrl) || getImagePlaceholder(200, 150)})` }}
                      />
                      <div className="p-2">
                        <p className="font-bold text-red-600 text-sm mb-1">{formatPrice(p.price)}</p>
                        <p className="font-semibold text-xs text-gray-900 line-clamp-2 mb-1">{p.title}</p>
                        <Link to={`/properties/${p.id}`} className="block w-full text-center text-xs bg-red-600 text-white py-1.5 rounded mt-2 hover:bg-red-700">
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapSearchPage;
