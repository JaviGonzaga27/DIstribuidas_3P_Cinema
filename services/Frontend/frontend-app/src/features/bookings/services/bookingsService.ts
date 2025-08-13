// Servicio para gestionar reservas

import { ApiService } from '@/services/api';
import { Booking, CreateBookingDto, ApiResponse } from '@/types';

class BookingsService extends ApiService {
  private readonly endpoint = '/bookings';
  
  // Almacenamiento temporal para simular reservas
  private mockBookings: Booking[] = [];
  private nextId = 1;

  async getAll(): Promise<Booking[]> {
    try {
      const response = await this.get<Booking[]>(this.endpoint);
      return response.data || [];
    } catch (error) {
      // Si falla la API, devolver las reservas simuladas
      console.warn('API no disponible, usando datos simulados');
      return this.mockBookings;
    }
  }

  async create(bookingData: CreateBookingDto): Promise<Booking> {
    try {
      const response = await this.post<Booking>(this.endpoint, bookingData);
      if (response.data) {
        return response.data;
      }
      throw new Error('No response data');
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error; // Propagar el error en lugar de crear datos simulados
    }
  }

  async getById(id: number): Promise<Booking | null> {
    try {
      const response = await this.get<Booking>(`${this.endpoint}/${id}`);
      return response.data || null;
    } catch (error) {
      // Buscar en las reservas simuladas
      return this.mockBookings.find(booking => booking.id === id) || null;
    }
  }

  async getUserBookings(userId: number): Promise<Booking[]> {
    try {
      const response = await this.get<Booking[]>(`${this.endpoint}/user/${userId}`);
      return response.data || [];
    } catch (error) {
      // Filtrar reservas simuladas por usuario
      return this.mockBookings.filter(booking => booking.userId === userId);
    }
  }
}

export const bookingsService = new BookingsService();