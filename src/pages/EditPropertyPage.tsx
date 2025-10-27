import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, MapPin, DollarSign, Bed, Bath, Ruler, Camera } from 'lucide-react';
import { useProperty, useUpdateProperty, useProvinces, useDistricts, useWards } from '../api/hooks';
import { uploadAPI } from '../api/upload';
import { getImageUrl, getImagePlaceholder } from '../utils/imageUtils';
import { useTranslation } from 'react-i18next';

const EditPropertyPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: property, loading: propertyLoading } = useProperty(id!);
  const { mutate: updateProperty, loading: updating } = useUpdateProperty();

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');

  const { data: provinces } = useProvinces();
  const { data: districts } = useDistricts(selectedProvince);
  const { data: wards } = useWards(selectedDistrict);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    propertyType: 'APARTMENT',
    listingType: 'SALE',
    latitude: '',
    longitude: '',
    imageUrls: [] as string[] // URLs from database or newly uploaded
  });

  const [newImageFiles, setNewImageFiles] = useState<File[]>([]); // New files to upload
  const [imagePreviews, setImagePreviews] = useState<{ url: string; isNew: boolean; fileIndex?: number }[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (property) {
      console.log('Loading property data:', property);
      
      // Load existing images from database
      // Backend returns propertyImages (not images) with @JsonProperty("propertyImages")
      const existingImageUrls = property.propertyImages?.map((img: any) => img.imageUrl) || 
                                property.images?.map((img: any) => img.imageUrl) || 
                                [];
      
      // Helper to safely convert number to string
      const numToString = (val: any): string => {
        if (val === null || val === undefined) return '';
        return String(val);
      };
      
      // Load all property data from database
      setFormData({
        title: property.title || '',
        description: property.description || '',
        price: numToString(property.price),
        area: numToString(property.area),
        bedrooms: numToString(property.bedrooms),
        bathrooms: numToString(property.bathrooms),
        address: property.address || property.location?.address || '',
        city: property.location?.province?.name || '',
        district: property.location?.district?.name || '',
        ward: property.location?.ward?.name || '',
        propertyType: property.propertyType || 'APARTMENT',
        listingType: property.listingType || 'SALE',
        latitude: numToString(property.latitude),
        longitude: numToString(property.longitude),
        imageUrls: existingImageUrls
      });
      
      // Set location IDs (convert to string if needed)
      const provinceId = property.location?.province?.id;
      const districtId = property.location?.district?.id;
      const wardId = property.location?.ward?.id;
      
      setSelectedProvince(provinceId ? String(provinceId) : '');
      setSelectedDistrict(districtId ? String(districtId) : '');
      setSelectedWard(wardId ? String(wardId) : '');
      
      // Initialize image previews with existing images from database
      setImagePreviews(existingImageUrls.map((url: string) => ({
        url,
        isNew: false
      })));
      
      console.log('Form data loaded:', {
        formData: {
          title: property.title,
          price: property.price,
          area: property.area,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          propertyType: property.propertyType,
          listingType: property.listingType,
        },
        location: {
          provinceId: provinceId,
          districtId: districtId,
          wardId: wardId,
        },
        images: existingImageUrls.length
      });
    }
  }, [property]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      // Cleanup all new image preview URLs when component unmounts
      imagePreviews.forEach(preview => {
        if (preview.isNew && preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on unmount

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvince(provinceId);
    setSelectedDistrict('');
    setSelectedWard('');
    setFormData(prev => ({ ...prev, city: provinces?.find((p: any) => p.id.toString() === provinceId)?.name || '' }));
  };

  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrict(districtId);
    setSelectedWard('');
    const district = districts?.find((d: any) => d.id.toString() === districtId);
    setFormData(prev => ({ ...prev, district: district?.name || '' }));
  };

  const handleWardChange = (wardId: string) => {
    setSelectedWard(wardId);
    const ward = wards?.find((w: any) => w.id.toString() === wardId);
    setFormData(prev => ({ ...prev, ward: ward?.name || '' }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      
      // Validate file count
      if (imagePreviews.length + fileArray.length > 10) {
        alert('Tối đa 10 hình ảnh');
        e.target.value = '';
        return;
      }
      
      // Validate file size and type
      for (const file of fileArray) {
        if (file.size > 5 * 1024 * 1024) {
          alert(`File ${file.name} vượt quá 5MB`);
          e.target.value = '';
          return;
        }
        if (!file.type.startsWith('image/')) {
          alert(`File ${file.name} không phải là hình ảnh`);
          e.target.value = '';
          return;
        }
      }
      
      // Create previews for new images first (before updating state)
      const newPreviews = fileArray.map((file) => ({
        url: URL.createObjectURL(file),
        isNew: true
      }));
      
      // Update states
      setNewImageFiles(prev => [...prev, ...fileArray]);
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
    // Reset input
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    const preview = imagePreviews[index];
    
    // If it's a new file, remove from newImageFiles
    if (preview.isNew) {
      // Find the actual file index in newImageFiles array
      const newFileIndex = imagePreviews.slice(0, index).filter(p => p.isNew).length;
      setNewImageFiles(prev => prev.filter((_, i) => i !== newFileIndex));
      // Revoke object URL to free memory
      URL.revokeObjectURL(preview.url);
    } else {
      // If it's an existing image, remove from imageUrls
      // Find the index in imageUrls array (count existing images before this index)
      const existingImageIndex = imagePreviews.slice(0, index).filter(p => !p.isNew).length;
      setFormData(prev => ({
        ...prev,
        imageUrls: prev.imageUrls.filter((_, i) => i !== existingImageIndex)
      }));
    }
    
    // Remove from previews
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setUploadingImages(true);
      
      // Upload new images first
      let newImageUrls: string[] = [];
      if (newImageFiles.length > 0) {
        newImageUrls = await uploadAPI.uploadPropertyImages(newImageFiles);
      }
      
      // Merge existing imageUrls with newly uploaded ones
      const allImageUrls = [...formData.imageUrls, ...newImageUrls];
      
      // Prepare location data
      const provinceId = selectedProvince || property?.location?.province?.id;
      const districtId = selectedDistrict || property?.location?.district?.id;
      const wardId = selectedWard || property?.location?.ward?.id;
      
      if (!provinceId || !districtId || !wardId) {
        alert('Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện và Phường/Xã');
        setUploadingImages(false);
        return;
      }
      
      const updateData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        area: parseFloat(formData.area),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        provinceId: provinceId,
        districtId: districtId,
        wardId: wardId,
        address: formData.address,
        propertyType: formData.propertyType,
        listingType: formData.listingType,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        imageUrls: allImageUrls
      };

      await updateProperty({ id: id!, data: updateData });
      navigate(`/properties/${id}`);
    } catch (error: any) {
      console.error('Error updating property:', error);
      alert('Cập nhật thất bại: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploadingImages(false);
    }
  };

  if (propertyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 mt-10 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 text-red-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 mt-10 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy bất động sản</h2>
          <p className="text-gray-600">Bất động sản này không tồn tại hoặc đã bị xóa.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-10">
      <div className="w-full max-w-4xl mx-auto px-6 lg:px-12 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Chỉnh sửa bất động sản</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Thông tin cơ bản</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Nhập tiêu đề bất động sản"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại bất động sản *
                  </label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="APARTMENT">Căn hộ</option>
                    <option value="HOUSE">Nhà riêng</option>
                    <option value="VILLA">Biệt thự</option>
                    <option value="OFFICE">Văn phòng</option>
                    <option value="LAND">Đất nền</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại giao dịch *
                  </label>
                  <select
                    name="listingType"
                    value={formData.listingType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="SALE">Bán</option>
                    <option value="RENT">Cho thuê</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    Giá (VNĐ) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Nhập giá"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Ruler className="h-4 w-4 inline mr-1" />
                    Diện tích (m²) *
                  </label>
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Nhập diện tích"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Bed className="h-4 w-4 inline mr-1" />
                      Phòng ngủ
                    </label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Bath className="h-4 w-4 inline mr-1" />
                      Phòng tắm
                    </label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder={t('postProperty.descriptionPlaceholder')}
                />
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Địa chỉ</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỉnh/Thành phố *
                  </label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Chọn tỉnh/thành phố</option>
                    {provinces?.map((province: any) => (
                      <option key={province.id} value={province.id}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quận/Huyện
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    disabled={!selectedProvince}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Chọn quận/huyện</option>
                    {districts?.map((district: any) => (
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
                    value={selectedWard}
                    onChange={(e) => handleWardChange(e.target.value)}
                    disabled={!selectedDistrict}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Chọn phường/xã</option>
                    {wards?.map((ward: any) => (
                      <option key={ward.id} value={ward.id}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Địa chỉ cụ thể *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nhập địa chỉ cụ thể"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vĩ độ
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    step="any"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="10.762622"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kinh độ
                  </label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    step="any"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="106.660172"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Hình ảnh</h2>
              <p className="text-sm text-gray-600">
                Tải lên tối đa 10 hình ảnh. Hình ảnh đầu tiên sẽ là hình đại diện.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview.isNew ? preview.url : getImageUrl(preview.url) || getImagePlaceholder(200, 150)}
                      alt={`Property ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getImagePlaceholder(200, 150);
                      }}
                    />
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                        Ảnh đại diện
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Xóa ảnh"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {imagePreviews.length < 10 && (
                  <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-red-500 hover:bg-red-50 transition-colors">
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm text-gray-600">Thêm ảnh</span>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImages}
                    />
                  </label>
                )}
              </div>

              {imagePreviews.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Chưa có hình ảnh nào</p>
                  <label className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 cursor-pointer inline-block">
                    Chọn ảnh từ máy tính
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImages}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={updating || uploadingImages}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingImages ? 'Đang tải ảnh...' : updating ? 'Đang cập nhật...' : 'Cập nhật bất động sản'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPropertyPage;