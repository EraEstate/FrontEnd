import React, { useMemo, useState } from 'react';
import { Compass, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  calculateElement,
  getGoodDirections,
  getLuckyColors,
  getLuckyNumbers,
} from '../utils/fengShuiCalculator';

const directions = [
  { name: 'Dong', note: 'Tang truong, khoi dau moi' },
  { name: 'Tay', note: 'On dinh tai chinh' },
  { name: 'Nam', note: 'Danh tieng, cong danh' },
  { name: 'Bac', note: 'Su nghiep, tri tue' },
  { name: 'Dong Bac', note: 'Kien thuc, hoc tap' },
  { name: 'Dong Nam', note: 'Tai loc, phat trien' },
  { name: 'Tay Bac', note: 'Quy nhan, ho tro' },
  { name: 'Tay Nam', note: 'Gia dao, tinh cam' },
];

const tips = [
  'Bo tri cua chinh gon gang, sang sua de don khi tot.',
  'Phong khach uu tien anh sang tu nhien va thong gio tot.',
  'Khong dat guong doi dien giuong ngu.',
  'Khu bep nen tach khoi khu ve sinh.',
  'Uu tien cay xanh nho de dieu hoa nang luong.',
  'Giu hanh lang thong thoang, tranh de vat can.',
];

const FengShuiGuidePage: React.FC = () => {
  const [birthYear, setBirthYear] = useState('');

  const result = useMemo(() => {
    const year = Number(birthYear);
    if (!Number.isFinite(year) || year < 1900) {
      return null;
    }
    const element = calculateElement(year);
    return {
      element,
      goodDirections: getGoodDirections(element),
      luckyColors: getLuckyColors(element),
      luckyNumbers: getLuckyNumbers(element),
    };
  }, [birthYear]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-4">
        <section className="rounded-2xl border border-red-100 bg-white p-8 shadow-sm">
          <h1 className="text-4xl font-semibold text-gray-900">Phong Thuy Nha O</h1>
          <p className="mt-3 max-w-3xl text-gray-700">
            Tong hop huong dan phong thuy co ban de chon huong nha, bo tri khong gian va toi uu van khi.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Chon huong nha</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {directions.map((direction) => (
              <div key={direction.name} className="rounded-2xl border border-red-100 p-4">
                <div className="mb-3 inline-flex rounded-xl bg-red-100 p-2 text-red-600">
                  <Compass className="h-5 w-5" />
                </div>
                <p className="font-bold text-gray-900">{direction.name}</p>
                <p className="mt-1 text-sm text-gray-600">{direction.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Tuoi phu hop</h2>
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
            <input
              value={birthYear}
              onChange={(event) => setBirthYear(event.target.value.replace(/[^\d]/g, '').slice(0, 4))}
              className="h-11 w-full rounded-full border border-red-200 px-4 text-sm font-semibold outline-none focus:border-red-500 md:max-w-xs"
              placeholder="Nhap nam sinh (VD: 1998)"
            />
            {result && (
              <div className="inline-flex items-center rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-700">
                Menh: {result.element}
              </div>
            )}
          </div>
          {result && (
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-red-100 p-4">
                <p className="text-sm text-gray-500">Huong tot</p>
                <p className="mt-1 font-bold text-gray-900">{result.goodDirections.join(', ')}</p>
              </div>
              <div className="rounded-2xl border border-red-100 p-4">
                <p className="text-sm text-gray-500">Mau hop</p>
                <p className="mt-1 font-bold text-gray-900">{result.luckyColors.join(', ')}</p>
              </div>
              <div className="rounded-2xl border border-red-100 p-4">
                <p className="text-sm text-gray-500">So may man</p>
                <p className="mt-1 font-bold text-gray-900">{result.luckyNumbers.join(', ')}</p>
              </div>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Meo phong thuy</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tips.map((tip) => (
              <div key={tip} className="rounded-2xl border border-red-100 bg-red-50/30 p-4">
                <p className="flex items-start gap-2 text-sm text-gray-700">
                  <Sparkles className="mt-0.5 h-4 w-4 text-red-600" />
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-red-600 p-6 text-white shadow-sm">
          <h2 className="text-2xl font-semibold">Tim nha hop phong thuy</h2>
          <p className="mt-2 text-red-100">Kham pha danh sach bat dong san theo huong, khu vuc va ngan sach.</p>
          <Link to="/properties" className="mt-4 inline-flex rounded-full bg-white px-5 py-2 font-bold text-red-600">
            Xem bat dong san
          </Link>
        </section>
      </div>
    </div>
  );
};

export default FengShuiGuidePage;

