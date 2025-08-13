'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { moviesService } from '@/features/movies/services/moviesService';
import { showtimesService } from '@/features/showtimes/services/showtimesService';
import { Movie, Showtime } from '@/types';
import { ArrowLeft, Clock, Calendar, MapPin, Star, Users, Film, Play } from 'lucide-react';

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = parseInt(params.id as string);
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    if (movieId) {
      loadMovieData();
    }
  }, [movieId]);

  const loadMovieData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar película
      const movieData = await moviesService.getById(movieId);
      setMovie(movieData);
      
      // Cargar funciones
      const showtimesData = await showtimesService.getAll();
      const movieShowtimes = showtimesData.filter(st => st.movieId === movieId);
      setShowtimes(movieShowtimes);
      
      // Seleccionar fecha de hoy por defecto
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
      
    } catch (error) {
      console.error('Error loading movie data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableDates = () => {
    const dates = Array.from(new Set(showtimes.map(st => 
      new Date(st.startTime).toISOString().split('T')[0]
    ))).sort();
    return dates;
  };

  const getShowtimesByDate = (date: string) => {
    return showtimes.filter(st => 
      new Date(st.startTime).toISOString().split('T')[0] === date
    ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleBooking = (showtimeId: number) => {
    router.push(`/booking/${showtimeId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-900 text-xl">Cargando película...</div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl p-8 shadow-lg border border-gray-200">
          <div className="text-gray-900 text-xl mb-4">Película no encontrada</div>
          <Link
            href="/cartelera"
            className="btn-primary"
          >
            Volver a Cartelera
          </Link>
        </div>
      </div>
    );
  }

  const availableDates = getAvailableDates();
  const selectedDateShowtimes = getShowtimesByDate(selectedDate);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/cartelera"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver a Cartelera
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">CinemaPlus</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Movie Info */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
            {/* Poster */}
            <div className="lg:col-span-1">
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full rounded-xl shadow-lg"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <div className="text-center z-10">
                    <Film className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <span className="text-gray-500 font-medium">Sin imagen disponible</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-purple-50 opacity-50"></div>
                </div>
              )}
            </div>

            {/* Movie Details */}
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{movie.title}</h1>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>{movie.durationMinutes} minutos</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>Estreno: {new Date(movie.releaseDate).toLocaleDateString()}</span>
                </div>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {movie.genre}
                </div>
                <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-yellow-700 font-medium">4.5</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Sinopsis</h3>
                <p className="text-gray-600 leading-relaxed">{movie.description}</p>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-4 flex-wrap">
                <button className="btn-secondary flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Agregar a Favoritos
                </button>
                <button className="btn-ghost flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Compartir
                </button>
                <button className="btn-ghost flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Ver Tráiler
                </button>
              </div>
            </div>
          </div>
          
          {/* Additional Movie Info */}
          <div className="border-t border-gray-200 mt-8 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Duración</h4>
                <p className="text-gray-600">{movie.durationMinutes} minutos</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Estreno</h4>
                <p className="text-gray-600">{new Date(movie.releaseDate).toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Film className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Género</h4>
                <p className="text-gray-600">{movie.genre}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Showtimes Section with Sidebar Layout */}
        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Date Selector - Mobile: Horizontal, Desktop: Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            {/* Mobile: Horizontal tabs */}
            <div className="lg:hidden mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Fechas Disponibles
              </h3>
              {availableDates.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {availableDates.map(date => {
                    const dateShowtimes = getShowtimesByDate(date);
                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`flex-shrink-0 p-3 rounded-xl font-medium transition-all duration-200 text-center ${
                          selectedDate === date
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-200'
                        }`}
                      >
                        <div className="text-sm font-semibold">
                          {new Date(date).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className={`text-xs ${selectedDate === date ? 'text-blue-200' : 'text-gray-500'}`}>
                          {dateShowtimes.length} funciones
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Desktop: Sidebar */}
            <div className="hidden lg:block bg-white rounded-xl border border-gray-200 p-6 shadow-lg lg:sticky lg:top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Fechas Disponibles
              </h3>
              
              {availableDates.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-600 text-sm mb-2">
                    No hay funciones programadas
                  </div>
                  <div className="text-gray-500 text-xs">
                    Esta película no tiene horarios disponibles
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableDates.map(date => {
                    const dateShowtimes = getShowtimesByDate(date);
                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`w-full p-4 rounded-xl font-medium transition-all duration-200 text-left relative ${
                          selectedDate === date
                            ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">
                              {new Date(date).toLocaleDateString('es-ES', {
                                weekday: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            <div className={`text-sm ${selectedDate === date ? 'text-blue-200' : 'text-gray-500'}`}>
                              {new Date(date).toLocaleDateString('es-ES', {
                                month: 'long'
                              })}
                            </div>
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            selectedDate === date 
                              ? 'bg-blue-500 text-blue-100' 
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {dateShowtimes.length} funciones
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Showtimes Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Horarios de Función</h2>
                {selectedDate && availableDates.length > 0 && (
                  <div className="text-left sm:text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatDate(selectedDate)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedDateShowtimes.length} funciones disponibles
                    </div>
                  </div>
                )}
              </div>

              {/* Showtimes Grid */}
              {availableDates.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-600">No hay funciones programadas</div>
                  <div className="text-gray-500 text-sm mt-2">Esta película no tiene horarios disponibles</div>
                </div>
              ) : selectedDateShowtimes.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-600">No hay funciones para esta fecha</div>
                  <div className="text-gray-500 text-sm mt-2">Selecciona otra fecha para ver horarios disponibles</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {selectedDateShowtimes.map(showtime => (
                    <div
                      key={showtime.id}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-2xl font-bold text-gray-900 mb-1">
                            {formatTime(showtime.startTime)}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">Sala {showtime.room}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600 mb-1">
                            ${showtime.price}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1 justify-end">
                            <Users className="w-3 h-3" />
                            <span>{showtime.availableSeats} disponibles</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Availability indicator */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Disponibilidad</span>
                          <span>{Math.round((showtime.availableSeats / showtime.totalSeats) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              showtime.availableSeats / showtime.totalSeats > 0.5 
                                ? 'bg-green-500' 
                                : showtime.availableSeats / showtime.totalSeats > 0.2
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${(showtime.availableSeats / showtime.totalSeats) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleBooking(showtime.id)}
                        className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                          showtime.availableSeats === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'btn-primary hover:scale-105'
                        }`}
                        disabled={showtime.availableSeats === 0}
                      >
                        {showtime.availableSeats === 0 ? '🎫 Agotado' : '🎟️ Reservar Función'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer Info */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-gray-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Necesitas ayuda?</h3>
            <p className="text-gray-600 mb-4">
              Nuestro equipo está aquí para asistirte con tu experiencia cinematográfica
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <button className="btn-ghost text-sm">
                📞 Contacto
              </button>
              <button className="btn-ghost text-sm">
                ❓ Preguntas Frecuentes
              </button>
              <button className="btn-ghost text-sm">
                🎫 Política de Boletos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
