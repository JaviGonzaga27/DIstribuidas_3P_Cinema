// Servicio del dashboard

import { apiService } from '@/services/api';
import { API_ENDPOINTS } from '@/constants';
import { DashboardData, DashboardStats, MovieStats, RecentActivity } from '@/features/dashboard/types';
import { moviesService } from '@/features/movies/services/moviesService';
import { showtimesService } from '@/features/showtimes/services/showtimesService';

export class DashboardService {
  async getDashboardData(): Promise<DashboardData> {
    try {
      // Intentar obtener datos del backend primero
      try {
        const statsResponse = await apiService.get<DashboardStats>(
          API_ENDPOINTS.DASHBOARD.STATS
        );
        const moviesResponse = await apiService.get<MovieStats[]>(
          API_ENDPOINTS.DASHBOARD.POPULAR_MOVIES
        );
        const activityResponse = await apiService.get<RecentActivity[]>(
          API_ENDPOINTS.DASHBOARD.RECENT_ACTIVITY
        );

        return {
          stats: statsResponse.data || {
            totalMovies: 0,
            totalBookings: 0,
            totalRevenue: 0,
            totalUsers: 0
          },
          popularMovies: moviesResponse.data || [],
          recentActivity: activityResponse.data || []
        };
      } catch {
        // Si falla el backend, calcular datos del frontend
        return await this.calculateDashboardDataFromExistingAPIs();
      }
    } catch {
      throw new Error('Error al obtener datos del dashboard');
    }
  }

  private async calculateDashboardDataFromExistingAPIs(): Promise<DashboardData> {
    try {
      // Obtener datos de las APIs existentes
      const [movies, showtimes] = await Promise.all([
        moviesService.getAll(),
        showtimesService.getAll()
      ]);

      // Calcular estadísticas
      const stats: DashboardStats = {
        totalMovies: movies.length,
        totalBookings: 0, // No tenemos endpoint de bookings aún
        totalRevenue: 0, // Se puede calcular cuando tengamos bookings
        totalUsers: 0 // No tenemos endpoint de usuarios aún
      };

      // Crear películas populares basándose en la cantidad de funciones
      const movieShowtimeCounts = showtimes.reduce((acc, showtime) => {
        acc[showtime.movieId] = (acc[showtime.movieId] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const popularMovies: MovieStats[] = movies
        .map(movie => ({
          id: movie.id.toString(),
          title: movie.title,
          totalBookings: movieShowtimeCounts[movie.id] || 0,
          revenue: 0 // Se calculará cuando tengamos bookings
        }))
        .sort((a, b) => b.totalBookings - a.totalBookings)
        .slice(0, 5);

      // Crear actividad reciente basándose en las funciones
      const recentActivity: RecentActivity[] = showtimes
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, 10)
        .map(showtime => {
          const movie = movies.find(m => m.id === showtime.movieId);
          return {
            id: showtime.id.toString(),
            type: 'booking' as const,
            description: `Nueva función programada: ${movie?.title || 'Película'} - ${new Date(showtime.startTime).toLocaleString('es-ES')}`,
            createdAt: showtime.startTime,
            userId: '1',
            userName: 'Sistema'
          };
        });

      return {
        stats,
        popularMovies,
        recentActivity
      };
    } catch (error) {
      console.error('Error calculating dashboard data:', error);
      // Retornar datos vacíos en caso de error
      return {
        stats: {
          totalMovies: 0,
          totalBookings: 0,
          totalRevenue: 0,
          totalUsers: 0
        },
        popularMovies: [],
        recentActivity: []
      };
    }
  }

  async getStats(): Promise<DashboardStats> {
    try {
      const response = await apiService.get<DashboardStats>(
        API_ENDPOINTS.DASHBOARD.STATS
      );

      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // Fallback: calcular desde APIs existentes
      const data = await this.calculateDashboardDataFromExistingAPIs();
      return data.stats;
    }

    throw new Error('Error al obtener estadísticas');
  }

  async getPopularMovies(): Promise<MovieStats[]> {
    try {
      const response = await apiService.get<MovieStats[]>(
        API_ENDPOINTS.DASHBOARD.POPULAR_MOVIES
      );

      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // Fallback: calcular desde APIs existentes
      const data = await this.calculateDashboardDataFromExistingAPIs();
      return data.popularMovies;
    }

    throw new Error('Error al obtener películas populares');
  }

  async getRecentActivity(): Promise<RecentActivity[]> {
    try {
      const response = await apiService.get<RecentActivity[]>(
        API_ENDPOINTS.DASHBOARD.RECENT_ACTIVITY
      );

      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // Fallback: calcular desde APIs existentes
      const data = await this.calculateDashboardDataFromExistingAPIs();
      return data.recentActivity;
    }

    throw new Error('Error al obtener actividad reciente');
  }
}

export const dashboardService = new DashboardService();
