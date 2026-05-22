import api from './index';
import type { PropertyNote } from './types';

export const propertyNoteAPI = {
  getMyNotes: async (): Promise<PropertyNote[]> => {
    const response = await api.get<PropertyNote[]>('/api/property-notes/my-notes');
    return response.data;
  },

  getNoteByProperty: async (propertyId: string): Promise<PropertyNote | null> => {
    const response = await api.get<PropertyNote | null>(`/api/property-notes/property/${propertyId}`);
    return response.data;
  },

  saveNote: async (propertyId: string, noteContent: string): Promise<PropertyNote> => {
    const response = await api.post<PropertyNote>('/api/property-notes', {
      propertyId,
      noteContent
    });
    return response.data;
  },

  deleteNote: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/api/property-notes/${id}`);
    return response.data;
  },

  deleteNoteByProperty: async (propertyId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/api/property-notes/property/${propertyId}`);
    return response.data;
  }
};
