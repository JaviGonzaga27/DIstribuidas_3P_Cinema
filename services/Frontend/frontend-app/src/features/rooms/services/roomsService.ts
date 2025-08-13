// Servicio para gestionar salas y asientos

import { ApiService } from '@/services/api';
import { Room, Seat, ApiResponse } from '@/types';

class RoomsService extends ApiService {
  private readonly endpoint = '/rooms';

  async getAll(): Promise<Room[]> {
    const response = await this.get<Room[]>(this.endpoint);
    return response.data || [];
  }

  async getById(id: number): Promise<Room | null> {
    try {
      const response = await this.get<Room>(`${this.endpoint}/${id}`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  async getRoomSeats(roomId: number): Promise<Seat[]> {
    try {
      const response = await this.get<Seat[]>(`${this.endpoint}/${roomId}/seats`);
      return response.data || [];
    } catch (error) {
      console.error('Error getting room seats:', error);
      return [];
    }
  }

  async getShowtimeSeats(showtimeId: number): Promise<Seat[]> {
    try {
      const response = await this.get<Seat[]>(`/bookings/showtime/${showtimeId}/seats`);
      return response.data || [];
    } catch (error) {
      console.error('Error getting showtime seats:', error);
      return [];
    }
  }
}

export const roomsService = new RoomsService();
export default roomsService;
