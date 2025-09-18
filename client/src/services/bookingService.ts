import api from './api';
import { Booking } from '../types';

export const bookingService = {
  async createBooking(eventId: number, quantity: number): Promise<any> {
    const response = await api.post('/bookings', { eventId, quantity });
    return response.data;
  },

  async getMyBookings(): Promise<Booking[]> {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },

  async getBooking(id: number): Promise<Booking> {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  }
};