import { useState, useEffect } from 'react';
import { 
  authAPI, 
  propertyAPI, 
  agentAPI, 
  agencyAPI, 
  newsAPI, 
  locationAPI,
  propertyDetailAPI,
  propertyInquiryAPI,
  propertyFavoriteAPI,
  propertyViewAPI,
  notificationAPI,
  miscAPI,
  userAPI
} from './index';
// Note: Types are imported through ./index but not used directly in hooks

// Custom hook for fetching data with loading state
export const useApi = <T>(apiCall: () => Promise<T>, dependencies: any[] = []) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

// Property hooks
const PROPERTIES_CACHE_PREFIX = 'properties-cache:v1:';

const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));

  return `{${entries
    .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
    .join(',')}}`;
};

const getPropertiesCacheKey = (params?: unknown): string =>
  `${PROPERTIES_CACHE_PREFIX}${stableStringify(params ?? {})}`;

export const useProperties = (params?: any) => {
  const cacheKey = getPropertiesCacheKey(params);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (forceRefresh = false) => {
    const shouldUseCache = !forceRefresh;

    if (shouldUseCache) {
      const cachedRaw = sessionStorage.getItem(cacheKey);
      if (cachedRaw) {
        try {
          const cachedData = JSON.parse(cachedRaw);
          setData(cachedData);
          setLoading(false);
          setError(null);
          return;
        } catch {
          sessionStorage.removeItem(cacheKey);
        }
      }
    }

    try {
      setLoading(true);
      setError(null);
      const result = await propertyAPI.search(params);
      setData(result);
      sessionStorage.setItem(cacheKey, JSON.stringify(result));
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);
  }, [cacheKey]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
  };
};

export const useProperty = (id: string) => {
  return useApi(() => propertyAPI.getById(id), [id]);
};

export const useFeaturedProperties = (page = 0, size = 8) => {
  return useApi(() => propertyAPI.getFeatured(page, size), [page, size]);
};

export const useMyProperties = (page = 0, size = 10) => {
  return useApi(() => propertyAPI.getMyProperties(page, size), [page, size]);
};

export const useRentProperties = (params?: any) => {
  return useApi(() => propertyAPI.getForRent(params), [JSON.stringify(params)]);
};

export const useSaleProperties = (params?: any) => {
  return useApi(() => propertyAPI.getForSale(params), [JSON.stringify(params)]);
};

export const useProjects = (params?: any) => {
  return useApi(() => propertyAPI.getProjects(params), [JSON.stringify(params)]);
};

export const useProject = (id: string) => {
  return useApi(() => propertyAPI.getProjectById(id), [id]);
};

// Agent hooks
export const useAgents = (params?: any) => {
  return useApi(() => agentAPI.getAll(params), [JSON.stringify(params)]);
};

export const useAgent = (id: string) => {
  return useApi(() => agentAPI.getById(id), [id]);
};

export const useTopAgents = (page = 0, size = 10) => {
  return useApi(() => agentAPI.getTopRated(page, size), [page, size]);
};

export const useAgentProperties = (agentId: string, page = 0, size = 10) => {
  return useApi(() => agentAPI.getProperties(agentId, page, size), [agentId, page, size]);
};

// Agency hooks
export const useAgencies = (params?: any) => {
  return useApi(() => agencyAPI.getAll(params), [JSON.stringify(params)]);
};

export const useAgency = (id: string) => {
  return useApi(() => agencyAPI.getById(id), [id]);
};

export const useAgencyAgents = (agencyId: string, page = 0, size = 10) => {
  return useApi(() => agencyAPI.getAgents(agencyId, page, size), [agencyId, page, size]);
};

// News hooks
export const useNews = (params?: any) => {
  return useApi(() => newsAPI.getAll(params), [JSON.stringify(params)]);
};

export const useNewsArticle = (id: string) => {
  return useApi(() => newsAPI.getById(id), [id]);
};

