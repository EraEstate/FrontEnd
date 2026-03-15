import React, { useState } from 'react';
import { Shield, Scale, FileText, HelpCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

type TabKey = 'blockchain' | 'terms' | 'faq';

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'blockchain', label: 'Hợp đồng Blockchain', icon: <Shield className="w-4 h-4" /> },
  { key: 'terms', label: 'Điều khoản & Chính sách', icon: <Scale className="w-4 h-4" /> },
  { key: 'faq', label: 'FAQ Pháp lý', icon: <HelpCircle className="w-4 h-4" /> },
];

const LegalCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const initialTab = (searchParams.get('tab') as TabKey) || 'blockchain';

  const [activeTab, setActiveTab] = useState<TabKey>(
    tabs.some((t) => t.key === initialTab) ? initialTab : 'blockchain'
  );

  const handleChangeTab = (key: TabKey) => {
    setActiveTab(key);
    const params = new URLSearchParams(location.search);
    params.set('tab', key);
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Trung tâm pháp lý & hợp đồng
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Giải thích rõ cách hệ thống sử dụng hợp đồng điện tử, blockchain và các bước pháp lý
            ngoài đời thực khi giao dịch bất động sản.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleChangeTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? 'border-red-600 text-red-600 bg-red-50/40'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-5 md:p-6">
            {activeTab === 'blockchain' && (
              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  <h2 className="text-base md:text-lg font-semibold text-gray-900">
                    Hợp đồng Blockchain trên ERA Estate ghi nhận những gì?
                  </h2>
                </div>
                <p>
                  Hợp đồng blockchain được tạo qua MetaMask chủ yếu dùng để{' '}
                  <span className="font-semibold">ghi nhận lại ý chí giao dịch</span> giữa các bên
                  trên một sổ cái phân tán, khó bị sửa đổi.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Mã giao dịch on-chain (transaction hash).</li>
                  <li>Địa chỉ ví của bên ký (người mua / người thuê).</li>
                  <li>Giá trị giao dịch tại thời điểm ký trên chuỗi.</li>
                  <li>Thời điểm giao dịch được ghi nhận trên blockchain.</li>
                </ul>
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs md:text-sm">
                  <p className="font-semibold text-amber-800 mb-1">
                    Lưu ý quan trọng về giá trị pháp lý:
                  </p>
                  <p className="text-amber-800">
                    Hợp đồng blockchain <span className="font-semibold">không thay thế</span> cho
                    hợp đồng công chứng, hợp đồng mua bán/sang tên tại văn phòng công chứng, cơ quan
                    nhà nước. Đây là lớp ghi nhận bổ sung để tăng tính minh bạch và dễ đối chiếu.
                  </p>
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">
                  Vai trò của công chứng, sang tên sổ hồng/sổ đỏ
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <span className="font-semibold">Công chứng hợp đồng</span>: xác nhận ý chí và
                    chữ ký của các bên, là cơ sở để sang tên.
                  </li>
                  <li>
                    <span className="font-semibold">Sang tên sổ</span>: cập nhật quyền sở hữu/quyền
                    sử dụng trên Giấy chứng nhận – đây mới là căn cứ pháp lý mạnh nhất.
                  </li>
                  <li>
                    <span className="font-semibold">Thuế &amp; phí</span>: cần được kê khai và nộp
                    đúng quy định (thuế TNCN, lệ phí trước bạ, phí công chứng…).
                  </li>
                </ul>
                <p className="text-xs text-gray-500">
                  ERA Estate hỗ trợ phần ghi nhận trên hệ thống và blockchain; người dùng vẫn cần
                  làm việc với <span className="font-semibold">văn phòng công chứng</span> và{' '}
                  <span className="font-semibold">cơ quan đăng ký đất đai</span> để hoàn tất pháp lý.
                </p>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-red-500" />
                  <h2 className="text-base md:text-lg font-semibold text-gray-900">
                    Điều khoản sử dụng &amp; Chính sách cơ bản
                  </h2>
                </div>
                <p>
                  Phần này tóm tắt các nguyên tắc chính khi bạn sử dụng ERA Estate để tìm kiếm, đăng
                  tin và giao dịch bất động sản.
                </p>
                <h3 className="font-semibold text-gray-900">Điều khoản sử dụng chính</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Không đăng tải thông tin sai sự thật, gây nhầm lẫn hoặc vi phạm pháp luật.</li>
                  <li>
                    Tự chịu trách nhiệm về nội dung tin đăng, hồ sơ pháp lý và các thỏa thuận bên
                    ngoài hệ thống.
                  </li>
                  <li>
                    Không sử dụng nền tảng cho các hành vi rửa tiền, lừa đảo, huy động vốn trái
                    phép.
                  </li>
                  <li>
                    ERA Estate có quyền ẩn/xóa các nội dung vi phạm quy định hoặc bị tố cáo có dấu
                    hiệu rủi ro cao.
                  </li>
                </ul>
                <h3 className="font-semibold text-gray-900 mt-4">Chính sách bảo mật &amp; dữ liệu</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Thông tin nhạy cảm (CMND/CCCD, số sổ, số tài khoản…) được hạn chế hiển thị.</li>
                  <li>
                    Dữ liệu giao dịch được lưu trữ trên hệ thống và có thể được{' '}
                    <span className="font-semibold">băm/ẩn bớt</span> khi đưa lên blockchain.
                  </li>
                  <li>
                    ERA Estate chỉ chia sẻ dữ liệu với bên thứ ba khi có sự đồng ý hoặc yêu cầu từ
                    cơ quan nhà nước có thẩm quyền.
                  </li>
                </ul>
                <p className="text-xs text-gray-500">
                  Chi tiết đầy đủ của Điều khoản sử dụng và Chính sách bảo mật có thể được mở rộng
                  trong các phiên bản sau; phần này mang tính chất định hướng và minh bạch trải
                  nghiệm cho người dùng.
                </p>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="w-5 h-5 text-red-500" />
                  <h2 className="text-base md:text-lg font-semibold text-gray-900">
                    Câu hỏi thường gặp (FAQ) về pháp lý giao dịch
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="font-semibold text-gray-900">
                      1. Hợp đồng trên ERA Estate có đủ để sang tên không?
                    </p>
                    <p className="mt-1 text-gray-700">
                      Không. Hợp đồng trên hệ thống (kể cả đã ghi nhận blockchain) chỉ là lớp hỗ
                      trợ minh bạch và làm rõ giao dịch. Để sang tên sổ, bạn bắt buộc phải làm hợp
                      đồng công chứng và thủ tục tại cơ quan nhà nước.
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="font-semibold text-gray-900">
                      2. Thuế, phí mua bán/cho thuê được tính như thế nào?
                    </p>
                    <p className="mt-1 text-gray-700">
                      Thuế thu nhập cá nhân, lệ phí trước bạ, phí công chứng… phụ thuộc vào giá trị
                      hợp đồng và quy định từng thời kỳ. Hệ thống chỉ hỗ trợ hiển thị ước tính; số
                      liệu chính xác do cơ quan thuế và văn phòng công chứng quyết định.
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="font-semibold text-gray-900">
                      3. Nếu một bên không thực hiện đúng cam kết trên hệ thống thì sao?
                    </p>
                    <p className="mt-1 text-gray-700">
                      Dữ liệu giao dịch, lịch sử thanh toán và thông tin blockchain có thể làm{' '}
                      <span className="font-semibold">chứng cứ tham khảo</span>. Tuy nhiên, việc xử
                      lý vi phạm, bồi thường thiệt hại, tranh chấp… vẫn do hai bên thương lượng
                      hoặc nhờ Tòa án/Trọng tài giải quyết.
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="font-semibold text-gray-900">
                      4. Tôi không rành Blockchain, MetaMask thì có bắt buộc dùng không?
                    </p>
                    <p className="mt-1 text-gray-700">
                      Không bắt buộc. Bạn có thể chọn thanh toán qua VNPay và chỉ dùng hợp đồng
                      điện tử trên hệ thống. Ký blockchain là tuỳ chọn cho những ai muốn tăng thêm
                      lớp minh bạch và khả năng đối chiếu sau này.
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  Thông tin trên chỉ mang tính tham khảo, không thay thế cho tư vấn từ luật sư, cơ
                  quan thuế hoặc văn phòng công chứng. Với các giao dịch lớn hoặc phức tạp, bạn nên
                  làm việc thêm với chuyên gia pháp lý.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalCenterPage;

