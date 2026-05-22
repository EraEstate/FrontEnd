import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { propertyAPI } from '../api/property';
import { useAuthStore } from '../store/authStore';
import { getImageUrl, getImagePlaceholder } from '../utils/imageUtils';
import { formatVND } from '../utils/format';

const PersonalizedRecommendations: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    propertyAPI.getRecommendationsForYou(12)
      .then(res => setProperties(res?.content || res || []))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    const options: AddEventListenerOptions = { passive: true };
    el.addEventListener('scroll', checkScroll, options);
    return () => el.removeEventListener('scroll', checkScroll, options);
  }, [properties]);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  if (!isAuthenticated || (!loading && properties.length === 0)) return null;

  const formatPrice = formatVND;

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Dành riêng cho bạn</h2>
              <p className="text-xs text-gray-400">Gợi ý dựa trên sở thích và lịch sử tìm kiếm</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Scroll Arrows */}
            {properties.length > 4 && (
              <>
                <button onClick={() => scroll(-1)} disabled={!canScrollLeft}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button onClick={() => scroll(1)} disabled={!canScrollRight}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </>
            )}
            <Link to="/properties" className="text-xs font-semibold text-red-600 hover:text-red-700 ml-2 transition-colors">
              Xem tất cả →
            </Link>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((slot) => (
              <div key={`rec-skeleton-${slot}`} className="bg-white rounded-xl overflow-hidden border border-gray-100">
                <div className="h-40 bg-gray-100 animate-pulse" />
                <div className="p-3.5 space-y-2.5">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-20" />
                  <div className="h-3.5 bg-gray-100 rounded animate-pulse w-full" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-3/5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Horizontal Scrollable or Grid */
          <div ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-1 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {properties.slice(0, 12).map((p: any) => (
              <Link key={p.id} to={`/properties/${p.id}`}
                className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all group flex-shrink-0 snap-start"
                style={{ width: 'calc(25% - 12px)', minWidth: '220px' }}
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={getImageUrl(p.mainImageUrl || p.imageUrl) || getImagePlaceholder(400, 300)}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { (e.target as HTMLImageElement).src = getImagePlaceholder(400, 300); }}
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Type badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md text-white backdrop-blur-sm ${
                      (p.listingType || p.transactionType) === 'SALE' ? 'bg-green-600/90' : 'bg-blue-600/90'
                    }`}>
                      {(p.listingType || p.transactionType) === 'SALE' ? 'Bán' : 'Cho thuê'}
                    </span>
                  </div>
                </div>
                <div className="p-3.5">
                  <p className="font-bold text-red-600 mb-1">{formatPrice(p.price)}</p>
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">{p.title}</h3>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span className="truncate">{p.address || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                    <span>{p.area}m²</span>
                    {(p.bedrooms || p.propertyDetails?.[0]?.bedrooms) && (
                      <><span className="text-gray-300">•</span><span>{p.bedrooms || p.propertyDetails?.[0]?.bedrooms} PN</span></>
                    )}
                    {(p.bathrooms || p.propertyDetails?.[0]?.bathrooms) && (
                      <><span className="text-gray-300">•</span><span>{p.bathrooms || p.propertyDetails?.[0]?.bathrooms} VS</span></>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PersonalizedRecommendations;