export const useFeaturedNews = (limit = 5) => {
  return useApi(() => newsAPI.getFeatured(limit), [limit]);
};

export const usePopularNews = (days = 30, page = 0, size = 10) => {
  return useApi(() => newsAPI.getPopular(days, page, size), [days, page, size]);
};

export const useRecentNews = (days = 7, page = 0, size = 10) => {
  return useApi(() => newsAPI.getRecent(days, page, size), [days, page, size]);
};

// Location hooks
export const useProvinces = () => {
  return useApi(() => locationAPI.getProvinces(), []);
};

export const useDistricts = (provinceId: string) => {
  return useApi(() => {
    if (!provinceId || provinceId.trim() === '') {
      return Promise.resolve([]);
    }
    return locationAPI.getDistricts(provinceId);
  }, [provinceId]);
};

export const useWards = (districtId: string) => {
  return useApi(() => {
    if (!districtId || districtId.trim() === '') {
      return Promise.resolve([]);
    }
    return locationAPI.getWards(districtId);
  }, [districtId]);
};

// Favorites hooks
export const useMyFavorites = (page = 0, size = 12) => {
  return useApi(() => propertyFavoriteAPI.getMyFavorites(page, size), [page, size]);
};

export const useFavoriteStatus = (propertyId: string) => {
  return useApi(() => propertyFavoriteAPI.isFavorited(propertyId), [propertyId]);
};

// User hooks
export const useCurrentUser = () => {
  return useApi(() => authAPI.getCurrentUser(), []);
};

export const useUserProfile = () => {
  return useApi(() => userAPI.getProfile(), []);
};

// Custom hook for mutations (create, update, delete)
export const useMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutate = async (variables: TVariables) => {
    try {
      setLoading(true);
      setError(null);
      const result = await mutationFn(variables);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    mutate,
    data,
    loading,
    error,
    reset: () => {
      setData(null);
      setError(null);
      setLoading(false);
    }
  };
};

// Mutation hooks
export const useCreateProperty = () => {
  return useMutation(propertyAPI.create);
};

export const useUpdateProperty = () => {
  return useMutation(({ id, data }: { id: string; data: any }) => 
    propertyAPI.update(id, data)
  );
};

export const useDeleteProperty = () => {
  return useMutation((id: string) => propertyAPI.delete(id));
};

export const useToggleFavorite = () => {
  return useMutation((propertyId: string) => 
    propertyFavoriteAPI.toggle(propertyId)
  );
};

export const useLogin = () => {
  return useMutation(authAPI.login);
};

export const useRegister = () => {
  return useMutation(authAPI.register);
};

export const useUpdateProfile = () => {
  return useMutation(userAPI.updateProfile);
};

export const useChangePassword = () => {
  return useMutation(({ id, passwords }: { id: string; passwords: { oldPassword: string; newPassword: string } }) => 
    userAPI.changePassword(id, passwords)
  );
};

// Property View hooks
export const usePropertyViews = (propertyId: string) => {
  return useApi(() => propertyViewAPI.getViewCount(propertyId), [propertyId]);
};

export const useRecordView = () => {
  return useMutation((propertyId: string) => 
    propertyViewAPI.recordView(propertyId)
  );
};

export const useTrendingProperties = (limit = 10, days = 7) => {
  return useApi(() => propertyViewAPI.getTrendingProperties(limit, days), [limit, days]);
};

export const useMostViewedProperties = (fromDate?: string, page = 0, size = 10) => {
  return useApi(() => propertyViewAPI.getMostViewedProperties(fromDate, page, size), [fromDate, page, size]);
};

// Notification hooks
export const useNotifications = (page = 0, size = 20) => {
  return useApi(() => notificationAPI.getUserNotifications(page, size), [page, size]);
};

export const useUnreadNotifications = (page = 0, size = 20) => {
  return useApi(() => notificationAPI.getUnread(page, size), [page, size]);
};

export const useUnreadCount = () => {
  return useApi(() => notificationAPI.countUnread(), []);
};

