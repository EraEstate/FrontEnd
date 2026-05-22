import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { 
  Folder, 
  Building, 
  MapPin, 
  Ruler, 
  ExternalLink,
  Loader2,
  AlertCircle,
  Sparkles,
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { propertyCollectionAPI } from '../api';
import type { PropertyCollection } from '../api/types';
import { getImageUrl, getImagePlaceholder } from '../utils/imageUtils';

export const SharedCollectionPage: React.FC = () => {
  const { t } = useTranslation();
  const { shareToken } = useParams<{ shareToken: string }>();

  const [collection, setCollection] = useState<PropertyCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedData = async () => {
      if (!shareToken) return;
      try {
        setLoading(true);
        setError(null);
        const data = await propertyCollectionAPI.getPublicSharedCollection(shareToken);
        setCollection(data);
      } catch (err) {
        console.error(err);
        setError(t('propertyCollection.sharedNotFound', 'Không tìm thấy bộ sưu tập được chia sẻ hoặc bộ sưu tập đã được chuyển sang chế độ riêng tư.'));
      } finally {
        setLoading(false);
      }
    };

    fetchSharedData();
  }, [shareToken]);

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} triệu`;
    }
    return price.toLocaleString('vi-VN') + ' VND';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto" />
          <p className="text-xs text-gray-500 font-bold">Đang tải bộ sưu tập được chia sẻ...</p>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-20">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-lg border border-gray-100 text-center space-y-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="font-extrabold text-gray-900 text-base">Bộ Sưu Tập Không Khả Dụng</h2>
          <p className="text-xs text-gray-500 font-semibold leading-relaxed">
            {error || 'Đường dẫn chia sẻ không chính xác hoặc bộ sưu tập đã bị khóa.'}
          </p>
          <Link 
            to="/" 
            className="inline-block px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow active:scale-95"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Curated Collection Header card */}
        <div className="bg-gradient-to-r from-gray-900 via-slate-900 to-zinc-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-white/5 mb-8">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[9px] font-black uppercase rounded-md shadow-sm">
                <Sparkles className="h-2.5 w-2.5 fill-current animate-spin" />
                Curated Collection
              </span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">{collection.name}</h1>
            {collection.description && (
              <p className="text-xs md:text-sm text-gray-300 font-semibold max-w-2xl leading-relaxed">{collection.description}</p>
            )}
            
            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold border-t border-white/10 pt-4">
              <Folder className="h-4 w-4 text-red-500" />
              <span>Gồm {collection.items?.length || 0} bất động sản nổi bật</span>
            </div>
          </div>
        </div>

        {/* Properties grid list */}
        {(!collection.items || collection.items.length === 0) ? (
          <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center text-gray-400 shadow-sm">
            <Building className="h-12 w-12 mx-auto mb-2 text-gray-200" />
            <p className="text-sm font-bold">Không có bất động sản nào trong bộ sưu tập này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collection.items.map(item => {
              const prop = item.property;
              if (!prop) return null;
              return (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 relative group flex flex-col h-full"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-gray-100 relative">
                    <img
                      src={getImageUrl(prop.images?.[0]?.imageUrl) || getImagePlaceholder(300, 200)}
                      alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 text-[9px] font-black uppercase rounded">
                      {prop.listingType === 'RENT' ? 'Cho thuê' : 'Bán'}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <Link 
                        to={`/properties/${prop.id}`}
                        className="text-xs font-black text-gray-900 line-clamp-2 hover:text-red-600 transition-colors leading-normal"
                      >
                        {prop.title}
                      </Link>
                      <div className="text-sm font-black text-red-600">{formatPrice(prop.price)}</div>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-[10px] text-gray-500 font-bold border-t border-gray-50 pt-3 mt-auto">
                      <span className="flex items-center gap-0.5">
                        <Ruler className="h-3.5 w-3.5 text-gray-400" />
                        {prop.area} m²
                      </span>
                      {prop.location && (
                        <span className="flex items-center gap-0.5 truncate max-w-[120px]" title={prop.location.address}>
                          <MapPin className="h-3.5 w-3.5 text-gray-400" />
                          {prop.location.district?.name || prop.location.address}
                        </span>
                      )}
                      <Link
                        to={`/properties/${prop.id}`}
                        className="flex items-center gap-0.5 text-red-600 font-black hover:underline"
                      >
                        Chi tiết
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
