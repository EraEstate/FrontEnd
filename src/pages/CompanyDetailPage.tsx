import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Building2,
  Calendar,
  ChevronLeft,
  Share2,
  Heart
} from 'lucide-react';
import { companyAPI } from '../api/services';
import type { Company } from '../api/types';
import { useTranslation } from 'react-i18next';
import toast from '../utils/toast';

const CompanyDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const loadCompany = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await companyAPI.getById(id);

        if (response) {
          setCompany(response);
        }
      } catch (error) {
        toast.error('Kh�ng th? t?i th�ng tin c�ng ty');
        // Không có fallback data, chỉ log error
      } finally {
        setLoading(false);
      }
    };

    loadCompany();
  }, [id]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DEVELOPER': return 'text-blue-600 bg-blue-100';
      case 'AGENCY': return 'text-green-600 bg-green-100';
      case 'INVESTOR': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'DEVELOPER': return 'Chủ đầu tư';
      case 'AGENCY': return t('common.broker');
      case 'INVESTOR': return 'Đầu tư';
      default: return type;
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

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy công ty</h1>
          <Link to="/companies" className="text-blue-600 hover:text-blue-700">
            Quay lại danh sách công ty
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
          <ChevronLeft className="h-4 w-4" />
          <Link to="/companies" className="hover:text-blue-600">Công ty</Link>
          <ChevronLeft className="h-4 w-4" />
          <span className="text-gray-900">{company.name}</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
                  <div className="flex items-center space-x-4 text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{company.address}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(company.companyType)}`}>
                      {getTypeLabel(company.companyType)}
                    </span>
                  </div>
                  {company.about && (
                    <p className="text-gray-600">{company.about}</p>
                  )}
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
                  <div className="text-2xl font-bold text-blue-600">{company.projectCount}</div>
                  <div className="text-sm text-gray-600">Dự án</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{company.propertyCount}</div>
                  <div className="text-sm text-gray-600">Bất động sản</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{company.agencies?.length || 0}</div>
                  <div className="text-sm text-gray-600">Chi nhánh</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {new Date(company.createdAt).getFullYear()}
                  </div>
                  <div className="text-sm text-gray-600">Năm thành lập</div>
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
                    <div className="font-medium text-gray-900">{company.representative || 'N/A'}</div>
                    <div className="text-sm text-gray-600">Người đại diện</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <a href={`tel:${company.phone}`} className="text-blue-600 hover:text-blue-700">
                    {company.phone}
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <a href={`mailto:${company.email}`} className="text-blue-600 hover:text-blue-700">
                    {company.email}
                  </a>
                </div>
                {company.websiteUrl && (
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <a href={company.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                      Website
                    </a>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">Mã số thuế</div>
                    <div className="text-sm text-gray-600">{company.taxCode}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Company Logo/Image */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                {company.logoUrl ? (
                  <img src={company.logoUrl} alt={company.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="text-white text-6xl font-bold">
                    {company.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* About Company */}
            {company.about && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Giới thiệu công ty</h2>
                <p className="text-gray-600 leading-relaxed">{company.about}</p>
              </div>
            )}

            {/* Projects */}
            {company.projects && company.projects.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Dự án nổi bật</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {company.projects.slice(0, 4).map((project) => (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="block hover:shadow-md transition-shadow rounded-lg overflow-hidden border"
                    >
                      <div className="aspect-video bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">Project Image</span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
                        <p className="text-sm text-gray-600">{project.address}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Properties */}
            {company.properties && company.properties.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Bất động sản đang bán</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {company.properties.slice(0, 4).map((property) => (
                    <Link
                      key={property.id}
                      to={`/properties/${property.id}`}
                      className="block hover:shadow-md transition-shadow rounded-lg overflow-hidden border"
                    >
                      <div className="aspect-video bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">Property Image</span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1">{property.title}</h3>
                        <p className="text-sm text-gray-600">{property.address}</p>
                        <p className="text-lg font-bold text-red-600">{property.price?.toLocaleString()} VND</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng dự án:</span>
                  <span className="font-medium">{company.projectCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng bất động sản:</span>
                  <span className="font-medium">{company.propertyCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chi nhánh:</span>
                  <span className="font-medium">{company.agencies?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    company.status === 'ACTIVE' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                  }`}>
                    {company.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vị trí</h3>
              <div className="space-y-2">
                {company.province && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{company.province.name}</span>
                  </div>
                )}
                {company.district && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{company.district.name}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{company.address}</span>
                </div>
              </div>
            </div>

            {/* Related Companies */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Công ty cùng loại</h3>
              <div className="space-y-3">
                <Link to="/companies/2" className="block hover:bg-gray-50 p-3 rounded">
                  <div className="font-medium text-gray-900">Masterise Homes</div>
                  <div className="text-sm text-gray-600">Chủ đầu tư</div>
                </Link>
                <Link to="/companies/3" className="block hover:bg-gray-50 p-3 rounded">
                  <div className="font-medium text-gray-900">Sunshine Group</div>
                  <div className="text-sm text-gray-600">Đầu tư</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailPage;