import api from './index';
import type { PropertyNote } from './types';

export const propertyNoteAPI = {
  getMyNotes: async (): Promise<PropertyNote[]> => {
    const response = await api.get<PropertyNote[]>('/property-notes/my-notes');
    return response.data;
  },

  getNoteByProperty: async (propertyId: string | number): Promise<PropertyNote | null> => {
    const normalizedId = String(propertyId ?? '').trim();
    if (!normalizedId || normalizedId.toLowerCase() === 'nan') {
      return null;
    }

    const response = await api.get<PropertyNote | null>(`/property-notes/property/${normalizedId}`);
    return response.data;
  },

  saveNote: async (propertyId: string | number, noteContent: string): Promise<PropertyNote> => {
    const normalizedId = String(propertyId ?? '').trim();
    if (!normalizedId || normalizedId.toLowerCase() === 'nan') {
      throw new Error('propertyId không hợp lệ');
    }

    const response = await api.post<PropertyNote>('/property-notes', {
      propertyId: normalizedId,
      noteContent
    });
    return response.data;
  },

  deleteNote: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/property-notes/${id}`);
    return response.data;
  },

  deleteNoteByProperty: async (propertyId: string | number): Promise<{ success: boolean; message: string }> => {
    const normalizedId = String(propertyId ?? '').trim();
    if (!normalizedId || normalizedId.toLowerCase() === 'nan') {
      throw new Error('propertyId không hợp lệ');
    }

    const response = await api.delete<{ success: boolean; message: string }>(`/property-notes/property/${normalizedId}`);
    return response.data;
  }
};
