import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface SelectedPropertyFilters {
  verified: boolean;
  propertyType: string;
  priceRange: string;
  bedrooms: string;
  bathrooms: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
}

type PropertySearchParamsState = Record<string, string | number | undefined>;

const DEFAULT_FILTERS: SelectedPropertyFilters = {
  verified: false,
  propertyType: '',
  priceRange: '',
  bedrooms: '',
  bathrooms: '',
  minPrice: '',
  maxPrice: '',
  minArea: '',
  maxArea: '',
};

export const usePropertySearch = (searchPlaceholder: string) => {
  const [urlSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchPlaceholder);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<SelectedPropertyFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchParams, setSearchParams] = useState<PropertySearchParamsState>({});

  useEffect(() => {
    const params: PropertySearchParamsState = {};

    const query = urlSearchParams.get('query');
    const provinceId = urlSearchParams.get('provinceId');
    const districtId = urlSearchParams.get('districtId');
    const wardId = urlSearchParams.get('wardId');
    const propertyType = urlSearchParams.get('propertyType');
    const listingType = urlSearchParams.get('listingType');
    const minPrice = urlSearchParams.get('minPrice');
    const maxPrice = urlSearchParams.get('maxPrice');
    const minArea = urlSearchParams.get('minArea');
    const maxArea = urlSearchParams.get('maxArea');

    if (query) params.query = query;
    if (provinceId) params.provinceId = provinceId;
    if (districtId) params.districtId = districtId;
    if (wardId) params.wardId = wardId;
    if (propertyType) params.propertyType = propertyType;
    if (listingType) params.listingType = listingType;
    if (minPrice) params.minPrice = parseFloat(minPrice);
    if (maxPrice) params.maxPrice = parseFloat(maxPrice);
    if (minArea) params.minArea = parseFloat(minArea);
    if (maxArea) params.maxArea = parseFloat(maxArea);

    if (Object.keys(params).length > 0) {
      setSearchParams(params);
      if (query) {
        setSearchTerm(query);
      }
    }
  }, [urlSearchParams]);

  const handleSearch = useCallback(() => {
    const nextParams: PropertySearchParamsState = {
      query: searchTerm !== searchPlaceholder ? searchTerm : '',
    };

    if (selectedFilters.propertyType) {
      nextParams.propertyType = selectedFilters.propertyType;
    }

    if (selectedFilters.minPrice) {
      nextParams.minPrice = parseFloat(selectedFilters.minPrice);
    }
    if (selectedFilters.maxPrice) {
      nextParams.maxPrice = parseFloat(selectedFilters.maxPrice);
    }

    if (selectedFilters.minArea) {
      nextParams.minArea = parseFloat(selectedFilters.minArea);
    }
    if (selectedFilters.maxArea) {
      nextParams.maxArea = parseFloat(selectedFilters.maxArea);
    }

    if (selectedFilters.bedrooms) {
      nextParams.bedrooms = parseInt(selectedFilters.bedrooms, 10);
    }
    if (selectedFilters.bathrooms) {
      nextParams.bathrooms = parseInt(selectedFilters.bathrooms, 10);
    }

    setSearchParams(nextParams);
    setCurrentPage(0);
    setShowFilters(false);
  }, [searchPlaceholder, searchTerm, selectedFilters]);

  const resetFilters = useCallback(() => {
    setSelectedFilters(DEFAULT_FILTERS);
    setSearchParams({});
    setCurrentPage(0);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    showFilters,
    setShowFilters,
    selectedFilters,
    setSelectedFilters,
    currentPage,
    setCurrentPage,
    searchParams,
    setSearchParams,
    handleSearch,
    resetFilters,
  };
};