export const useMarkAsRead = () => {
  return useMutation((id: string) => notificationAPI.markAsRead(id));
};

export const useMarkAllAsRead = () => {
  return useMutation(() => notificationAPI.markAllAsRead());
};

export const useDeleteNotification = () => {
  return useMutation((id: string) => notificationAPI.delete(id));
};

// Property Detail hooks - new APIs
export const useNewPropertyDetail = (id: string) => {
  return useApi(() => propertyDetailAPI.getPropertyDetailById(id), [id]);
};

export const useNewPropertyDetailByProperty = (propertyId: string) => {
  return useApi(() => propertyDetailAPI.getPropertyDetailByPropertyId(propertyId), [propertyId]);
};

export const useCreatePropertyDetailNew = () => {
  return useMutation(propertyDetailAPI.createPropertyDetail);
};

export const useUpdatePropertyDetailNew = () => {
  return useMutation((params: { id: string, data: any }) => 
    propertyDetailAPI.updatePropertyDetail(params.id, params.data)
  );
};

export const useDeletePropertyDetailNew = () => {
  return useMutation(propertyDetailAPI.deletePropertyDetail);
};

// Property Inquiry hooks - new APIs
export const useNewPropertyInquiry = (id: string) => {
  return useApi(() => propertyInquiryAPI.getInquiryById(id), [id]);
};

export const useNewPropertyInquiries = (propertyId: string, page = 0, size = 10) => {
  return useApi(() => propertyInquiryAPI.getInquiriesByProperty(propertyId, page, size), [propertyId, page, size]);
};

export const useNewUserInquiries = (inquirerId: string, page = 0, size = 10) => {
  return useApi(() => propertyInquiryAPI.getInquiriesByUser(inquirerId, page, size), [inquirerId, page, size]);
};

export const useCreateInquiryNew = () => {
  return useMutation(propertyInquiryAPI.createInquiry);
};

export const useRespondToInquiryNew = () => {
  return useMutation((params: { id: string, agentResponse: string }) => 
    propertyInquiryAPI.respondToInquiry(params.id, params.agentResponse)
  );
};

export const useUpdateInquiryStatus = () => {
  return useMutation((params: { id: string, status: 'NEW' | 'IN_PROGRESS' | 'RESPONDED' | 'CLOSED' | 'SPAM', agentResponse?: string }) => 
    propertyInquiryAPI.updateInquiryStatus(params.id, params.status, params.agentResponse)
  );
};

export const useInquiriesByStatus = (status: 'NEW' | 'IN_PROGRESS' | 'RESPONDED' | 'CLOSED' | 'SPAM', page = 0, size = 10) => {
  return useApi(() => propertyInquiryAPI.getInquiriesByStatus(status, page, size), [status, page, size]);
};

export const useInquiriesByType = (type: 'GENERAL_INFO' | 'SCHEDULE_VIEWING' | 'PRICE_NEGOTIATION' | 'FINANCING_INFO' | 'PROPERTY_HISTORY' | 'NEIGHBORHOOD_INFO' | 'OTHER', page = 0, size = 10) => {
  return useApi(() => propertyInquiryAPI.getInquiriesByType(type, page, size), [type, page, size]);
};

export const useDeleteInquiry = () => {
  return useMutation((id: string) => propertyInquiryAPI.deleteInquiry(id));
};

// Payment hooks - using existing methods from misc.ts
export const useNewPayment = (id: string) => {
  return useApi(() => miscAPI.getById(id), [id]);
};

export const useNewUserPayments = (page = 0, size = 10) => {
  return useApi(() => miscAPI.getMyPayments(page, size), [page, size]);
};

export const useCreatePaymentNew = () => {
  return useMutation(miscAPI.create);
};

export const useProcessPaymentNew = () => {
  return useMutation((params: { id: string, success: boolean }) => 
    params.success ? miscAPI.verify(params.id, {}) : miscAPI.cancel(params.id)
  );
};
