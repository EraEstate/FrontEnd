import React, { useState } from 'react';
import { Check, Clock, Mail, Crown, Star, Zap, Camera, Users, Shield, BarChart3 } from 'lucide-react';
// TODO: Add usePackages hook when API is ready
// import { usePackages } from '../api/hooks';
import { useTranslation } from 'react-i18next';

const PricingPage: React.FC = () => {
  const { t } = useTranslation();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  // TODO: Replace with actual API call when usePackages hook is implemented
  const packages = {
    content: [
      {
        id: '1',
        name: t('pricing.basic'),
        description: 'Phù hợp cho người bán cá nhân',
        price: 99000,
        durationDays: 30,
        maxProperties: 5,
        maxImagesPerProperty: 5,
        isFeatured: false,
        isPremium: false,
        priorityLevel: 1,
        includesSocialMedia: false,
        includesWebsiteBanner: false,
        includesEmailMarketing: false,
        analyticsIncluded: false,
        isPopular: false
      },
      {
        id: '2',
        name: 'Nổi bật',
        description: 'Được hiển thị ưu tiên, phù hợp cho môi giới',
        price: 299000,
        durationDays: 30,
        maxProperties: 20,
        maxImagesPerProperty: 10,
        isFeatured: true,
        isPremium: false,
        priorityLevel: 5,
        includesSocialMedia: true,
        includesWebsiteBanner: false,
        includesEmailMarketing: false,
        analyticsIncluded: true,
        isPopular: true
      },
      {
        id: '3',
        name: t('pricing.premium'),
        description: 'Gói cao cấp với đầy đủ tính năng',
        price: 599000,
        durationDays: 30,
        maxProperties: null, // unlimited
        maxImagesPerProperty: 20,
        isFeatured: false,
        isPremium: true,
        priorityLevel: 10,
        includesSocialMedia: true,
        includesWebsiteBanner: true,
        includesEmailMarketing: true,
        analyticsIncluded: true,
        isPopular: false
      }
    ]
  };
  const loading = false;
  const error = null;

  const getPackageIcon = (packageName: string) => {
    if (packageName.toLowerCase().includes('premium')) return <Crown className="h-8 w-8 text-yellow-500" />;
    if (packageName.toLowerCase().includes('featured')) return <Star className="h-8 w-8 text-blue-500" />;
    return <Zap className="h-8 w-8 text-green-500" />;
  };

  const getPackageColor = (isPremium: boolean, isFeatured: boolean) => {
    if (isPremium) return 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100';
    if (isFeatured) return 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100';
    return 'border-gray-200 bg-white';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 mt-10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 text-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải gói dịch vụ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 mt-10 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-10">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Chọn gói dịch vụ phù hợp
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Đăng tin bất động sản của bạn với các gói dịch vụ chất lượng cao
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <span className={`mr-3 ${billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Theo tháng
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingPeriod === 'yearly' ? 'bg-red-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`ml-3 ${billingPeriod === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Theo năm
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Tiết kiệm 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {packages?.content?.map((pkg: any) => (
            <div
              key={pkg.id}
              className={`relative rounded-2xl border-2 p-8 transition-all duration-300 hover:shadow-xl ${
                getPackageColor(pkg.isPremium, pkg.isFeatured)
              } ${pkg.isPopular ? 'ring-2 ring-red-500 ring-offset-2' : ''}`}
            >
              {pkg.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-500 text-white">
                    Phổ biến nhất
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  {getPackageIcon(pkg.name)}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(billingPeriod === 'yearly' ? pkg.price * 0.8 : pkg.price)}
                  </span>
                  <span className="text-gray-600 ml-1">
                    /{billingPeriod === 'yearly' ? 'năm' : 'tháng'}
                  </span>
                  {billingPeriod === 'yearly' && (
                    <div className="text-sm text-green-600 mt-1">
                      Tiết kiệm {formatPrice(pkg.price * 0.2)} mỗi năm
                    </div>
                  )}
                </div>

                <button className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  pkg.isPremium
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : pkg.isFeatured
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}>
                  Chọn gói này
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Đăng tối đa {pkg.maxProperties || 'Không giới hạn'} bất động sản</span>
                </div>

                <div className="flex items-center text-sm">
                  <Camera className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Tối đa {pkg.maxImagesPerProperty} ảnh mỗi bất động sản</span>
                </div>

                <div className="flex items-center text-sm">
                  <Clock className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Thời hạn {pkg.durationDays} ngày</span>
                </div>

                {pkg.includesSocialMedia && (
                  <div className="flex items-center text-sm">
                    <Users className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Đăng lên mạng xã hội</span>
                  </div>
                )}

                {pkg.includesWebsiteBanner && (
                  <div className="flex items-center text-sm">
                    <Shield className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Banner quảng cáo trên website</span>
                  </div>
                )}

                {pkg.includesEmailMarketing && (
                  <div className="flex items-center text-sm">
                    <Mail className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Email marketing</span>
                  </div>
                )}

                {pkg.analyticsIncluded && (
                  <div className="flex items-center text-sm">
                    <BarChart3 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Báo cáo thống kê chi tiết</span>
                  </div>
                )}

                <div className="flex items-center text-sm">
                  <Star className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Độ ưu tiên: {pkg.priorityLevel}/10</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Câu hỏi thường gặp
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Làm thế nào để nâng cấp gói dịch vụ?
              </h3>
              <p className="text-gray-600">
                Bạn có thể nâng cấp gói dịch vụ bất kỳ lúc nào từ tài khoản của mình.
                Phí chênh lệch sẽ được tính theo tỷ lệ thời gian còn lại.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Tôi có thể hủy gói dịch vụ không?
              </h3>
              <p className="text-gray-600">
                Có, bạn có thể hủy gói dịch vụ bất kỳ lúc nào. Chúng tôi sẽ hoàn lại
                phí cho thời gian chưa sử dụng theo chính sách hoàn tiền.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Gói dịch vụ có bao gồm hỗ trợ kỹ thuật?
              </h3>
              <p className="text-gray-600">
                Tất cả các gói dịch vụ đều bao gồm hỗ trợ kỹ thuật 24/7 qua email
                và điện thoại. Gói Premium và Featured có ưu tiên hỗ trợ cao hơn.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Làm thế nào để thanh toán?
              </h3>
              <p className="text-gray-600">
                Chúng tôi chấp nhận thanh toán qua thẻ tín dụng, chuyển khoản ngân hàng,
                và các ví điện tử phổ biến tại Việt Nam.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Cần hỗ trợ thêm?
          </h2>
          <p className="text-gray-600 mb-6">
            Liên hệ với đội ngũ chăm sóc khách hàng của chúng tôi để được tư vấn
            gói dịch vụ phù hợp nhất với nhu cầu của bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Liên hệ tư vấn
            </button>
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Xem demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;