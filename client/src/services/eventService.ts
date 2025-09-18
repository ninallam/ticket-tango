import api from './api';
import { Event, EventsResponse } from '../types';

export const eventService = {
  async getEvents(params?: {
    search?: string;
    type?: 'concert' | 'workshop';
    limit?: number;
    offset?: number;
  }): Promise<EventsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.search) searchParams.append('search', params.search);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const response = await api.get(`/events?${searchParams.toString()}`);
    return response.data;
  },

  async getEvent(id: number): Promise<Event> {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  async getFeaturedEvents(): Promise<Event[]> {
    const response = await api.get('/events/featured/upcoming');
    return response.data;
  }
};