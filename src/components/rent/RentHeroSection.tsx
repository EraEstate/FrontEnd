import React from 'react';
import { Search, Building2, Users, Smile } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { icon: Building2, label: '12.000+ Tin cho thuê' },
  { icon: Users, label: '5.000+ Chủ nhà' },
  { icon: Smile, label: '98% Hài lòng' },
];

const RentHeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-white via-rose-50 to-red-100 pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="text-3xl font-semibold text-gray-900 md:text-5xl">Cho thuê & Tìm nhà cho thuê</h1>
        <p className="mt-4 max-w-2xl text-base text-gray-700 md:text-lg">
          Tìm căn hộ, phòng trọ, nhà phố phù hợp ngân sách và nhu cầu trong vài phút.
        </p>

        <div className="mt-8 rounded-full border border-red-100 bg-white p-2 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row">
            <input
              className="h-12 flex-1 rounded-full border border-transparent px-5 text-sm outline-none focus:border-red-300"
              placeholder="Nhập khu vực cần tìm..."
            />
            <Link
              to="/properties?listingType=RENT"
              className="inline-flex h-12 items-center justify-center rounded-full bg-red-600 px-8 font-bold text-white hover:bg-red-700"
            >
              <Search className="mr-2 h-4 w-4" />
              Tìm ngay
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-red-100 bg-white/90 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-100 p-2 text-red-600">
                  <stat.icon className="h-4 w-4" />
                </div>
                <p className="font-bold text-gray-800">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RentHeroSection;
