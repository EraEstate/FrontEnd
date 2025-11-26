import api from './index';
import type { PropertyDetail } from './types';

export const propertyDetailAPI = {
  // Lấy chi tiết bất động sản theo ID
  getPropertyDetailById: async (id: string) => {
    const response = await api.get<PropertyDetail>(`/property-details/${id}`);
    return response.data;
  },

  // Lấy chi tiết theo property ID
  getPropertyDetailByPropertyId: async (propertyId: string) => {
    const response = await api.get<PropertyDetail>(`/property-details/property/${propertyId}`);
    return response.data;
  },

  // Tạo chi tiết bất động sản mới
  createPropertyDetail: async (data: {
    propertyId: string;
    buildingName?: string;
    floorNumber?: number;
    totalFloors?: number;
    apartmentNumber?: string;
    yearBuilt?: number;
    facingDirection?: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'NORTHEAST' | 'NORTHWEST' | 'SOUTHEAST' | 'SOUTHWEST';
    hasElevator?: boolean;
    hasParking?: boolean;
    hasGarden?: boolean;
    hasSwimmingPool?: boolean;
    hasSecurity?: boolean;
    furnishedStatus?: 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED';
  }) => {
    const response = await api.post<PropertyDetail>('/property-details', null, { params: data });
    return response.data;
  },

  // Cập nhật chi tiết bất động sản
  updatePropertyDetail: async (id: string, data: {
    buildingName?: string;
    floorNumber?: number;
    totalFloors?: number;
    apartmentNumber?: string;
    yearBuilt?: number;
    facingDirection?: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'NORTHEAST' | 'NORTHWEST' | 'SOUTHEAST' | 'SOUTHWEST';
    hasElevator?: boolean;
    hasParking?: boolean;
    hasGarden?: boolean;
    hasSwimmingPool?: boolean;
    hasSecurity?: boolean;
    furnishedStatus?: 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED';
    additionalNotes?: string;
  }) => {
    const response = await api.put<PropertyDetail>(`/property-details/${id}`, null, { params: data });
    return response.data;
  },

  // Xóa chi tiết bất động sản
  deletePropertyDetail: async (id: string) => {
    const response = await api.delete(`/property-details/${id}`);
    return response.data;
  },

  // Tìm kiếm theo tầng
  getPropertiesByFloorRange: async (minFloor: number, maxFloor: number) => {
    const response = await api.get<PropertyDetail[]>('/property-details/floor-range', {
      params: { minFloor, maxFloor }
    });
    return response.data;
  },

  // Lấy BĐS có thang máy
  getPropertiesWithElevator: async () => {
    const response = await api.get<PropertyDetail[]>('/property-details/with-elevator');
    return response.data;
  },

  // Lấy BĐS có chỗ đậu xe
  getPropertiesWithParking: async () => {
    const response = await api.get<PropertyDetail[]>('/property-details/with-parking');
    return response.data;
  },

  // Lấy BĐS có sân vườn
  getPropertiesWithGarden: async () => {
    const response = await api.get<PropertyDetail[]>('/property-details/with-garden');
    return response.data;
  },

  // Lấy BĐS có hồ bơi
  getPropertiesWithPool: async () => {
    const response = await api.get<PropertyDetail[]>('/property-details/with-pool');
    return response.data;
  },

  // Lấy BĐS theo tình trạng nội thất
  getPropertiesByFurnishedStatus: async (status: 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED') => {
    const response = await api.get<PropertyDetail[]>(`/property-details/furnished/${status}`);
    return response.data;
  },

  // Đếm tổng số chi tiết BĐS
  countPropertyDetails: async () => {
    const response = await api.get<number>('/property-details/count');
    return response.data;
  }
};