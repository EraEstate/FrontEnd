import api from './index';

// Location API - Dựa trên ProvinceController, DistrictController, WardController, LocationController
export const locationAPI = {
  // === Province APIs ===
  // Lấy tất cả tỉnh/thành phố
  getProvinces: async () => {
    const response = await api.get('/provinces');
    return response.data;
  },

  // Lấy tỉnh theo ID
  getProvinceById: async (id: string) => {
    const response = await api.get(`/provinces/${id}`);
    return response.data;
  },

  // Lấy tỉnh theo mã
  getProvinceByCode: async (code: string) => {
    const response = await api.get(`/provinces/code/${code}`);
    return response.data;
  },

  // Lấy tỉnh theo tên
  getProvinceByName: async (name: string) => {
    const response = await api.get(`/provinces/name/${name}`);
    return response.data;
  },

  // Tạo tỉnh mới (Admin only)
  createProvince: async (provinceData: {
    code: string;
    name: string;
    nameEn?: string;
    fullName?: string;
    fullNameEn?: string;
    codeName?: string;
    administrativeLevel: string;
  }) => {
    const response = await api.post('/provinces', null, { params: provinceData });
    return response.data;
  },

  // Cập nhật tỉnh (Admin only)
  updateProvince: async (id: string, provinceData: any) => {
    const response = await api.put(`/provinces/${id}`, null, { params: provinceData });
    return response.data;
  },

  // Xóa tỉnh (Admin only)
  deleteProvince: async (id: string) => {
    const response = await api.delete(`/provinces/${id}`);
    return response.data;
  },

  // Kiểm tra tỉnh tồn tại theo mã
  provinceExistsByCode: async (code: string) => {
    const response = await api.get(`/provinces/exists/${code}`);
    return response.data;
  },

  // Kiểm tra tỉnh tồn tại theo tên
  provinceExistsByName: async (name: string) => {
    const response = await api.get(`/provinces/exists/name/${name}`);
    return response.data;
  },

  // Đếm tổng số tỉnh
  countProvinces: async () => {
    const response = await api.get('/provinces/count');
    return response.data;
  },

  // === District APIs ===
  // Lấy quận/huyện theo ID
  getDistrictById: async (id: string) => {
    const response = await api.get(`/districts/${id}`);
    return response.data;
  },

  // Lấy quận/huyện theo tỉnh
  getDistricts: async (provinceId: string) => {
    const response = await api.get(`/districts/province/${provinceId}`);
    return response.data;
  },

  // Tìm kiếm quận theo tên
  searchDistricts: async (keyword: string) => {
    const response = await api.get('/districts/search', {
      params: { keyword }
    });
    return response.data;
  },

  // Tìm kiếm quận theo tỉnh và tên
  searchDistrictsByProvince: async (provinceId: string, keyword: string) => {
    const response = await api.get(`/districts/province/${provinceId}/search`, {
      params: { keyword }
    });
    return response.data;
  },

  // Lấy quận theo mã và tỉnh
  getDistrictByCode: async (code: string, provinceId: string) => {
    const response = await api.get(`/districts/code/${code}/province/${provinceId}`);
    return response.data;
  },

  // Tạo quận mới (Admin only)
  createDistrict: async (districtData: {
    code: string;
    name: string;
    nameEn?: string;
    fullName?: string;
    provinceId: string;
    administrativeLevel: string;
  }) => {
    const response = await api.post('/districts', null, { params: districtData });
    return response.data;
  },

  // Cập nhật quận (Admin only)
  updateDistrict: async (id: string, districtData: any) => {
    const response = await api.put(`/districts/${id}`, null, { params: districtData });
    return response.data;
  },

  // Xóa quận (Admin only)
  deleteDistrict: async (id: string) => {
    const response = await api.delete(`/districts/${id}`);
    return response.data;
  },

  // Đếm số quận theo tỉnh
  countDistrictsByProvince: async (provinceId: string) => {
    const response = await api.get(`/districts/province/${provinceId}/count`);
    return response.data;
  },

  // Kiểm tra quận tồn tại theo mã
  districtExistsByCode: async (code: string) => {
    const response = await api.get(`/districts/exists/${code}`);
    return response.data;
  },

  // === Ward APIs ===
  // Lấy phường/xã theo ID
  getWardById: async (id: string) => {
    const response = await api.get(`/wards/${id}`);
    return response.data;
  },

  // Lấy phường/xã theo quận
  getWards: async (districtId: string) => {
    const response = await api.get(`/wards/district/${districtId}`);
    return response.data;
  },

  // Lấy phường theo mã và quận
  getWardByCode: async (code: string, districtId: string) => {
    const response = await api.get(`/wards/code/${code}/district/${districtId}`);
    return response.data;
  },

  // Tìm kiếm phường theo tên
  searchWards: async (keyword: string) => {
    const response = await api.get('/wards/search', {
      params: { keyword }
    });
    return response.data;
  },

  // Tìm kiếm phường theo quận và tên
  searchWardsByDistrict: async (districtId: string, keyword: string) => {
    const response = await api.get(`/wards/district/${districtId}/search`, {
      params: { keyword }
    });
    return response.data;
  },

  // Tạo phường mới (Admin only)
  createWard: async (wardData: {
    code: string;
    name: string;
    nameEn?: string;
    fullName?: string;
    districtId: string;
    administrativeLevel: string;
  }) => {
    const response = await api.post('/wards', null, { params: wardData });
    return response.data;
  },

  // Cập nhật phường (Admin only)
  updateWard: async (id: string, wardData: any) => {
    const response = await api.put(`/wards/${id}`, null, { params: wardData });
    return response.data;
  },

  // Xóa phường (Admin only)
  deleteWard: async (id: string) => {
    const response = await api.delete(`/wards/${id}`);
    return response.data;
  },

  // Kiểm tra phường tồn tại theo mã
  wardExistsByCode: async (code: string) => {
    const response = await api.get(`/wards/exists/${code}`);
    return response.data;
  },

  // Đếm số phường theo quận
  countWardsByDistrict: async (districtId: string) => {
    const response = await api.get(`/wards/district/${districtId}/count`);
    return response.data;
  },

  // ========== ENDPOINTS MỚI BỔ SUNG - WITH RELATIONS ==========

  // Lấy ward kèm district
  getWardWithDistrict: async (wardId: string) => {
    const response = await api.get(`/wards/${wardId}/with-district`);
    return response.data;
  },

  // Lấy ward kèm agencies
  getWardWithAgencies: async (wardId: string) => {
    const response = await api.get(`/wards/${wardId}/with-agencies`);
    return response.data;
  },

  // Lấy district kèm wards
  getDistrictWithWards: async (districtId: string) => {
    const response = await api.get(`/districts/${districtId}/with-wards`);
    return response.data;
  },

  // Lấy district kèm agencies
  getDistrictWithAgencies: async (districtId: string) => {
    const response = await api.get(`/districts/${districtId}/with-agencies`);
    return response.data;
  },

  // Lấy district kèm province
  getDistrictWithProvince: async (districtId: string) => {
    const response = await api.get(`/districts/${districtId}/with-province`);
    return response.data;
  },

  // Lấy province kèm districts
  getProvinceWithDistricts: async (provinceId: string) => {
    const response = await api.get(`/provinces/${provinceId}/with-districts`);
    return response.data;
  },

  // Lấy province kèm agencies
  getProvinceWithAgencies: async (provinceId: string) => {
    const response = await api.get(`/provinces/${provinceId}/with-agencies`);
    return response.data;
  },

  // === Location APIs (Combined Location Entity) ===
  // Lấy tất cả locations
  getLocations: async () => {
    const response = await api.get('/locations');
    return response.data;
  },

  // Lấy location theo ID
  getLocationById: async (id: string) => {
    const response = await api.get(`/locations/${id}`);
    return response.data;
  },

  // Tạo location mới
  createLocation: async (locationData: {
    address: string;
    wardId: string;
    districtId: string;
    provinceId: string;
    latitude?: number;
    longitude?: number;
  }) => {
    const response = await api.post('/locations', locationData);
    return response.data;
  },

  // Cập nhật location
  updateLocation: async (id: string, locationData: any) => {
    const response = await api.put(`/locations/${id}`, locationData);
    return response.data;
  },

  // Xóa location
  deleteLocation: async (id: string) => {
    const response = await api.delete(`/locations/${id}`);
    return response.data;
  },

  // Lấy locations theo province
  getLocationsByProvince: async (provinceId: string) => {
    const response = await api.get(`/locations/province/${provinceId}`);
    return response.data;
  },

  // Lấy locations theo district
  getLocationsByDistrict: async (districtId: string) => {
    const response = await api.get(`/locations/district/${districtId}`);
    return response.data;
  },

  // Lấy locations theo ward
  getLocationsByWard: async (wardId: string) => {
    const response = await api.get(`/locations/ward/${wardId}`);
    return response.data;
  },

  // Lấy locations theo province và district
  getLocationsByProvinceAndDistrict: async (provinceId: string, districtId: string) => {
    const response = await api.get(`/locations/province/${provinceId}/district/${districtId}`);
    return response.data;
  },

  // Lấy locations trong khu vực (bounding box)
  getLocationsInArea: async (minLat: number, maxLat: number, minLng: number, maxLng: number) => {
    const response = await api.get('/locations/area', {
      params: { minLat, maxLat, minLng, maxLng }
    });
    return response.data;
  },

  // Auto-complete địa chỉ
  autocomplete: async (query: string, type?: 'province' | 'district' | 'ward'): Promise<any> => {
    // This would need to be implemented as a combined search across all location types
    // For now, we'll search based on type
    if (type === 'district') {
      return await locationAPI.searchDistricts(query);
    } else if (type === 'ward') {
      return await locationAPI.searchWards(query);
    } else {
      // Search all types - would need a dedicated endpoint
      const districts = await locationAPI.searchDistricts(query);
      const wards = await locationAPI.searchWards(query);
      
      return {
        districts,
        wards
      };
    }
  },
};