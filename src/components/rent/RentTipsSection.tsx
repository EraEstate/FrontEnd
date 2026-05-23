import React from 'react';
import { FileText, ShieldCheck, SearchCheck, Landmark } from 'lucide-react';

const tips = [
  {
    icon: FileText,
    title: 'Kiểm tra hợp đồng',
    description: 'Đọc kỹ điều khoản gia hạn, bồi thường, và điều kiện chấm dứt.',
  },
  {
    icon: ShieldCheck,
    title: 'Đặt cọc an toàn',
    description: 'Giao dịch đặt cọc cần biên nhận, thông tin chủ nhà và điều kiện hoàn cọc.',
  },
  {
    icon: SearchCheck,
    title: 'Kiểm tra nhà trước khi thuê',
    description: 'Thử điện, nước, internet, PCCC và chụp ảnh hiện trạng trước bàn giao.',
  },
  {
    icon: Landmark,
    title: 'Quyền lợi người thuê',
    description: 'Nắm rõ quyền sửa chữa, bảo trì và trả nhà đúng hạn theo hợp đồng.',
  },
];

const RentTipsSection: React.FC = () => {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-2xl font-semibold text-gray-900">Kinh nghiệm thuê nhà</h2>
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

