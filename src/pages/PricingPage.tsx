import React, { useState, useEffect } from 'react';
import { Check, Clock, Mail, Crown, Star, Zap, Camera, Users, Shield, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { listingPackageAPI } from '../api/misc';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import PurchaseModal from '../components/PurchaseModal';

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  maxProperties: number | null;
  maxImagesPerProperty: number;
  isFeatured: boolean;
  isPremium: boolean;
  priorityLevel: number;
  includesSocialMedia: boolean;
  includesWebsiteBanner: boolean;
  includesEmailMarketing: boolean;
  analyticsIncluded: boolean;
  isPopular: boolean;
  status?: string;
}

const PricingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [packages, setPackages] = useState<{ content: Package[] }>({ content: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listingPackageAPI.getActivePackages();
      // Transform data to match expected format
      const transformed = Array.isArray(data) ? data : (data.content || []);
      setPackages({ content: transformed });
    } catch (err: any) {
      setError('Không thể tải danh sách gói dịch vụ');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseClick = (pkg: Package) => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để mua gói dịch vụ');
      navigate('/login');
      return;
    }
    setSelectedPackage(pkg);
    setShowPurchaseModal(true);
  };

  const handlePurchaseSuccess = () => {
    loadPackages();
    toast.success('Gói dịch vụ đã được kích hoạt thành công!');
  };

  const getPackageIcon = (packageName: string) => {
    if (packageName.toLowerCase().includes('premium')) return <Crown className="h-8 w-8 text-red-600" />;
    if (packageName.toLowerCase().includes('featured') || packageName.toLowerCase().includes('nổi bật')) return <Star className="h-8 w-8 text-red-600" />;
    return <Zap className="h-8 w-8 text-red-600" />;
  };

  const getPackageColor = (isPremium: boolean, isFeatured: boolean, isPopular: boolean) => {
    if (isPopular) return 'border-red-500 border-2 bg-white';
    if (isPremium) return 'border-gray-300 bg-white';
    if (isFeatured) return 'border-gray-300 bg-white';
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
    <div className="min-h-screen bg-white pt-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Đăng tin bất động sản của bạn với các gói dịch vụ chất lượng cao
          </h1>
          <p className="text-gray-600 mb-8">
            Chọn gói phù hợp với nhu cầu của bạn
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Theo tháng
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                billingPeriod === 'yearly' ? 'bg-red-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                  billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingPeriod === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Theo năm
              {billingPeriod === 'yearly' && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600">
                  Tiết kiệm 20%
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {packages?.content?.map((pkg: any) => (
            <div
              key={pkg.id}
              className={`relative rounded-lg border p-6 transition-all duration-200 hover:shadow-lg ${
                getPackageColor(pkg.isPremium, pkg.isFeatured, pkg.isPopular)
              }`}
            >
              {pkg.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-600 text-white">
                    Phổ biến nhất
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-red-50 rounded-lg">
                    {getPackageIcon(pkg.name)}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                <p className="text-gray-600 text-sm mb-5">{pkg.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(billingPeriod === 'yearly' ? pkg.price * 0.8 : pkg.price)}
                    </span>
                    <span className="text-gray-500 text-sm">
                      /{billingPeriod === 'yearly' ? 'năm' : 'tháng'}
                    </span>
                  </div>
                  {billingPeriod === 'yearly' && (
                    <div className="text-xs text-red-600 mt-2 font-medium">
                      Tiết kiệm {formatPrice(pkg.price * 0.2)} mỗi năm
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => handlePurchaseClick(pkg)}
                  className="w-full py-2.5 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                >
                  Chọn gói này
                </button>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Đăng tối đa {pkg.maxProperties || 'Không giới hạn'} bất động sản</span>
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <Camera className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Tối đa {pkg.maxImagesPerProperty} ảnh mỗi bất động sản</span>
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <Clock className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Thời hạn {pkg.durationDays} ngày</span>
                </div>

                {pkg.includesSocialMedia && (
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <Users className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Đăng lên mạng xã hội</span>
                  </div>
                )}

                {pkg.includesWebsiteBanner && (
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <Shield className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Banner quảng cáo trên website</span>
                  </div>
                )}

                {pkg.includesEmailMarketing && (
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <Mail className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Email marketing</span>
                  </div>
                )}

                {pkg.analyticsIncluded && (
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <BarChart3 className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Báo cáo thống kê chi tiết</span>
                  </div>
                )}

                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <Star className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Độ ưu tiên: {pkg.priorityLevel}/10</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Câu hỏi thường gặp
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                Làm thế nào để nâng cấp gói dịch vụ?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Bạn có thể nâng cấp gói dịch vụ bất kỳ lúc nào từ tài khoản của mình.
                Phí chênh lệch sẽ được tính theo tỷ lệ thời gian còn lại.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                Tôi có thể hủy gói dịch vụ không?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Có, bạn có thể hủy gói dịch vụ bất kỳ lúc nào. Chúng tôi sẽ hoàn lại
                phí cho thời gian chưa sử dụng theo chính sách hoàn tiền.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                Gói dịch vụ có bao gồm hỗ trợ kỹ thuật?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Tất cả các gói dịch vụ đều bao gồm hỗ trợ kỹ thuật 24/7 qua email
                và điện thoại. Gói Premium và Featured có ưu tiên hỗ trợ cao hơn.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                Làm thế nào để thanh toán?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Chúng tôi chấp nhận thanh toán qua thẻ tín dụng, chuyển khoản ngân hàng,
                và các ví điện tử phổ biến tại Việt Nam.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Cần hỗ trợ thêm?
          </h2>
          <p className="text-sm text-gray-600 mb-6 max-w-2xl mx-auto">
            Liên hệ với đội ngũ chăm sóc khách hàng của chúng tôi để được tư vấn
            gói dịch vụ phù hợp nhất với nhu cầu của bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold">
              Liên hệ tư vấn
            </button>
            <button className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold">
              Xem demo
            </button>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {selectedPackage && (
        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false);
            setSelectedPackage(null);
          }}
          packageData={{
            id: selectedPackage.id,
            name: selectedPackage.name,
            price: selectedPackage.price
          }}
          billingPeriod={billingPeriod}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </div>
  );
};

export default PricingPage;