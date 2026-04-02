import React from 'react';
import { useCompareStore } from '../store/compareStore';
import { X, ChevronUp, ChevronDown, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl, getImagePlaceholder } from '../utils/imageUtils';

const CompareFloatingBar: React.FC = () => {
  const { compareList, removeProperty, clearCompare, isOpen, setIsOpen } = useCompareStore();
  const navigate = useNavigate();

  if (compareList.length === 0) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 glass shadow-[0_-8px_30px_rgb(0,0,0,0.08)] border-t border-gray-100/50 z-50 transition-transform duration-500 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-48px)]'}`}>
      {/* Header / Toggle Handle */}
      <div 
        className="h-12 bg-gray-900/95 backdrop-blur-sm text-white flex items-center justify-between px-6 cursor-pointer hover:bg-gray-900 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5" />
          <span className="font-semibold">So sánh bất động sản ({compareList.length}/4)</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            className="text-gray-300 hover:text-white text-sm transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              clearCompare();
            }}
          >
            Xoá tất cả
          </button>
          {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4 flex items-center gap-4 overflow-x-auto">
        {compareList.map((property) => (
          <div key={property.id} className="relative flex-shrink-0 w-48 border border-gray-100 rounded-xl overflow-hidden bg-white/80 backdrop-blur-sm card-hover group">
            <button
              onClick={() => removeProperty(property.id)}
              className="absolute top-2 right-2 glass text-gray-800 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 hover:bg-red-600 hover:text-white hover:scale-110 shadow-sm"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="h-24 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url(${getImageUrl(property.imageUrl) || getImagePlaceholder(200, 150)})` }} />
            <div className="p-3">
              <p className="text-xs font-semibold text-gray-900 line-clamp-1">{property.title}</p>
              <p className="text-sm font-bold text-red-600 mt-1">
                {property.price >= 1000000000 ? `${(property.price / 1000000000).toFixed(1)} tỷ` : 
                 property.price >= 1000000 ? `${(property.price / 1000000).toFixed(0)} triệu` : 
                 property.price?.toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        ))}
        
        {/* Placeholder for missing slots */}
        {[...Array(4 - compareList.length)].map((_, i) => (
          <div key={`empty-${i}`} className="flex-shrink-0 w-48 h-[142px] border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50/50 text-gray-400">
            <span className="text-sm">Thêm BDS</span>
          </div>
        ))}

        <div className="ml-auto pl-4 border-l border-gray-200">
          <button
            onClick={() => {
              if (compareList.length > 1) {
                navigate('/compare');
                setIsOpen(false);
              }
            }}
            disabled={compareList.length < 2}
            className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap btn-press ${
              compareList.length > 1 
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
            }`}
          >
            So sánh ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompareFloatingBar;
