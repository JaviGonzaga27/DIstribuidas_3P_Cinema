// Landing Page para clientes

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { moviesService } from '@/features/movies/services/moviesService';
import { showtimesService } from '@/features/showtimes/services/showtimesService';
import { Movie, Showtime } from '@/types';
import { Play, Calendar, Clock, Star, ArrowRight, Film, Users, Ticket } from 'lucide-react';

interface MovieWithShowtimes extends Movie {
  showtimes: Showtime[];
}

export default function HomePage() {
  const [moviesWithShowtimes, setMoviesWithShowtimes] = useState<MovieWithShowtimes[]>([]);
  const [featuredMovies, setFeaturedMovies] = useState<MovieWithShowtimes[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [moviesData, showtimesData] = await Promise.all([
        moviesService.getAll(),
        showtimesService.getAll()
      ]);
      
      // Combinar películas con sus funciones
      const moviesWithShowtimesData: MovieWithShowtimes[] = moviesData.map(movie => {
        const movieShowtimes = showtimesData.filter(showtime => 
          showtime.movieId === movie.id && new Date(showtime.startTime) >= new Date()
        );
        return {
          ...movie,
          showtimes: movieShowtimes
        };
      }).filter(movie => movie.showtimes.length > 0);
      
      setMoviesWithShowtimes(moviesWithShowtimesData);
      setFeaturedMovies(moviesWithShowtimesData.slice(0, 2));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Film className="h-8 w-8 text-red-600" />
              <span className="text-2xl font-bold text-gray-900">CinemaPlus</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/cartelera" className="text-gray-700 hover:text-red-600 font-medium transition-colors">
                Cartelera
              </Link>
              <Link href="/auth/login" className="text-gray-700 hover:text-red-600 font-medium transition-colors">
                Iniciar Sesión
              </Link>
              <Link href="/auth/register" className="btn-primary">
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-50 to-red-100 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Vive la <span className="text-red-600">Magia</span> del Cine
            </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Disfruta de las mejores películas en la comodidad de nuestras salas.
              Reserva tu función favorita y vive una experiencia única.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/cartelera"
                className="btn-primary inline-flex items-center gap-2 justify-center"
              >
                <Ticket className="w-5 h-5" />
                Ver Cartelera
              </Link>
              <Link
                href="/auth/login"
                className="btn-outline inline-flex items-center gap-2 justify-center"
              >
                <Users className="w-5 h-5" />
                Mi Cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Film className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Últimos Estrenos</h3>
              <p className="text-gray-600">Las películas más recientes y populares del momento</p>
            </div>
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Reserva Fácil</h3>
              <p className="text-gray-600">Sistema de reservas simple e intuitivo</p>
            </div>
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Experiencia Premium</h3>
              <p className="text-gray-600">Salas cómodas con la mejor tecnología</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Movies */}
      {featuredMovies.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                En Cartelera Ahora
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Descubre las películas que están disponibles en nuestros cines
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {featuredMovies.map((movie) => (
                <div key={movie.id} className="card-hover">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3">
                      {movie.posterUrl ? (
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="w-full h-64 md:h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-64 md:h-full bg-gray-200 flex items-center justify-center">
                          <Film className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="md:w-2/3 p-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{movie.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{movie.description}</p>
                      
                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {movie.durationMinutes} min
                        </span>
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                          {movie.genre}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Próximas funciones:</p>
                        <div className="flex flex-wrap gap-2">
                          {movie.showtimes.slice(0, 3).map((showtime) => (
                            <span key={showtime.id} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                              {new Date(showtime.startTime).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          ))}
                          {movie.showtimes.length > 3 && (
                            <span className="text-gray-500 text-sm">+{movie.showtimes.length - 3} más</span>
                          )}
                        </div>
                      </div>
                      
                      <Link
                        href={`/movie/${movie.id}`}
                        className="btn-primary inline-flex items-center gap-2"
                      >
                        Ver Funciones
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link
                href="/cartelera"
                className="btn-outline inline-flex items-center gap-2"
              >
                Ver Todas las Películas
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-red-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para tu próxima aventura cinematográfica?
          </h2>
          <p className="text-red-100 mb-8 max-w-2xl mx-auto">
            Explora nuestra cartelera completa y reserva tus asientos para las mejores películas
          </p>
          <Link
            href="/cartelera"
            className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            <Ticket className="w-5 h-5" />
            Explorar Cartelera
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Film className="h-8 w-8 text-red-600" />
                <span className="text-2xl font-bold">CinemaPlus</span>
              </div>
              <p className="text-gray-400">
                La mejor experiencia cinematográfica en la ciudad
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/cartelera" className="hover:text-white transition-colors">Cartelera</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Mi Cuenta</Link></li>
                <li><Link href="/auth/register" className="hover:text-white transition-colors">Registrarse</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <p className="text-gray-400">
                Email: info@cinemaplus.com<br />
                Teléfono: +1 234 567 8900
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 CinemaPlus. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
