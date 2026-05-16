import api from './index';
import type { CalendarEvent } from './types';

export interface CalendarEventPayload {
  title: string;
  description?: string;
  eventType?: 'VIEWING' | 'MEETING' | 'INSPECTION';
  propertyId?: string;
  startTime: string;
  endTime: string;
  status?: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  location?: string;
  attendees?: string;
  reminders?: string;
}

export const calendarAPI = {
  getEvents: async (params?: { from?: string; to?: string }): Promise<CalendarEvent[]> => {
    const response = await api.get('/calendar/events', { params });
    return response.data;
  },

  createEvent: async (payload: CalendarEventPayload): Promise<CalendarEvent> => {
    const response = await api.post('/calendar/events', payload);
    return response.data;
  },

  updateEvent: async (eventId: string, payload: Partial<CalendarEventPayload>): Promise<CalendarEvent> => {
    const response = await api.put(`/calendar/events/${eventId}`, payload);
    return response.data;
  },

  deleteEvent: async (eventId: string): Promise<void> => {
    await api.delete(`/calendar/events/${eventId}`);
  },
};

