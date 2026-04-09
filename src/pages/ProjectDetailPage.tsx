import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Building2,
  ChevronLeft,
  Share2,
  Heart
} from 'lucide-react';
import { projectAPI } from '../api/services';
import type { Project } from '../api/types';
import { useTranslation } from 'react-i18next';
import { getImageUrl, getImagePlaceholder } from '../utils/imageUtils';
import toast from '../utils/toast';

const ProjectDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await projectAPI.getById(id);

        if (response) {
          setProject(response);
          // Increment view count
          await projectAPI.incrementViewCount(id);
        }
      } catch (error) {
        toast.error('Kh�ng th? t?i th�ng tin d? �n');
        // Không có fallback data, chỉ log error
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đang mở bán': return 'text-green-600 bg-green-100';
      case 'Đang phát triển': return 'text-yellow-600 bg-yellow-100';
      case 'Đã hoàn thành': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 rounded-lg mb-6"></div>
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy dự án</h1>
          <Link to="/projects" className="text-blue-600 hover:text-blue-700">
            Quay lại danh sách dự án
          </Link>
        </div>
      </div>
    );
  }

  const allImages = [project.featuredImageUrl, ...(project.images?.map(img => img.imageUrl) || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
          <ChevronLeft className="h-4 w-4" />
          <Link to="/projects" className="hover:text-blue-600">Dự án</Link>
          <ChevronLeft className="h-4 w-4" />
          <span className="text-gray-900">{project.name}</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
                  <div className="flex items-center space-x-4 text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{project.address}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.projectStatus)}`}>
                      {project.projectStatus}
                    </span>
                  </div>
                  <p className="text-gray-600">{project.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsFavorited(!isFavorited)}
                    className={`p-2 rounded-full ${isFavorited ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:text-red-600'}`}
                  >
                    <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-2 rounded-full text-gray-400 hover:text-blue-600">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{formatPrice(project.minPrice)}</div>
                  <div className="text-sm text-gray-600">Giá từ</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{project.area}</div>
                  <div className="text-sm text-gray-600">Hecta</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{project.properties?.length || 0}</div>
                  <div className="text-sm text-gray-600">Căn hộ</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{project.viewCount}</div>
                  <div className="text-sm text-gray-600">Lượt xem</div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="lg:w-80 bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin liên hệ</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">{project.developer}</div>
                    <div className="text-sm text-gray-600">Chủ đầu tư</div>
                  </div>
                </div>
                {project.contactPhone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <a href={`tel:${project.contactPhone}`} className="text-blue-600 hover:text-blue-700">
                      {project.contactPhone}
                    </a>
                  </div>
                )}
                {project.contactEmail && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <a href={`mailto:${project.contactEmail}`} className="text-blue-600 hover:text-blue-700">
                      {project.contactEmail}
                    </a>
                  </div>
                )}
                {project.websiteUrl && (
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                      Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative h-96">
                <img
                  src={getImageUrl(allImages[activeImageIndex]) || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"}
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {allImages.length > 1 && (
                <div className="p-4 border-t">
                  <div className="flex space-x-2 overflow-x-auto">
                    {allImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${
                          activeImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={getImageUrl(image) || getImagePlaceholder(80, 80)}
                          alt={`Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Project Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin chi tiết</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tổng quan</h3>
                  <p className="text-gray-600 mb-4">{project.overview}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loại dự án:</span>
                      <span className="font-medium">{project.projectType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Diện tích:</span>
                      <span className="font-medium">{project.area} ha</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trạng thái:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.projectStatus)}`}>
                        {project.projectStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tiện ích</h3>
                  <p className="text-gray-600">{project.utilities}</p>
                </div>
              </div>
            </div>

            {/* Location Advantages */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Vị trí và lợi thế</h2>
              <p className="text-gray-600">{project.locationAdvantages}</p>
            </div>

            {/* Investment Attractions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tiềm năng đầu tư</h2>
              <p className="text-gray-600">{project.investmentAttractions}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Range */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Khoảng giá</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {formatPrice(project.minPrice)} - {formatPrice(project.maxPrice)}
                </div>
                <div className="text-sm text-gray-600">VND</div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Diện tích:</span>
                  <span className="font-medium">{project.area} ha</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số căn:</span>
                  <span className="font-medium">{project.properties?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lượt xem:</span>
                  <span className="font-medium">{project.viewCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cập nhật:</span>
                  <span className="font-medium">
                    {new Date(project.updatedAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Related Projects */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dự án liên quan</h3>
              <div className="space-y-3">
                <Link to="/projects/2" className="block hover:bg-gray-50 p-3 rounded">
                  <div className="font-medium text-gray-900">Masteri Centre Point</div>
                  <div className="text-sm text-gray-600">Quận 9, TP.HCM</div>
                </Link>
                <Link to="/projects/3" className="block hover:bg-gray-50 p-3 rounded">
                  <div className="font-medium text-gray-900">Sunshine Diamond River</div>
                  <div className="text-sm text-gray-600">Quận 4, TP.HCM</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;