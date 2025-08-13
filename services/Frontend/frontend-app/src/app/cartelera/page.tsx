'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { moviesService } from '@/features/movies/services/moviesService';
import { showtimesService } from '@/features/showtimes/services/showtimesService';
import { Movie, Showtime } from '@/types';
import { Clock, Calendar, ArrowLeft, Search, Filter, MapPin, DollarSign, Film } from 'lucide-react';

interface MovieWithShowtimes extends Movie {
  showtimes: Showtime[];
}

export default function CarteleraPage() {
  const [moviesWithShowtimes, setMoviesWithShowtimes] = useState<MovieWithShowtimes[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<MovieWithShowtimes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [uniqueGenres, setUniqueGenres] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterMovies();
  }, [moviesWithShowtimes, searchTerm, selectedGenre]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [moviesData, showtimesData] = await Promise.all([
        moviesService.getAll(),
        showtimesService.getAll()
      ]);
      
      // Combinar películas con sus funciones
      const moviesWithShowtimesData: MovieWithShowtimes[] = moviesData.map(movie => {
        const movieShowtimes = showtimesData.filter(showtime => showtime.movieId === movie.id);
        return {
          ...movie,
          showtimes: movieShowtimes
        };
      }).filter(movie => movie.showtimes.length > 0); // Solo mostrar películas con funciones
      
      setMoviesWithShowtimes(moviesWithShowtimesData);
      
      // Obtener géneros únicos
      const genres = Array.from(new Set(moviesData.map(movie => movie.genre)));
      setUniqueGenres(genres);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterMovies = () => {
    let filtered = moviesWithShowtimes;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por género
    if (selectedGenre) {
      filtered = filtered.filter(movie => movie.genre === selectedGenre);
    }

    setFilteredMovies(filtered);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <div className="text-gray-600 text-lg">Cargando cartelera...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al inicio
            </Link>
            <div className="flex items-center space-x-2">
              <Film className="h-8 w-8 text-red-600" />
              <span className="text-2xl font-bold text-gray-900">CinemaPlus</span>
            </div>
            <Link
              href="/auth/login"
              className="text-gray-600 hover:text-red-600 transition-colors font-medium"
            >
              Mi Cuenta
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cartelera de Películas
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Descubre nuestra selección de películas con funciones disponibles
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar películas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Genre Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="input-field pl-10 appearance-none"
              >
                <option value="">Todos los géneros</option>
                {uniqueGenres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Movies Grid */}
        {filteredMovies.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="text-gray-500 text-xl">
                {moviesWithShowtimes.length === 0 ? 'No hay películas con funciones disponibles' : 'No se encontraron películas con esos filtros'}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredMovies.map((movie) => (
              <div
                key={movie.id}
                className="movie-card overflow-hidden"
              >
                <div className="flex flex-col md:flex-row h-full">
                  {/* Movie Poster */}
                  <div className="md:w-1/3 relative">
                    {movie.posterUrl ? (
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-64 md:h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-64 md:h-full bg-gray-100 flex items-center justify-center">
                        <Film className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Movie Info and Showtimes */}
                  <div className="md:w-2/3 p-6 flex flex-col">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {movie.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {movie.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {movie.durationMinutes} min
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                        {movie.genre}
                      </span>
                    </div>
                    
                    {/* Showtimes */}
                    <div className="flex-1">
                      <h4 className="text-gray-900 font-semibold mb-3">Funciones disponibles:</h4>
                      <div className="space-y-3">
                        {movie.showtimes
                          .filter(showtime => new Date(showtime.startTime) >= new Date()) // Solo funciones futuras
                          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()) // Ordenar por fecha
                          .slice(0, 4).map((showtime) => (
                          <div key={showtime.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-4">
                                <div className="text-gray-900">
                                  <span className="font-medium">
                                    {new Date(showtime.startTime).toLocaleTimeString('es-ES', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                  <span className="text-gray-500 text-xs ml-2">
                                    {new Date(showtime.startTime).toLocaleDateString('es-ES', {
                                      day: '2-digit',
                                      month: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <span className="text-gray-600 text-sm flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {showtime.room}
                                </span>
                              </div>
                              <span className="text-green-600 font-semibold flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                ${showtime.price.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500 text-xs">
                                {showtime.availableSeats}/{showtime.totalSeats} asientos disponibles
                              </span>
                              <Link
                                href={`/booking/${showtime.id}`}
                                className="btn-primary-sm"
                              >
                                Reservar
                              </Link>
                            </div>
                          </div>
                        ))}
                        {movie.showtimes.filter(showtime => new Date(showtime.startTime) >= new Date()).length > 4 && (
                          <div className="text-center">
                            <Link
                              href={`/movie/${movie.id}`}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Ver más funciones ({movie.showtimes.filter(showtime => new Date(showtime.startTime) >= new Date()).length - 4})
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Ver más funciones button */}
                    <Link
                      href={`/movie/${movie.id}`}
                      className="btn-secondary w-full text-center"
                    >
                      Ver todas las funciones
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Summary */}
        <div className="text-center mt-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-gray-600">
              Mostrando {filteredMovies.length} de {moviesWithShowtimes.length} películas con funciones
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
