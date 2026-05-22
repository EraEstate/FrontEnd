import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Building2, 
  DollarSign, 
  Compass, 
  FileText, 
  TrendingUp, 
  Ruler, 
  Scale, 
  Calendar, 
  Wallet, 
  MapPin, 
  Calculator,
  Wrench
} from 'lucide-react';

interface UtilityTool {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  isPopular?: boolean;
  path?: string;
}

const UtilityCard: React.FC<{ utility: UtilityTool }> = ({ utility }) => {
  const Icon = utility.icon;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-red-300 hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gray-50 rounded-lg flex-shrink-0">
          <Icon className="h-6 w-6 text-gray-700" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-base font-semibold text-gray-900 leading-tight">
              {utility.name}
            </h3>
            {utility.isPopular && (
              <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded whitespace-nowrap flex-shrink-0">
                Phổ biến
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">{utility.description}</p>
          {utility.path ? (
            <Link
              to={utility.path}
              className="inline-block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Sử dụng ngay
            </Link>
          ) : (
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
              Sử dụng ngay
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const UtilitiesPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: t('common.all'), count: 12 },
    { id: 'calculator', name: 'Công cụ tính toán', count: 4 },
    { id: 'feng-shui', name: t('wiki.fengShui'), count: 3 },
    { id: 'legal', name: 'Thủ tục pháp lý', count: 3 },
    { id: 'investment', name: 'Đầu tư', count: 2 }
  ];

  const utilities: UtilityTool[] = [
    {
      id: 1,
      name: "Tính lãi suất vay mua nhà",
      description: "Tính toán lãi suất, số tiền phải trả hàng tháng khi vay mua nhà",
      category: "calculator",
      icon: Home,
      isPopular: true
    },
    {
      id: 2,
      name: "Xem tuổi xây nhà",
      description: "Xem tuổi phù hợp để xây nhà, sửa nhà theo phong thủy",
      category: "feng-shui",
      icon: Building2,
      isPopular: true
    },
    {
      id: 3,
      name: "Dự toán chi phí xây nhà",
      description: "Ước tính chi phí xây dựng nhà ở theo diện tích và cấp độ",
      category: "calculator",
      icon: DollarSign,
      isPopular: true
    },
    {
      id: 4,
      name: "Xem hướng nhà theo phong thủy",
      description: "Tư vấn hướng nhà phù hợp với tuổi và mệnh gia chủ",
      category: "feng-shui",
      icon: Compass
    },
    {
      id: 5,
      name: "Tính thuế chuyển nhượng BĐS",
      description: "Tính thuế phải nộp khi bán bất động sản",
      category: "legal",
      icon: FileText
    },
    {
      id: 6,
      name: "Đánh giá tiềm năng đầu tư",
      description: "Phân tích tiềm năng sinh lời của bất động sản",
      category: "investment",
      icon: TrendingUp,
      path: '/investment-calculator'
    },
    {
      id: 7,
      name: "Tính diện tích sử dụng",
      description: "Quy đổi diện tích thông thủy, tim tường, sàn xây dựng",
      category: "calculator",
      icon: Ruler
    },
    {
      id: 8,
      name: "Kiểm tra pháp lý BĐS",
      description: "Hướng dẫn kiểm tra tính pháp lý của bất động sản",
      category: "legal",
      icon: Scale
    },
    {
      id: 9,
      name: "Chọn ngày tốt mua nhà",
      description: "Chọn ngày giờ tốt để ký hợp đồng, nhận nhà",
      category: "feng-shui",
      icon: Calendar
    },
    {
      id: 10,
      name: "Tính lợi nhuận cho thuê",
      description: "Tính toán lợi nhuận khi đầu tư bất động sản cho thuê",
      category: "investment",
      icon: Wallet,
      path: '/investment-calculator'
    },
    {
      id: 11,
      name: "Tra cứu giá đất",
      description: "Tra cứu giá đất theo khu vực và thời gian",
      category: "legal",
      icon: MapPin
    },
    {
      id: 12,
      name: "Tính VAT, phí bảo trì",
      description: "Tính các loại phí phụ khi mua bán bất động sản",
      category: "calculator",
      icon: Calculator
    }
  ];

  const filteredUtilities = utilities.filter(utility => 
    selectedCategory === 'all' || utility.category === selectedCategory
  );
  const popularUtilities = utilities.reduce<UtilityTool[]>((acc, utility) => {
    if (utility.isPopular) {
      acc.push(utility);
    }
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Các công cụ hữu ích hỗ trợ quyết định bất động sản</h1>
          <p className="text-gray-600">Tất cả công cụ đều miễn phí và dễ sử dụng</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-5 sticky top-24">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Danh mục công cụ</h3>
              <ul className="space-y-1">
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                        selectedCategory === category.id
                          ? 'bg-red-50 text-red-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{category.name}</span>
                        <span className="text-xs text-gray-500">({category.count})</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>

              {/* Popular tools */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3 text-sm">Công cụ phổ biến</h4>
                <div className="space-y-2">
                  {popularUtilities.map(utility => {
                    const Icon = utility.icon;
                    return (
                      <div key={utility.id} className="flex items-center gap-2 text-sm text-gray-700 hover:text-red-600 cursor-pointer transition-colors">
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="line-clamp-1">{utility.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {filteredUtilities.length} công cụ tiện ích
                {selectedCategory !== 'all' && (
                  <span className="text-red-600 ml-2 font-normal">
                    - {categories.find(c => c.id === selectedCategory)?.name}
                  </span>
                )}
              </h2>
              <div className="text-sm text-gray-500">
                Tất cả công cụ đều miễn phí
              </div>
            </div>

            {/* Featured tools banner */}
            {selectedCategory === 'all' && (
              <div className="bg-red-600 rounded-lg p-6 mb-6 text-white">
                <h3 className="text-xl font-semibold mb-2">Công cụ nổi bật</h3>
                <p className="mb-4 text-red-50 text-sm">
                  Những công cụ được sử dụng nhiều nhất để hỗ trợ quyết định bất động sản
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {popularUtilities.map(utility => {
                    const Icon = utility.icon;
                    return (
                      <div key={utility.id} className="bg-white bg-opacity-10 rounded-lg p-3 hover:bg-opacity-20 transition-colors">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <span className="font-medium text-sm">{utility.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Utilities grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredUtilities.map((utility) => (
                <UtilityCard key={utility.id} utility={utility} />
              ))}
            </div>

            {/* Help section */}
            <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cần hỗ trợ?</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Nếu bạn gặp khó khăn trong việc sử dụng các công cụ hoặc cần tư vấn chuyên sâu, 
                đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                  Chat với chuyên gia
                </button>
                <button className="border border-red-600 text-red-600 px-5 py-2.5 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
                  Gọi hotline: 1900 1881
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UtilitiesPage;
