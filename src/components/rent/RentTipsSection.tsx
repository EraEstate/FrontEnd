import React from 'react';
import { FileText, ShieldCheck, SearchCheck, Landmark } from 'lucide-react';

const tips = [
  {
    icon: FileText,
    title: 'Kiem tra hop dong',
    description: 'Doc ky dieu khoan gia han, boi thuong, va dieu kien cham dut.',
  },
  {
    icon: ShieldCheck,
    title: 'Dat coc an toan',
    description: 'Giao dich dat coc can bien nhan, thong tin chu nha va dieu kien hoan coc.',
  },
  {
    icon: SearchCheck,
    title: 'Kiem tra nha truoc khi thue',
    description: 'Thu dien, nuoc, internet, PCCC va chup anh hien trang truoc ban giao.',
  },
  {
    icon: Landmark,
    title: 'Quyen loi nguoi thue',
    description: 'Nam ro quyen sua chua, bao tri va tra nha dung han theo hop dong.',
  },
];

const RentTipsSection: React.FC = () => {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-2xl font-semibold text-gray-900">Kinh nghiem thue nha</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {tips.map((tip) => (
            <div key={tip.title} className="rounded-2xl border border-red-100 bg-red-50/30 p-5">
              <div className="mb-3 inline-flex rounded-xl bg-white p-2 text-red-600 shadow-sm">
                <tip.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gray-900">{tip.title}</h3>
              <p className="mt-2 text-sm text-gray-700">{tip.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RentTipsSection;

