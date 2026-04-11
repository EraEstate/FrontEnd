import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../api/services';
import type { Project } from '../api/types';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { MapPin } from 'lucide-react';
import toast from '../utils/toast';

const ProjectsPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    status: '',
    type: '',
    priceRange: ''
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingProjectId, setPendingProjectId] = useState<number | string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);

        // Nếu chưa đăng nhập: không gọi API thật, dùng mock để hiển thị giao diện
        if (!isAuthenticated) {
          setProjects(getMockProjects());
          return;
        }

        let response;
        if (selectedType) {
          response = await projectAPI.getByType(selectedType);
        } else {
          response = await projectAPI.getAll({ page: 0, size: 50 });
        }

        if (response?.content) {
          setProjects(response.content);
        }
      } catch (error) {
        toast.error('Kh�ng th? t?i danh s�ch d? �n');
        // Fallback to mock data if API fails
        setProjects(getMockProjects());
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [selectedType, isAuthenticated]);

  const getMockProjects = (): Project[] => [
    {
      id: 1,
      name: "Vinhomes Grand Park",
      description: "Khu đô thị thông minh với đầy đủ tiện ích",
      developer: "Vingroup",
      investor: "Vingroup",
      projectCode: "VGP001",
      address: "Đường Nguyễn Xiển, Phường Long Thạnh Mỹ, Quận 9, TP.HCM",
      area: 271.0,
      projectType: t('projects.newUrbanArea'),
      projectStatus: t('projects.statusOpening'),
      minPrice: 2500000000,
      maxPrice: 4200000000,
      currency: "VND",
      featuredImageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400",
      overview: "Khu đô thị thông minh với đầy đủ tiện ích",
      utilities: "Trường học, bệnh viện, công viên",
      locationAdvantages: "Gần trung tâm, giao thông thuận tiện",
      investmentAttractions: "Tiềm năng tăng giá cao",
      contactPhone: "1900 6386",
      contactEmail: "info@vinhomes.vn",
      websiteUrl: "https://vinhomes.vn",
      status: "ACTIVE",
      viewCount: 1250,
      createdAt: "2024-01-15T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
      province: { id: "1", code: "SG", name: "TP. Hồ Chí Minh", nameEn: "Ho Chi Minh City", fullName: "Thành phố Hồ Chí Minh", fullNameEn: "Ho Chi Minh City", codeName: "thanh-pho-ho-chi-minh", administrativeUnitId: "1" },
      district: { id: "1", code: "Q9", name: "Quận 9", nameEn: "District 9", fullName: "Quận 9", fullNameEn: "District 9", codeName: "quan-9", provinceId: "1", administrativeUnitId: "2" },
      ward: { id: "1", code: "LTM", name: "Phường Long Thạnh Mỹ", nameEn: "Long Thanh My Ward", fullName: "Phường Long Thạnh Mỹ", fullNameEn: "Long Thanh My Ward", codeName: "phuong-long-thanh-my", districtId: "1", administrativeUnitId: "3" },
      images: []
    },
    {
      id: 2,
      name: "Masteri Centre Point",
      description: "Căn hộ cao cấp tại trung tâm quận 9",
      developer: "Masterise Homes",
      investor: "Masterise Homes",
      projectCode: "MCP001",
      address: "Đường Nguyễn Xiển, Phường Long Thạnh Mỹ, Quận 9, TP.HCM",
      area: 2.2,
      projectType: t('postProperty.apartment'),
      projectStatus: t('projects.statusCompleted'),
      minPrice: 1800000000,
      maxPrice: 3500000000,
      currency: "VND",
      featuredImageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400",
      overview: "Căn hộ cao cấp tại trung tâm quận 9",
      utilities: "Hồ bơi, gym, siêu thị",
      locationAdvantages: "Gần metro, trung tâm thương mại",
      investmentAttractions: "Vị trí đắc địa",
      contactPhone: "1900 9090",
      contactEmail: "info@masterise.vn",
      websiteUrl: "https://masterise.vn",
      status: "ACTIVE",
      viewCount: 890,
      createdAt: "2024-01-10T00:00:00Z",
      updatedAt: "2024-01-10T00:00:00Z",
      province: { id: "1", code: "SG", name: "TP. Hồ Chí Minh", nameEn: "Ho Chi Minh City", fullName: "Thành phố Hồ Chí Minh", fullNameEn: "Ho Chi Minh City", codeName: "thanh-pho-ho-chi-minh", administrativeUnitId: "1" },
      district: { id: "1", code: "Q9", name: "Quận 9", nameEn: "District 9", fullName: "Quận 9", fullNameEn: "District 9", codeName: "quan-9", provinceId: "1", administrativeUnitId: "2" },
      ward: { id: "1", code: "LTM", name: "Phường Long Thạnh Mỹ", nameEn: "Long Thanh My Ward", fullName: "Phường Long Thạnh Mỹ", fullNameEn: "Long Thanh My Ward", codeName: "phuong-long-thanh-my", districtId: "1", administrativeUnitId: "3" },
      images: []
    },
    {
      id: 3,
      name: "Sunshine Diamond River",
      description: t('projects.luxuryRiversideComplex'),
      developer: "Sunshine Group",
      investor: "Sunshine Group",
      projectCode: "SDR001",
      address: "Đường Nguyễn Tất Thành, Quận 4, TP.HCM",
      area: 5.1,
      projectType: t('projects.complex'),
      projectStatus: t('projects.statusDeveloping'),
      minPrice: 3200000000,
      maxPrice: 6800000000,
      currency: "VND",
      featuredImageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
      overview: t('projects.luxuryRiversideComplex'),
      utilities: t('projects.riverViewClubhouseSpa'),
      locationAdvantages: "Ven sông Sài Gòn, vị trí đắc địa",
      investmentAttractions: "Tiềm năng du lịch và nghỉ dưỡng",
      contactPhone: "1900 1111",
      contactEmail: "info@sunshine.vn",
      websiteUrl: "https://sunshine.vn",
      status: "ACTIVE",
      viewCount: 650,
      createdAt: "2024-01-08T00:00:00Z",
      updatedAt: "2024-01-08T00:00:00Z",
      province: { id: "1", code: "SG", name: "TP. Hồ Chí Minh", nameEn: "Ho Chi Minh City", fullName: "Thành phố Hồ Chí Minh", fullNameEn: "Ho Chi Minh City", codeName: "thanh-pho-ho-chi-minh", administrativeUnitId: "1" },
      district: { id: "2", code: "Q4", name: "Quận 4", nameEn: "District 4", fullName: "Quận 4", fullNameEn: "District 4", codeName: "quan-4", provinceId: "1", administrativeUnitId: "2" },
      ward: { id: "2", code: "P1", name: "Phường 1", nameEn: "Ward 1", fullName: "Phường 1", fullNameEn: "Ward 1", codeName: "phuong-1", districtId: "2", administrativeUnitId: "3" },
      images: []
    }
  ];

  const getStatusColor = (status: string) => {
    if (status === t('projects.statusOpening')) return 'text-green-600 bg-green-100';
    if (status === t('projects.statusDeveloping')) return 'text-yellow-600 bg-yellow-100';
    if (status === t('projects.statusCompleted')) return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleProjectClick = (projectId: number | string) => {
    if (!isAuthenticated) {
      setPendingProjectId(projectId);
      setShowLoginModal(true);
      return;
    }

    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('projects.pageTitle')}</h1>
          <p className="text-gray-600">{t('projects.pageSubtitle')}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={t('projects.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('projects.allTypes')}</option>
                <option value={t('projects.newUrbanArea')}>{t('projects.newUrbanArea')}</option>
                <option value={t('postProperty.apartment')}>{t('projects.apartment')}</option>
                <option value={t('projects.townhouse')}>{t('projects.townhouse')}</option>
                <option value={t('projects.socialHousing')}>{t('projects.socialHousing')}</option>
                <option value={t('projects.complex')}>{t('projects.complex')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('projects.area')}</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
              >
                <option value="">{t('projects.selectArea')}</option>
                <option value="hcm">TP. Hồ Chí Minh</option>
                <option value="hn">Hà Nội</option>
                <option value="dn">Đà Nẵng</option>
                <option value="bd">Bình Dương</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('projects.status')}</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="">{t('projects.selectStatus')}</option>
                <option value="opening">{t('projects.statusOpening')}</option>
                <option value="coming">{t('projects.statusComing')}</option>
                <option value="completed">{t('projects.statusCompleted')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('projects.type')}</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
              >
                <option value="">{t('projects.selectType')}</option>
                <option value="apartment">{t('projects.apartment')}</option>
                <option value="villa">{t('projects.townhouse')}</option>
                <option value="township">{t('projects.newUrbanArea')}</option>
                <option value="complex">{t('projects.complex')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('projects.priceRange')}</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.priceRange}
                onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
              >
                <option value="">{t('projects.selectPriceRange')}</option>
                <option value="under-2">{t('projects.priceUnder2')}</option>
                <option value="2-5">{t('projects.price2to5')}</option>
                <option value="5-10">{t('projects.price5to10')}</option>
                <option value="over-10">{t('projects.priceOver10')}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">
              <p className="mt-4 text-gray-500 font-medium animate-pulse">
                {t('common.loading')}...
              </p>
            </div>
          ) : (
            <>
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">{t('projects.resultsCount', { count: filteredProjects.length })}</h2>
                  <div className="flex items-center space-x-4">
                    <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option>{t('projects.sortBy')}</option>
                      <option>{t('projects.sortNameAZ')}</option>
                      <option>{t('projects.sortPriceAsc')}</option>
                      <option>{t('projects.sortPriceDesc')}</option>
                      <option>{t('projects.sortNewest')}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredProjects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => handleProjectClick(project.id)}
                      className="group text-left"
                    >
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="flex">
                          <div className="w-1/3">
                            <img
                              src={project.featuredImageUrl || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400"}
                              alt={project.name}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="w-2/3 p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                                {project.name}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.projectStatus)}`}>
                                {project.projectStatus}
                              </span>
                            </div>

                            <p className="text-gray-600 text-sm mb-2">
                              {t('projects.developer')}: <span className="font-medium">{project.developer}</span>
                            </p>

                            <div className="flex items-center text-gray-600 text-sm mb-2">
                              <MapPin className="w-3 h-3 inline mr-1" />
                              {project.address}
                            </div>

                            <p className="text-red-600 font-bold text-lg mb-2">
                              {formatPrice(project.minPrice)} - {formatPrice(project.maxPrice)}
                            </p>

                            <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                              <span>{t('projects.scale')}: {project.area} ha</span>
                              {project.properties && (
                                <span>{project.properties.length} {t('projects.units')}</span>
                              )}
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {project.projectType}
                              </span>
                              <span className="text-xs text-gray-500">
                                {project.viewCount} {t('projects.views')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-red-100">
              <h3 className="text-lg font-semibold text-red-600">
                {t('projects.loginRequired')}
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-700 mb-2">
                {t('projects.loginRequiredMessage')}
              </p>
              <p className="text-sm text-gray-500">
                {t('projects.loginRequiredDescription')}
              </p>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                onClick={() => {
                  setShowLoginModal(false);
                  setPendingProjectId(null);
                }}
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm"
                onClick={() => {
                  if (pendingProjectId != null) {
                    navigate('/login', { state: { from: `/projects/${pendingProjectId}` } });
                  } else {
                    navigate('/login');
                  }
                  setShowLoginModal(false);
                  setPendingProjectId(null);
                }}
              >
                {t('projects.goToLogin')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
