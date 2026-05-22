import React, { useEffect, useMemo, useState } from 'react';
import { Plus, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { propertyAPI } from '../../api/property';
import { useCompareStore } from '../../store/compareStore';
import { getImagePlaceholder, getImageUrl } from '../../utils/imageUtils';

interface Suggestion {
  id: string;
  title: string;
  price: number;
  area?: number;
  mainImageUrl?: string;
  imageUrl?: string;
  address?: string;
}

const SimilarSuggestions: React.FC = () => {
  const { compareList, addProperty } = useCompareStore();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const ids = useMemo(() => compareList.map((item) => item.id), [compareList]);

  useEffect(() => {
    let active = true;
    const loadSuggestions = async () => {
      if (ids.length === 0) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const compared = await propertyAPI.getPropertiesForCompare(ids);
        const comparedList = Array.isArray(compared) ? compared : [];
        if (comparedList.length === 0) {
          setSuggestions([]);
          return;
        }

        const prices = comparedList.flatMap((p: any) => {
          const n = Number(p.price || 0);
          return n > 0 ? [n] : [];
        });
        const avgPrice = prices.length > 0 ? prices.reduce((a: number, b: number) => a + b, 0) / prices.length : 0;
        const first = comparedList[0];

        const searchResult = await propertyAPI.search({
          propertyType: first?.propertyType,
          listingType: first?.listingType,
          minPrice: avgPrice > 0 ? Math.max(0, Math.round(avgPrice * 0.8)) : undefined,
          maxPrice: avgPrice > 0 ? Math.round(avgPrice * 1.2) : undefined,
          page: 0,
          size: 12,
        });
        const content = Array.isArray(searchResult?.content) ? searchResult.content : [];
        const filtered = content
          .filter((item: any) => !ids.includes(item.id))
          .slice(0, 4);
        if (active) {
          setSuggestions(filtered);
        }
      } catch {
        if (active) {
          setSuggestions([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    loadSuggestions();
    return () => {
      active = false;
    };
  }, [ids]);

  if (ids.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-900">Có thể bạn quan tâm</h2>
      {loading ? (
        <p className="mt-4 text-sm text-gray-500">Đang gợi ý bất động sản tương tự...</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {suggestions.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
              <div
                className="h-36 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${
                    getImageUrl(item.mainImageUrl || item.imageUrl) || getImagePlaceholder(320, 180)
                  })`,
                }}
              />
              <div className="p-4">
                <Link to={`/properties/${item.id}`} className="line-clamp-2 font-bold text-gray-900 hover:text-red-600">
                  {item.title}
                </Link>
                <p className="mt-2 text-lg font-semibold text-red-600">{Number(item.price || 0).toLocaleString('vi-VN')} VND</p>
                <p className="mt-1 text-sm text-gray-600">{item.area ? `${item.area} m²` : 'Đang cập nhật diện tích'}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="h-3 w-3" />
                  {item.address || 'Vị trí đang cập nhật'}
                </p>
                <button
                  type="button"
                  onClick={() => addProperty({ id: item.id, title: item.title, price: Number(item.price || 0) })}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  <Plus className="h-3 w-3" />
                  Thêm vào so sánh
                </button>
              </div>
            </article>
          ))}
          {suggestions.length === 0 && <p className="text-sm text-gray-500">Chưa có gợi ý phù hợp.</p>}
        </div>
      )}
    </section>
  );
};

export default SimilarSuggestions;

