import React from 'react';
import { Building2, BedDouble, Home, Building, Store, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  { icon: Building2, label: 'Căn hộ', type: 'APARTMENT', count: '3.210 tin' },
  { icon: BedDouble, label: 'Phòng trọ', type: 'HOUSE', count: '2.145 tin' },
  { icon: Home, label: 'Nhà nguyên căn', type: 'HOUSE', count: '1.020 tin' },
  { icon: Building, label: 'Văn phòng', type: 'OFFICE', count: '882 tin' },
  { icon: Store, label: 'Mặt bằng', type: 'LAND', count: '613 tin' },
  { icon: Briefcase, label: 'Co-working', type: 'OFFICE', count: '324 tin' },
];

const RentCategoryGrid: React.FC = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Loại hình cho thuê phổ biến</h2>
        <p className="mt-2 text-gray-600">Chọn nhanh theo nhu cầu để tối ưu thời gian tìm kiếm.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.label}
            to={`/properties?listingType=RENT&propertyType=${category.type}`}
            className="group rounded-2xl border border-red-100 bg-white p-5 shadow-sm transition hover:scale-[1.02] hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-red-100 p-3 text-red-600">
                <category.icon className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                {category.count}
              </span>
            </div>
            <p className="mt-4 text-lg font-bold text-gray-900 group-hover:text-red-600">{category.label}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RentCategoryGrid;
