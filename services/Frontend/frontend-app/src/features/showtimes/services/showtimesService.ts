// Servicio para gestionar funciones (showtimes)

import { ApiService } from '@/services/api';
import { Showtime, ShowtimeDto, ApiResponse } from '@/types';

class ShowtimesService extends ApiService {
  private readonly endpoint = '/showtimes';

  async getAll(): Promise<Showtime[]> {
    const response = await this.get<Showtime[]>(this.endpoint);
    return response.data || [];
  }

  async getById(id: number): Promise<Showtime | null> {
    try {
      const response = await this.get<Showtime>(`${this.endpoint}/${id}`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  async getByMovieId(movieId: number): Promise<Showtime[]> {
    try {
      const response = await this.get<Showtime[]>(`${this.endpoint}/movie/${movieId}`);
      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  async create(showtimeData: ShowtimeDto): Promise<Showtime> {
    const response = await this.post<Showtime>(this.endpoint, showtimeData);
    return response.data!;
  }

  async update(id: number, showtimeData: ShowtimeDto): Promise<void> {
    await this.put(`${this.endpoint}/${id}`, showtimeData);
  }

  async deleteShowtime(id: number): Promise<boolean> {
    try {
      await this.delete(`${this.endpoint}/${id}`);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const showtimesService = new ShowtimesService();
