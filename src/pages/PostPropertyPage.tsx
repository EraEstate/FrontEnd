import React, { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Building2, 
  MapPin, 
  Camera, 
  X, 
  DollarSign, 
  Home, 
  Ruler, 
  Bed, 
  Bath,
  Car,
  Wifi,
  Shield,
  Trees,
  Mountain,
  ArrowUp,
  Wind,
  AlertCircle,
  CheckCircle,
  Upload,
  Wand2,
  Sparkles,
  Eye,
  Loader2,
  RotateCcw,
  Copy,
  Check,
  FileText,
  Pencil
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useProvinces, useDistricts, useWards } from '../api/hooks';
import { propertyAPI } from '../api';
import { uploadAPI } from '../api/upload';
import toast from '../utils/toast';
import type { Province, District, Ward } from '../types';
import AddressAutocomplete from '../components/AddressAutocomplete';
import type { AddressDetails } from '../components/AddressAutocomplete';
import { subscriptionAPI } from '../api/subscription';
import { aiListingAPI } from '../api/aiListing';
import type { UserSubscription } from '../types';

interface PropertyForm {
  title: string;
  description: string;
  propertyType: string;
  transactionType: string;
  price: string;
  area: string;
  address: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  bedrooms: string;
  bathrooms: string;
  floors: string;
  yearBuilt: string;
  furnishing: string;
  features: string[];
  images: File[];
}

// Separate Title Input Component to prevent re-renders
const TitleInput = memo<{
  value: string;
  onChange: (value: string) => void;
}>(({ value, onChange }) => {
  return (
    <input
      id="title"
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="VD: Căn hộ cao cấp 2PN2WC view sông tại Vinhomes Central Park"
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
    />
  );
});

const PostPropertyPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // === AI Listing Content States ===
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPreviewOpen, setAiPreviewOpen] = useState(false);
  const [aiTitle, setAiTitle] = useState('');
  const [aiDescription, setAiDescription] = useState('');
  const [aiKeywords, setAiKeywords] = useState<string[]>([]);
  const [aiRawNotes, setAiRawNotes] = useState('');
  const [aiError, setAiError] = useState('');

  React.useEffect(() => {
    if (user) {
      subscriptionAPI.getCurrent().then(sub => {
        setSubscription(sub);
        if (sub && sub.listingPackage && sub.listingPackage.maxProperties !== null) {
          if (sub.propertiesUsed >= sub.listingPackage.maxProperties) {
            setQuotaExceeded(true);
          }
        }
      });
    }
  }, [user]);

  const [formData, setFormData] = useState<PropertyForm>({
    title: '',
    description: '',
    propertyType: '',
    transactionType: '',
    price: '',
    area: '',
    address: '',
    provinceId: '',
    districtId: '',
    wardId: '',
    bedrooms: '',
    bathrooms: '',
    floors: '',
    yearBuilt: '',
    furnishing: '',
    features: [],
    images: []
  });

  const { data: provinces } = useProvinces();
  const { data: districts } = useDistricts(formData.provinceId);
  const { data: wards } = useWards(formData.districtId);

  const propertyTypes = [
    { value: 'APARTMENT', label: t('postProperty.apartment'), icon: Building2 },
    { value: 'HOUSE', label: t('postProperty.house'), icon: Home },
    { value: 'VILLA', label: t('postProperty.villa'), icon: Mountain },
    { value: 'OFFICE', label: t('postProperty.office'), icon: Building2 },
    { value: 'LAND', label: t('postProperty.land'), icon: Trees },
  ];

  const transactionTypes = [
    { value: 'SALE', label: t('common.sell'), color: 'bg-green-100 text-green-800' },
    { value: 'RENT', label: t('postProperty.forRent'), color: 'bg-blue-100 text-blue-800' },
  ];

  const furnishingOptions = [
    { value: 'UNFURNISHED', label: t('postProperty.noFurniture') },
    { value: 'SEMI_FURNISHED', label: t('postProperty.basicFurniture') },
    { value: 'FULLY_FURNISHED', label: t('postProperty.fullFurniture') },
  ];

  const availableFeatures = [
    { id: 'parking', label: t('postProperty.parking'), icon: Car },
    { id: 'wifi', label: t('postProperty.wifi'), icon: Wifi },
    { id: 'security', label: t('postProperty.security247'), icon: Shield },
    { id: 'garden', label: t('postProperty.garden'), icon: Trees },
    { id: 'balcony', label: t('postProperty.balcony'), icon: Mountain },
    { id: 'elevator', label: t('postProperty.elevator'), icon: ArrowUp },
    { id: 'airConditioning', label: t('postProperty.airConditioning'), icon: Wind },
  ];

  const steps = [
    { id: 1, title: t('postProperty.basicInfo'), description: t('postProperty.typeAndTransaction') },
    { id: 2, title: t('postProperty.propertyDetails'), description: t('postProperty.areaPriceAddress') },
    { id: 3, title: t('postProperty.descriptionAndFeatures'), description: t('postProperty.detailsAndAmenities') },
    { id: 4, title: t('postProperty.images'), description: t('postProperty.uploadImages') },
    { id: 5, title: t('postProperty.previewAndPost'), description: t('postProperty.reviewAndComplete') },
  ];

  // === AI Generate Handler ===
  const handleAIGenerate = useCallback(async () => {
    setAiGenerating(true);
    setAiError('');
    try {
      // Lấy tên tỉnh/quận/phường từ ID
      const provinceName = provinces?.find((p: Province) => p.id.toString() === formData.provinceId)?.name || '';
      const districtName = districts?.find((d: District) => d.id.toString() === formData.districtId)?.name || '';
      const wardName = wards?.find((w: Ward) => w.id.toString() === formData.wardId)?.name || '';

      const result = await aiListingAPI.generate({
        propertyType: formData.propertyType,
        transactionType: formData.transactionType,
        area: formData.area,
        price: formData.price,
        address: formData.address,
        provinceName,
        districtName,
        wardName,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        floors: formData.floors,
        yearBuilt: formData.yearBuilt,
        furnishing: formData.furnishing,
        features: formData.features,
        rawNotes: aiRawNotes,
        currentTitle: formData.title || undefined,
        currentDescription: formData.description || undefined,
      });

      if (result.status === 'success') {
        setAiTitle(result.title || '');
        setAiDescription(result.description || '');
        setAiKeywords(result.seoKeywords || []);
        setAiPreviewOpen(true);
      } else {
        setAiError('Không thể tạo nội dung. Vui lòng thử lại.');
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || 'Có lỗi xảy ra khi tạo nội dung AI.';
      setAiError(errMsg);
      toast.error(errMsg);
    } finally {
      setAiGenerating(false);
    }
  }, [formData, provinces, districts, wards, aiRawNotes]);

  // Apply AI content to form
  const handleApplyAIContent = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      title: aiTitle,
      description: aiDescription,
    }));
    setAiPreviewOpen(false);
  }, [aiTitle, aiDescription]);

  const handleInputChange = useCallback((field: keyof PropertyForm, value: string | string[] | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Handle address autocomplete selection
  const handleAddressChange = useCallback((address: string, details?: AddressDetails) => {
    setFormData(prev => ({ ...prev, address }));

    if (!details || !provinces) return;

    // Helper function to normalize names for matching
    const normalizeName = (name: string): string => {
      return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/thành phố|tỉnh|tp\.?/g, '')
        .replace(/quận|huyện|thị xã/g, '')
        .replace(/phường|xã|thị trấn/g, '')
        .trim();
    };

    // Try to match province (from Nominatim: state field)
    if (details.province) {
      const provinceName = details.province;
      const normalizedProvince = normalizeName(provinceName);
      
      const matchedProvince = provinces.find((p: Province) => {
        const normalizedP = normalizeName(p.name);
        return normalizedProvince === normalizedP || 
               normalizedProvince.includes(normalizedP) || 
               normalizedP.includes(normalizedProvince) ||
               provinceName.includes(p.name) ||
               p.name.includes(provinceName);
      });
      
      if (matchedProvince) {
        setFormData(prev => ({ ...prev, provinceId: matchedProvince.id.toString() }));
      }
    }

    // Try to match district (after province is set, wait for districts to load)
    if (details.district) {
      setTimeout(() => {
        const districtName = details.district;
        if (!districtName || !districts) return;
        
        const normalizedDistrict = normalizeName(districtName);
        
        const matchedDistrict = districts.find((d: District) => {
          const normalizedD = normalizeName(d.name);
          return normalizedDistrict === normalizedD ||
                 normalizedDistrict.includes(normalizedD) ||
                 normalizedD.includes(normalizedDistrict) ||
                 districtName.includes(d.name) ||
                 d.name.includes(districtName);
        });
        
        if (matchedDistrict) {
          setFormData(prev => ({ ...prev, districtId: matchedDistrict.id.toString() }));
          
          // Try to match ward (after district is set, wait for wards to load)
          if (details.ward) {
            setTimeout(() => {
              const wardName = details.ward;
              if (!wardName || !wards) return;
              
              const normalizedWard = normalizeName(wardName);
              
              const matchedWard = wards.find((w: Ward) => {
                const normalizedW = normalizeName(w.name);
                return normalizedWard === normalizedW ||
                       normalizedWard.includes(normalizedW) ||
                       normalizedW.includes(normalizedWard) ||
                       wardName.includes(w.name) ||
                       w.name.includes(wardName);
              });
              
              if (matchedWard) {
                setFormData(prev => ({ ...prev, wardId: matchedWard.id.toString() }));
              }
            }, 300);
          }
        }
      }, 600);
    }
  }, [provinces, districts, wards]);


  const handleFeatureToggle = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 10) // Maximum 10 images
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.propertyType && formData.transactionType);
      case 2:
        return !!(formData.price && formData.area && formData.provinceId && formData.districtId);
      case 3:
        return !!(formData.title && formData.description);
      case 4:
        return formData.images.length >= 1;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Validation
    if (!formData.provinceId || !formData.districtId || !formData.wardId) {
      toast.error('Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện và Phường/Xã');
      return;
    }

    if (!formData.transactionType) {
      toast.error('Vui lòng chọn hình thức giao dịch (Bán hoặc Cho thuê)');
      return;
    }

    setLoading(true);
    try {
      // Upload images first
      let imageUrls: string[] = [];
      if (formData.images.length > 0) {
        try {
          imageUrls = await uploadAPI.uploadPropertyImages(formData.images);
          if (imageUrls.length === 0) {
            throw new Error('Không thể upload ảnh. Vui lòng thử lại.');
          }
        } catch (error: any) {
          toast.error('L?i t?i ?nh l�n');
          toast.error('Lỗi khi upload ảnh: ' + (error.response?.data?.error || error.message));
          setLoading(false);
          return;
        }
      }

      // Create property data - map transactionType to listingType
      const propertyData = {
        title: formData.title,
        description: formData.description || '',
        propertyType: formData.propertyType,
        listingType: formData.transactionType, // Map transactionType to listingType
        price: parseFloat(formData.price),
        area: parseFloat(formData.area),
        address: formData.address,
        provinceId: formData.provinceId, // Keep as String
        districtId: formData.districtId, // Keep as String
        wardId: formData.wardId, // Keep as String
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) || 0 : 0,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) || 0 : 0,
        imageUrls: imageUrls, // Add uploaded image URLs
      };

      // Submit property
      await propertyAPI.create(propertyData);
      
      // Success
      toast.success('Đăng tin thành công! 🎉');
      navigate('/profile?tab=properties');
    } catch (error) {
      toast.error('L?i dang b?t d?ng s?n');
      toast.error(t('postProperty.postError'));
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (isNaN(num)) return '';
    
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)} tỷ`;
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(0)} triệu`;
    }
    return num.toLocaleString('vi-VN');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h2>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để đăng tin bất động sản</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  if (quotaExceeded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-red-200 max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Đã hết hạn mức đăng tin</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Bạn đã sử dụng hết <span className="font-bold text-red-600">{subscription?.listingPackage?.maxProperties}</span> lượt đăng tin trong gói <b>{subscription?.listingPackage?.name}</b> hiện tại.<br/><br/>
            Vui lòng nâng cấp gói để tiếp tục đăng tin bất động sản.
          </p>
          <button
            onClick={() => navigate('/pricing')}
            className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-medium shadow-sm transition-colors"
          >
            Xem các gói dịch vụ
          </button>
          <button
            onClick={() => navigate('/profile?tab=subscription')}
            className="w-full mt-3 bg-white text-gray-600 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Quản lý gói hiện tại
          </button>
        </div>
      </div>
    );
  }

  const renderStepIndicator = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep >= step.id 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {currentStep > step.id ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span>{step.id}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`h-1 w-16 mx-4 ${
                currentStep > step.id ? 'bg-red-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-lg font-semibold text-gray-900">
          {steps[currentStep - 1].title}
        </h3>
        <p className="text-gray-600">
          {steps[currentStep - 1].description}
        </p>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Chọn loại hình bất động sản</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {propertyTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.value}
              onClick={() => handleInputChange('propertyType', type.value)}
              className={`p-6 border-2 rounded-lg text-center transition-all ${
                formData.propertyType === type.value
                  ? 'border-red-600 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon className="w-12 h-12 mx-auto mb-3" />
              <div className="font-semibold">{type.label}</div>
            </button>
          );
        })}
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-6">Hình thức giao dịch</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {transactionTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => handleInputChange('transactionType', type.value)}
            className={`p-6 border-2 rounded-lg text-center transition-all ${
              formData.transactionType === type.value
                ? 'border-red-600 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`inline-block px-4 py-2 rounded-full font-semibold mb-2 ${type.color}`}>
              {type.label}
            </div>
            <div className="text-gray-600">
              {type.value === 'SALE' ? t('properties.sellProperty') : t('postProperty.rentProperty')}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Giá {formData.transactionType === 'RENT' ? t('postProperty.rent') : t('common.sell')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="VD: 5500000000"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          {formData.price && (
            <p className="text-sm text-gray-600 mt-1">
              ≈ {formatPrice(formData.price)} VND
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Diện tích <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Ruler className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="number"
              value={formData.area}
              onChange={(e) => handleInputChange('area', e.target.value)}
              placeholder="VD: 85"
              className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <span className="absolute right-3 top-2.5 text-gray-400">m²</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tỉnh/Thành phố <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.provinceId}
            onChange={(e) => handleInputChange('provinceId', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Chọn tỉnh/thành phố</option>
            {provinces?.map((province: Province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quận/Huyện <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.districtId}
            onChange={(e) => handleInputChange('districtId', e.target.value)}
            disabled={!formData.provinceId}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100"
          >
            <option value="">Chọn quận/huyện</option>
            {districts?.map((district: District) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phường/Xã
          </label>
          <select
            value={formData.wardId}
            onChange={(e) => handleInputChange('wardId', e.target.value)}
            disabled={!formData.districtId}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100"
          >
            <option value="">Chọn phường/xã</option>
            {wards?.map((ward: Ward) => (
              <option key={ward.id} value={ward.id}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Địa chỉ cụ thể <span className="text-gray-500 text-xs">(Tìm kiếm tự động)</span>
        </label>
        <AddressAutocomplete
          value={formData.address}
          onChange={handleAddressChange}
          placeholder="VD: Số 123, Đường Nguyễn Huệ, Quận 1, TP.HCM"
        />
        <p className="text-xs text-gray-500 mt-1">
          💡 Nhập địa chỉ (tối thiểu 3 ký tự) và chọn từ gợi ý để tự động điền Tỉnh/Quận/Huyện
        </p>
      </div>

      {formData.propertyType && ['APARTMENT', 'HOUSE', 'VILLA'].includes(formData.propertyType) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phòng ngủ
            </label>
            <div className="relative">
              <Bed className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                placeholder="0"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phòng tắm
            </label>
            <div className="relative">
              <Bath className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={formData.bathrooms}
                onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                placeholder="0"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số tầng
            </label>
            <input
              type="number"
              value={formData.floors}
              onChange={(e) => handleInputChange('floors', e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Năm xây dựng
            </label>
            <input
              type="number"
              value={formData.yearBuilt}
              onChange={(e) => handleInputChange('yearBuilt', e.target.value)}
              placeholder="2020"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* === AI Toggle Banner === */}
      <div className="bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Trợ lý AI viết nội dung</h3>
              <p className="text-xs text-gray-500">AI sẽ biến ghi chú của bạn thành bài đăng chuyên nghiệp, chuẩn SEO</p>
            </div>
          </div>
          <button
            onClick={() => setAiEnabled(!aiEnabled)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${
              aiEnabled ? 'bg-purple-600' : 'bg-gray-300'
            }`}
            id="ai-toggle"
          >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
              aiEnabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {aiEnabled && (
          <div className="space-y-4 mt-4">
            {/* Raw Notes Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1.5 text-purple-500" />
                Ghi chú nhanh cho AI <span className="text-gray-400 font-normal">(tuỳ chọn)</span>
              </label>
              <textarea
                value={aiRawNotes}
                onChange={(e) => setAiRawNotes(e.target.value)}
                rows={3}
                placeholder={"VD: Nhà 50m2, 2 lầu, gần chợ Bà Chiểu, hẻm xe hơi 6m\nCó sân thượng, mới sơn sửa\nPhù hợp ở hoặc kinh doanh nhỏ..."}
                className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white placeholder-gray-400 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                💡 Viết bất kỳ gạch đầu dòng, từ khóa, ưu điểm nào — AI sẽ tự chải chuốt thành bài viết hấp dẫn
              </p>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleAIGenerate}
              disabled={aiGenerating || !formData.propertyType}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 font-medium"
              id="ai-generate-btn"
            >
              {aiGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>AI đang sáng tạo nội dung...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>🪄 Tạo Tiêu đề & Mô tả bằng AI</span>
                </>
              )}
            </button>

            {!formData.propertyType && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Vui lòng chọn loại hình BĐS ở Bước 1 trước khi dùng AI
              </p>
            )}

            {aiError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            {/* Show badge when AI was already applied */}
            {formData.title && formData.description && (
              <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <CheckCircle className="w-4 h-4" />
                <span>Nội dung AI đã được áp dụng. Bạn có thể chỉnh sửa bên dưới hoặc tạo lại.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* === Manual Title & Description Section === */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Tiêu đề tin đăng <span className="text-red-500">*</span>
            </label>
            {formData.title && (
              <span className="text-xs text-gray-400">{formData.title.length} ký tự</span>
            )}
          </div>
          <input
            id="title-step3"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="VD: Căn hộ cao cấp 2PN2WC view sông tại Vinhomes Central Park"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả chi tiết <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={8}
            placeholder="Mô tả chi tiết về bất động sản: vị trí, thiết kế, tiện ích xung quanh..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.description.length}/2000 ký tự
          </p>
        </div>

        {formData.propertyType && ['APARTMENT', 'HOUSE', 'VILLA'].includes(formData.propertyType) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Tình trạng nội thất
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {furnishingOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleInputChange('furnishing', option.value)}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    formData.furnishing === option.value
                      ? 'border-red-600 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Tiện ích và đặc điểm
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {availableFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <button
                  key={feature.id}
                  onClick={() => handleFeatureToggle(feature.id)}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    formData.features.includes(feature.id)
                      ? 'border-red-600 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">{feature.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Hình ảnh bất động sản <span className="text-red-500">*</span>
        </h3>
        <p className="text-gray-600">
          Tải lên tối đa 10 hình ảnh. Hình ảnh đầu tiên sẽ là hình đại diện.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {formData.images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={URL.createObjectURL(image)}
              alt={`Preview ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
            <button
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
            {index === 0 && (
              <div className="absolute bottom-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                Ảnh đại diện
              </div>
            )}
          </div>
        ))}

        {formData.images.length < 10 && (
          <label className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-red-500 hover:bg-red-50 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">Tải ảnh lên</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      {formData.images.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Chưa có hình ảnh nào được tải lên</p>
          <label className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 cursor-pointer">
            Chọn ảnh từ máy tính
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Xem trước tin đăng</h3>
        
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900 mb-2">{formData.title}</h4>
              <div className="text-2xl font-bold text-red-600 mb-2">
                {formatPrice(formData.price)} VND
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                <span>{formData.area} m²</span>
                {formData.bedrooms && <span>• {formData.bedrooms} PN</span>}
                {formData.bathrooms && <span>• {formData.bathrooms} WC</span>}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{formData.address}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                formData.transactionType === 'SALE' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {formData.transactionType === 'SALE' ? t('common.sell') : t('postProperty.forRent')}
              </span>
            </div>
          </div>

          {formData.images.length > 0 && (
            <div className="mb-4">
              <img
                src={URL.createObjectURL(formData.images[0])}
                alt={t('common.preview')}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          <p className="text-gray-700 mb-4 whitespace-pre-wrap leading-relaxed">{formData.description}</p>

          {formData.features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.features.map((featureId) => {
                const feature = availableFeatures.find(f => f.id === featureId);
                return feature ? (
                  <span
                    key={featureId}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm"
                  >
                    {feature.label}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Lưu ý quan trọng</h4>
            <ul className="text-sm text-yellow-700 mt-2 space-y-1">
              <li>• Tin đăng sẽ được kiểm duyệt trong vòng 24 giờ</li>
              <li>• Đảm bảo thông tin chính xác và hình ảnh rõ nét</li>
              <li>• Tuân thủ quy định đăng tin của BDSPortal</li>
              <li>• Tin đăng miễn phí sẽ hiển thị trong 30 ngày</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* === AI Preview Modal === */}
      {aiPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Nội dung AI đã tạo</h3>
                  <p className="text-xs text-purple-200">Xem trước, chỉnh sửa rồi áp dụng vào tin đăng</p>
                </div>
              </div>
              <button
                onClick={() => setAiPreviewOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* AI Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <Pencil className="w-4 h-4 text-purple-500" />
                  Tiêu đề
                </label>
                <input
                  type="text"
                  value={aiTitle}
                  onChange={(e) => setAiTitle(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base font-medium"
                />
              </div>

              {/* AI Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-500" />
                  Mô tả chi tiết
                </label>
                <textarea
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm leading-relaxed"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{aiDescription.length} ký tự</p>
              </div>

              {/* SEO Keywords */}
              {aiKeywords.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🔍 Từ khóa SEO gợi ý
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {aiKeywords.map((kw, i) => (
                      <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
              <button
                onClick={() => {
                  setAiPreviewOpen(false);
                  handleAIGenerate();
                }}
                disabled={aiGenerating}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-white transition-colors text-sm font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                Tạo lại
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAiPreviewOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-white transition-colors text-sm"
                >
                  Huỷ
                </button>
                <button
                  onClick={handleApplyAIContent}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-purple-200 text-sm font-semibold"
                >
                  <Check className="w-4 h-4" />
                  Áp dụng nội dung AI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Đăng Tin <span className="text-red-600">Bất Động Sản</span>
            </h1>
            <p className="text-gray-600">
              Đăng tin miễn phí, tiếp cận hàng nghìn khách hàng tiềm năng
            </p>
          </div>

          {renderStepIndicator()}

          <div className="mb-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Quay lại
            </button>

            <div className="space-x-4">
              {currentStep < 5 ? (
                <button
                  onClick={handleNext}
                  disabled={!validateStep(currentStep)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tiếp tục
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('postProperty.posting') : t('postProperty.postButton')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPropertyPage;