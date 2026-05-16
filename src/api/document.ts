import api from './index';
import type { PropertyDocument } from './types';

export interface UploadPropertyDocumentPayload {
  documentType?: 'LAND_TITLE' | 'BUILDING_PERMIT' | 'CONTRACT' | 'FLOOR_PLAN' | 'OTHER';
  description?: string;
}

export const documentAPI = {
  upload: async (
    propertyId: string,
    file: File,
    payload: UploadPropertyDocumentPayload = {}
  ): Promise<PropertyDocument> => {
    const formData = new FormData();
    formData.append('file', file);
    if (payload.documentType) {
      formData.append('documentType', payload.documentType);
    }
    if (payload.description) {
      formData.append('description', payload.description);
    }

    const response = await api.post(`/properties/${propertyId}/documents`, formData);
    return response.data;
  },

  getByProperty: async (propertyId: string): Promise<PropertyDocument[]> => {
    const response = await api.get(`/properties/${propertyId}/documents`);
    return response.data;
  },

  delete: async (propertyId: string, documentId: string): Promise<void> => {
    await api.delete(`/properties/${propertyId}/documents/${documentId}`);
  },

  verify: async (
    propertyId: string,
    documentId: string,
    verified = true
  ): Promise<PropertyDocument> => {
    const response = await api.put(
      `/properties/${propertyId}/documents/${documentId}/verify`,
      null,
      { params: { verified } }
    );
    return response.data;
  },
};

