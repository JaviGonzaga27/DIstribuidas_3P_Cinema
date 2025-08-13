// Servicio para gestionar películas

import { ApiService } from '@/services/api';
import { Movie, CreateMovieDto, ApiResponse } from '@/types';

class MoviesService extends ApiService {
  private readonly endpoint = '/movies';

  async getAll(): Promise<Movie[]> {
    const response = await this.get<Movie[]>(this.endpoint);
    return response.data || [];
  }

  async getById(id: number): Promise<Movie | null> {
    try {
      const response = await this.get<Movie>(`${this.endpoint}/${id}`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  async create(movieData: CreateMovieDto): Promise<Movie> {
    console.log('Enviando datos de película:', movieData);
    const response = await this.post<Movie>(this.endpoint, movieData);
    console.log('Respuesta del servidor:', response);
    if (!response.data) {
      throw new Error('Error al crear la película');
    }
    return response.data;
  }

  async update(id: number, movieData: CreateMovieDto): Promise<Movie> {
    const response = await this.put<Movie>(`${this.endpoint}/${id}`, movieData);
    if (!response.data) {
      throw new Error('Error al actualizar la película');
    }
    return response.data;
  }

  async deleteMovie(id: number): Promise<boolean> {
    try {
      await this.delete(`${this.endpoint}/${id}`);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const moviesService = new MoviesService();
