import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface UtilityTool {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
  isPopular?: boolean;
}

const UtilitiesPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: t('common.all'), count: 12 },
    { id: 'calculator', name: 'Máy tính', count: 4 },
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
      icon: "🏠",
      isPopular: true
    },
    {
      id: 2,
      name: "Xem tuổi xây nhà",
      description: "Xem tuổi phù hợp để xây nhà, sửa nhà theo phong thủy",
      category: "feng-shui",
      icon: "🏗️",
      isPopular: true
    },
    {
      id: 3,
      name: "Dự toán chi phí xây nhà",
      description: "Ước tính chi phí xây dựng nhà ở theo diện tích và cấp độ",
      category: "calculator",
      icon: "💰",
      isPopular: true
    },
    {
      id: 4,
      name: "Xem hướng nhà theo phong thủy",
      description: "Tư vấn hướng nhà phù hợp với tuổi và mệnh gia chủ",
      category: "feng-shui",
      icon: "🧭"
    },
    {
      id: 5,
      name: "Tính thuế chuyển nhượng BĐS",
      description: "Tính thuế phải nộp khi bán bất động sản",
      category: "legal",
      icon: "🧾"
    },
    {
      id: 6,
      name: "Đánh giá tiềm năng đầu tư",
      description: "Phân tích tiềm năng sinh lời của bất động sản",
      category: "investment",
      icon: "📈"
    },
    {
      id: 7,
      name: "Tính diện tích sử dụng",
      description: "Quy đổi diện tích thông thủy, tim tường, sàn xây dựng",
      category: "calculator",
      icon: "📏"
    },
    {
      id: 8,
      name: "Kiểm tra pháp lý BĐS",
      description: "Hướng dẫn kiểm tra tính pháp lý của bất động sản",
      category: "legal",
      icon: "⚖️"
    },
    {
      id: 9,
      name: "Chọn ngày tốt mua nhà",
      description: "Chọn ngày giờ tốt để ký hợp đồng, nhận nhà",
      category: "feng-shui",
      icon: "📅"
    },
    {
      id: 10,
      name: "Tính lợi nhuận cho thuê",
      description: "Tính toán lợi nhuận khi đầu tư bất động sản cho thuê",
      category: "investment",
      icon: "💵"
    },
    {
      id: 11,
      name: "Tra cứu giá đất",
      description: "Tra cứu giá đất theo khu vực và thời gian",
      category: "legal",
      icon: "🗺️"
    },
    {
      id: 12,
      name: "Tính VAT, phí bảo trì",
      description: "Tính các loại phí phụ khi mua bán bất động sản",
      category: "calculator",
      icon: "🧮"
    }
  ];

  const filteredUtilities = utilities.filter(utility => 
    selectedCategory === 'all' || utility.category === selectedCategory
  );

  const UtilityCard: React.FC<{ utility: UtilityTool }> = ({ utility }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <div className="flex items-start space-x-4">
        <div className="text-4xl mb-4">{utility.icon}</div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {utility.name}
            </h3>
            {utility.isPopular && (
              <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                Phổ biến
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-4">{utility.description}</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
            Sử dụng ngay
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hỗ trợ tiện ích</h1>
          <p className="text-gray-600">Các công cụ hữu ích hỗ trợ quyết định bất động sản</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Danh mục công cụ</h3>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{category.name}</span>
                        <span className="text-sm text-gray-500">({category.count})</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>

              {/* Popular tools */}
              <div className="mt-8">
                <h4 className="font-medium text-gray-900 mb-3">Công cụ phổ biến</h4>
                <div className="space-y-2">
                  {utilities.filter(u => u.isPopular).map(utility => (
                    <div key={utility.id} className="flex items-center space-x-2 text-sm">
                      <span>{utility.icon}</span>
                      <span className="text-gray-700 hover:text-blue-600 cursor-pointer">
                        {utility.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {filteredUtilities.length} công cụ tiện ích
                  {selectedCategory !== 'all' && (
                    <span className="text-blue-600 ml-2">
                      - {categories.find(c => c.id === selectedCategory)?.name}
                    </span>
                  )}
                </h2>
                <div className="text-sm text-gray-500">
                  Tất cả công cụ đều miễn phí
                </div>
              </div>
            </div>

            {/* Featured tools banner */}
            {selectedCategory === 'all' && (
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 mb-6 text-white">
                <h3 className="text-xl font-bold mb-2">Công cụ nổi bật</h3>
                <p className="mb-4 opacity-90">
                  Những công cụ được sử dụng nhiều nhất để hỗ trợ quyết định bất động sản
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {utilities.filter(u => u.isPopular).map(utility => (
                    <div key={utility.id} className="bg-white bg-opacity-20 rounded p-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{utility.icon}</span>
                        <span className="font-medium">{utility.name}</span>
                      </div>
                    </div>
                  ))}
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
            <div className="mt-8 bg-gray-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Cần hỗ trợ?</h3>
              <p className="text-gray-600 mb-4">
                Nếu bạn gặp khó khăn trong việc sử dụng các công cụ hoặc cần tư vấn chuyên sâu, 
                đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ.
              </p>
              <div className="flex space-x-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Chat với chuyên gia
                </button>
                <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors">
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