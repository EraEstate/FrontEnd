import React from 'react';
import { Shield, Database, EyeOff, Lock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const SecurityCenterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-8 h-8 text-red-500" />
            Trung tâm bảo mật
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            ERA Estate cam kết bảo vệ dữ liệu và tài khoản của bạn. Trang này giải thích dữ liệu nào được lưu,
            dữ liệu nào không công khai và cách bạn tự bảo vệ tài khoản.
          </p>
        </div>

        <div className="space-y-6">
          {/* 1. Dữ liệu nào được lưu? */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <Database className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900">Dữ liệu nào được lưu?</h2>
            </div>
            <div className="p-5 md:p-6 text-sm text-gray-700 space-y-4">
              <p>
                Để vận hành giao dịch và hợp đồng, hệ thống lưu trữ các nhóm dữ liệu sau (có mã hóa và kiểm soát truy cập):
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <span className="font-semibold">Dữ liệu hợp đồng & giao dịch:</span> mã giao dịch, thông tin bất động sản (tiêu đề, địa chỉ, giá), các bên (họ tên, email, số điện thoại đã đăng ký), phương thức thanh toán, trạng thái thanh toán, ngày tạo/cập nhật.
                </li>
                <li>
                  <span className="font-semibold">Dữ liệu blockchain:</span> transaction hash (tx hash), địa chỉ contract, tên mạng (network), thời điểm ghi nhận on-chain. Dữ liệu on-chain là công khai trên chuỗi nhưng không chứa CMND/CCCD hay số tài khoản ngân hàng.
                </li>
                <li>
                  <span className="font-semibold">Log truy cập & hành động:</span> lịch sử đăng nhập, thao tác tạo/xem giao dịch, nhật ký thanh toán (VNPay) và ký blockchain được ghi lại để hỗ trợ bảo mật và giải quyết tranh chấp.
                </li>
              </ul>
              <p className="text-gray-600">
                Các dữ liệu trên được lưu trên server ERA Estate và (nếu có) trên blockchain; chỉ người có quyền (bên tham gia giao dịch, quản trị viên) mới được truy cập chi tiết theo quy định nội bộ.
              </p>
            </div>
          </section>

          {/* 2. Dữ liệu nào không public? */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <EyeOff className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900">Dữ liệu nào không public?</h2>
            </div>
            <div className="p-5 md:p-6 text-sm text-gray-700 space-y-4">
              <p>
                Những thông tin sau <span className="font-semibold">không được hiển thị công khai</span> và được bảo vệ hoặc ẩn/mask trên giao diện:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <span className="font-semibold">CMND/CCCD:</span> số, ngày cấp, nơi cấp không lưu đầy đủ trên hợp đồng in; chỉ lưu trong hồ sơ nội bộ khi có yêu cầu pháp lý (ví dụ KYC nâng cao).
                </li>
                <li>
                  <span className="font-semibold">Số sổ đỏ/sổ hồng, số thửa, tờ bản đồ:</span> có thể được lưu trong hồ sơ bất động sản nhưng không hiển thị đầy đủ trên màn hình công cộng hay bản in mặc định (có thể ẩn bớt theo tùy chọn quyền riêng tư).
                </li>
                <li>
                  <span className="font-semibold">Tài khoản ngân hàng:</span> số tài khoản nhận tiền không hiển thị công khai; chỉ bên bán và hệ thống thanh toán xử lý.
                </li>
                <li>
                  <span className="font-semibold">Mật khẩu, seed phrase MetaMask, mã OTP:</span> không bao giờ được lưu hoặc yêu cầu từ phía ERA Estate; bạn tự bảo quản ví và thiết bị.
                </li>
              </ul>
              <p className="text-gray-600">
                Trên trang hợp đồng, bạn có thể bật tùy chọn “Ẩn bớt email/phone trong bản in” và “Chỉ hiển thị mã giao dịch” để giảm rủi ro lộ thông tin khi in hoặc chia sẻ.
              </p>
            </div>
          </section>

          {/* 3. Cách bảo vệ tài khoản */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <Lock className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900">Cách bảo vệ tài khoản</h2>
            </div>
            <div className="p-5 md:p-6 text-sm text-gray-700 space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">1</span>
                  <div>
                    <p className="font-semibold text-gray-900">Mật khẩu mạnh</p>
                    <p className="text-gray-600">Dùng mật khẩu đủ dài, kết hợp chữ, số và ký hiệu; không dùng lại mật khẩu đã dùng ở trang khác. Đổi mật khẩu định kỳ nếu nghi ngờ rò rỉ.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">2</span>
                  <div>
                    <p className="font-semibold text-gray-900">Xác thực hai yếu tố (2FA)</p>
                    <p className="text-gray-600">ERA Estate đang triển khai 2FA (SMS/App). Khi có 2FA, hãy bật để tăng cường bảo mật đăng nhập.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">3</span>
                  <div>
                    <p className="font-semibold text-gray-900">Cảnh báo lừa đảo MetaMask / phishing</p>
                    <p className="text-gray-600">Chỉ ký giao dịch khi đang ở đúng trang ERA Estate (kiểm tra URL). Không nhập seed phrase hoặc private key vào bất kỳ form nào; MetaMask không bao giờ yêu cầu seed phrase qua email hay popup. Không ký nếu đang dùng máy công cộng hoặc mạng không tin cậy.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">4</span>
                  <div>
                    <p className="font-semibold text-gray-900">Không chia sẻ mã OTP / link xác nhận</p>
                    <p className="text-gray-600">Mã OTP và link xác nhận email/SMS chỉ dành cho bạn. Nhân viên ERA Estate không bao giờ hỏi OTP qua điện thoại hay tin nhắn. Nếu có yêu cầu lạ, hãy báo ngay cho bộ phận bảo mật.</p>
                  </div>
                </li>
              </ul>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  Bảo mật là trách nhiệm chung: bạn bảo vệ mật khẩu và thiết bị; ERA Estate bảo vệ dữ liệu trên server và tuân thủ chính sách bảo mật. Chi tiết xem thêm tại{' '}
                  <Link to="/legal?tab=terms" className="text-red-600 hover:underline font-medium">Trung tâm pháp lý</Link>.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SecurityCenterPage;
