import { create } from 'zustand';
import type { Property, PropertySearchForm, PaginatedResponse } from '../types';
import { propertyAPI } from '../api/services';

interface PropertyState {
  properties: Property[];
  featuredProperties: Property[];
  selectedProperty: Property | null;
  searchParams: PropertySearchForm;
  pagination: {
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
  };
  isLoading: boolean;
  error: string | null;
  searchProperties: (params: PropertySearchForm) => Promise<void>;
  getProperties: (page?: number, size?: number) => Promise<void>;
  getFeaturedProperties: () => Promise<void>;
  getPropertyById: (id: number) => Promise<void>;
  setSelectedProperty: (property: Property | null) => void;
  updateSearchParams: (params: Partial<PropertySearchForm>) => void;
  clearError: () => void;
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  featuredProperties: [],
  selectedProperty: null,
  searchParams: {},
  pagination: {
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    first: true,
    last: true,
  },
  isLoading: false,
  error: null,

  searchProperties: async (params: PropertySearchForm) => {
    set({ isLoading: true, error: null });
    try {
      const response: PaginatedResponse<Property> = await propertyAPI.getAll({
        ...params,
        provinceId: params.provinceId !== undefined ? String(params.provinceId) : undefined,
        districtId: params.districtId !== undefined ? String(params.districtId) : undefined,
        wardId: params.wardId !== undefined ? String(params.wardId) : undefined,
      });
      set({
        properties: response.content,
        pagination: {
          totalElements: response.totalElements,
          totalPages: response.totalPages,
          size: response.size,
          number: response.number,
          first: response.first,
          last: response.last,
        },
        searchParams: params,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Lỗi tìm kiếm bất động sản',
        isLoading: false,
      });
    }
  },

  getProperties: async (page = 0, size = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response: PaginatedResponse<Property> = await propertyAPI.getAll({
        page,
        size,
      });
      set({
        properties: response.content,
        pagination: {
          totalElements: response.totalElements,
          totalPages: response.totalPages,
          size: response.size,
          number: response.number,
          first: response.first,
          last: response.last,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Lỗi tải danh sách bất động sản',
        isLoading: false,
      });
    }
  },

  getFeaturedProperties: async () => {
    try {
      const response = await propertyAPI.getFeatured();
      set({ featuredProperties: response });
    } catch (error: any) {
      console.error('Lỗi tải bất động sản nổi bật:', error);
    }
  },

  getPropertyById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await propertyAPI.getById(id);
      set({
        selectedProperty: response,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Lỗi tải thông tin bất động sản',
        isLoading: false,
      });
    }
  },

  setSelectedProperty: (property) => {
    set({ selectedProperty: property });
  },

  updateSearchParams: (params) => {
    const currentParams = get().searchParams;
    set({ searchParams: { ...currentParams, ...params } });
  },

  clearError: () => set({ error: null }),
}));