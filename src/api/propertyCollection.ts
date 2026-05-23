import api from './index';
import type { PropertyCollection, PropertyCollectionItem } from './types';

export const propertyCollectionAPI = {
  getMyCollections: async (): Promise<PropertyCollection[]> => {
    const response = await api.get<PropertyCollection[]>('/property-collections/my-collections');
    return response.data;
  },

  getCollectionDetails: async (id: string): Promise<PropertyCollection> => {
    const response = await api.get<PropertyCollection>(`/property-collections/${id}`);
    return response.data;
  },

  createCollection: async (name: string, description?: string, isPublic?: boolean): Promise<PropertyCollection> => {
    const response = await api.post<PropertyCollection>('/property-collections', {
      name,
      description,
      isPublic
    });
    return response.data;
  },

  updateCollection: async (id: string, name?: string, description?: string, isPublic?: boolean): Promise<PropertyCollection> => {
    const response = await api.put<PropertyCollection>(`/property-collections/${id}`, {
      name,
      description,
      isPublic
    });
    return response.data;
  },

  deleteCollection: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/property-collections/${id}`);
    return response.data;
  },

  addItemToCollection: async (collectionId: string, propertyId: string): Promise<PropertyCollectionItem> => {
    const response = await api.post<PropertyCollectionItem>(`/property-collections/${collectionId}/items`, {
      propertyId
    });
    return response.data;
  },

  removeItemFromCollection: async (collectionId: string, propertyId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/property-collections/${collectionId}/items/${propertyId}`);
    return response.data;
  },

  getPublicSharedCollection: async (shareToken: string): Promise<PropertyCollection> => {
    const response = await api.get<PropertyCollection>(`/property-collections/shared/${shareToken}`);
    return response.data;
  }
};
