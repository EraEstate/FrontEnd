import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { companyAPI } from '../api/services';
import type { Company } from '../api/types';
import { useTranslation } from 'react-i18next';

const CompaniesPage: React.FC = () => {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    type: ''
  });

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        let response;

        if (selectedType) {
          response = await companyAPI.getByType(selectedType);
        } else {
          response = await companyAPI.getAll({ page: 0, size: 50 });
        }

        if (response.content) {
          setCompanies(response.content);
        }
      } catch (error) {
        console.error('Error loading companies:', error);
        // Fallback to mock data if API fails
        setCompanies(getMockCompanies());
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, [selectedType]);

  const getMockCompanies = (): Company[] => [
    {
      id: 1,
      name: "Vingroup",
      shortName: "Vingroup",
      taxCode: "0101243156",
      address: "Số 7 Đường Bằng Lăng 1, Phường Việt Hưng, Quận Long Biên, Hà Nội",
      phone: "1900 6386",
      email: "info@vingroup.net",
      websiteUrl: "https://vingroup.net",
      representative: "Phạm Nhật Vượng",
      companyType: "DEVELOPER",
      about: "Tập đoàn bất động sản hàng đầu Việt Nam",
      status: "ACTIVE",
      projectCount: 50,
      propertyCount: 10000,
      province: { id: "1", code: "HN", name: "Hà Nội", nameEn: "Hanoi", fullName: "Thành phố Hà Nội", fullNameEn: "Hanoi", codeName: "ha-noi", administrativeUnitId: "1" },
      district: { id: "1", code: "LB", name: "Quận Long Biên", nameEn: "Long Bien District", fullName: "Quận Long Biên", fullNameEn: "Long Bien District", codeName: "quan-long-bien", provinceId: "1", administrativeUnitId: "2" },
      createdAt: "2024-01-15T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z"
    },
    {
      id: 2,
      name: "Masterise Homes",
      shortName: "Masterise",
      taxCode: "0303123456",
      address: "Tầng 8, Tòa nhà Master Building, 41-43 Trần Cao Vân, Phường Đa Kao, Quận 1, TP.HCM",
      phone: "1900 9090",
      email: "info@masterise.vn",
      websiteUrl: "https://masterise.vn",
      representative: "Nguyễn Văn Đạt",
      companyType: "DEVELOPER",
      about: "Công ty phát triển bất động sản chuyên nghiệp",
      status: "ACTIVE",
      projectCount: 25,
      propertyCount: 5000,
      province: { id: "1", code: "SG", name: "TP. Hồ Chí Minh", nameEn: "Ho Chi Minh City", fullName: "Thành phố Hồ Chí Minh", fullNameEn: "Ho Chi Minh City", codeName: "thanh-pho-ho-chi-minh", administrativeUnitId: "1" },
      district: { id: "2", code: "Q1", name: "Quận 1", nameEn: "District 1", fullName: "Quận 1", fullNameEn: "District 1", codeName: "quan-1", provinceId: "1", administrativeUnitId: "2" },
      createdAt: "2024-01-10T00:00:00Z",
      updatedAt: "2024-01-10T00:00:00Z"
    },
    {
      id: 3,
      name: "Sunshine Group",
      shortName: "Sunshine",
      taxCode: "0404123456",
      address: "Tầng 7, Tòa nhà Sunshine Center, 137 Nguyễn Thị Thập, Phường Bình Thuận, Quận 7, TP.HCM",
      phone: "1900 1111",
      email: "info@sunshine.vn",
      websiteUrl: "https://sunshine.vn",
      representative: "Nguyễn Văn Minh",
      companyType: "INVESTOR",
      about: "Tập đoàn đầu tư và phát triển bất động sản",
      status: "ACTIVE",
      projectCount: 30,
      propertyCount: 8000,
      province: { id: "1", code: "SG", name: "TP. Hồ Chí Minh", nameEn: "Ho Chi Minh City", fullName: "Thành phố Hồ Chí Minh", fullNameEn: "Ho Chi Minh City", codeName: "thanh-pho-ho-chi-minh", administrativeUnitId: "1" },
      district: { id: "3", code: "Q7", name: "Quận 7", nameEn: "District 7", fullName: "Quận 7", fullNameEn: "District 7", codeName: "quan-7", provinceId: "1", administrativeUnitId: "2" },
      createdAt: "2024-01-08T00:00:00Z",
      updatedAt: "2024-01-08T00:00:00Z"
    }
  ];

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

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (company.about && company.about.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         company.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Công ty bất động sản</h1>
          <p className="text-gray-600">Khám phá các công ty phát triển và đầu tư bất động sản uy tín</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm công ty..."
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
                <option value="">Tất cả loại</option>
                <option value="DEVELOPER">Chủ đầu tư</option>
                <option value="AGENCY">Môi giới</option>
                <option value="INVESTOR">Đầu tư</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Khu vực</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
              >
                <option value="">Chọn khu vực</option>
                <option value="hcm">TP. Hồ Chí Minh</option>
                <option value="hn">Hà Nội</option>
                <option value="dn">Đà Nẵng</option>
                <option value="bd">Bình Dương</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại hình</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
              >
                <option value="">Chọn loại hình</option>
                <option value="developer">Chủ đầu tư</option>
                <option value="agency">Môi giới</option>
                <option value="investor">Đầu tư</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Có {filteredCompanies.length} công ty bất động sản</h2>
              <div className="flex items-center space-x-4">
                <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option>Sắp xếp theo</option>
                  <option>Tên A-Z</option>
                  <option>Số dự án</option>
                  <option>Số bất động sản</option>
                  <option>Mới nhất</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                    <div className="p-6">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredCompanies.map((company) => (
                  <Link
                    key={company.id}
                    to={`/companies/${company.id}`}
                    className="group"
                  >
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                              {company.name}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(company.companyType)}`}>
                              {getTypeLabel(company.companyType)}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Mã số thuế</div>
                            <div className="font-medium">{company.taxCode}</div>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {company.about}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">{company.projectCount}</div>
                            <div className="text-xs text-gray-600">Dự án</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">{company.propertyCount}</div>
                            <div className="text-xs text-gray-600">Bất động sản</div>
                          </div>
                        </div>

                        <div className="flex items-center text-gray-600 text-sm mb-4">
                          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className="line-clamp-1">{company.address}</span>
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <span>📞 {company.phone}</span>
                          <span>📧 {company.email}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompaniesPage;