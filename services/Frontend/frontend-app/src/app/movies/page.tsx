// Página principal de gestión de películas

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MoviesList } from '@/features/movies/components/MoviesList';
import { MovieForm } from '@/features/movies/components/MovieForm';
import { moviesService } from '@/features/movies/services/moviesService';
import { Movie, CreateMovieDto } from '@/types';
import { getErrorMessage } from '@/utils';
import { Plus, Search, Filter } from 'lucide-react';

export default function MoviesPage() {
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  // Load movies on component mount
  useEffect(() => {
    loadMovies();
  }, []);

  // Filter movies when search term or genre changes
  useEffect(() => {
    filterMovies();
  }, [movies, searchTerm, selectedGenre]);

  const loadMovies = async () => {
    try {
      setIsLoading(true);
      setError('');
      const moviesData = await moviesService.getAll();
      setMovies(moviesData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const filterMovies = () => {
    let filtered = [...movies];

    if (searchTerm) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.director?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGenre) {
      filtered = filtered.filter(movie => movie.genre === selectedGenre);
    }

    setFilteredMovies(filtered);
  };

  const handleCreateMovie = async (movieData: CreateMovieDto) => {
    try {
      setIsSubmitting(true);
      await moviesService.create(movieData);
      await loadMovies();
      setShowForm(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMovie = async (movieData: CreateMovieDto) => {
    if (!editingMovie) return;

    try {
      setIsSubmitting(true);
      await moviesService.update(editingMovie.id, movieData);
      await loadMovies();
      setShowForm(false);
      setEditingMovie(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (movieData: CreateMovieDto) => {
    if (editingMovie) {
      await handleUpdateMovie(movieData);
    } else {
      await handleCreateMovie(movieData);
    }
  };

  const handleEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta película?')) {
      return;
    }

    try {
      await moviesService.deleteMovie(id);
      await loadMovies();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleNewMovie = () => {
    setEditingMovie(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMovie(null);
  };

  const uniqueGenres = [...new Set(movies.map(movie => movie.genre))].sort();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Películas</h1>
            <p className="text-gray-600 mt-1">
              Administra el catálogo de películas del cinema
            </p>
          </div>
          <button
            onClick={handleNewMovie}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nueva Película
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por título, descripción o director..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            {/* Genre filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[160px]"
              >
                <option value="">Todos los géneros</option>
                {uniqueGenres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Movies List */}
        <MoviesList
          movies={filteredMovies}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />

        {/* Movie Form Modal */}
        {showForm && (
          <MovieForm
            movie={editingMovie}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={isSubmitting}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
