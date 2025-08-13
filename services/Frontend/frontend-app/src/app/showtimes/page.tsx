// Página principal de gestión de funciones

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ShowtimesList } from '@/features/showtimes/components/ShowtimesList';
import { ShowtimeForm } from '@/features/showtimes/components/ShowtimeForm';
import { showtimesService } from '@/features/showtimes/services/showtimesService';
import { moviesService } from '@/features/movies/services/moviesService';
import { Showtime, ShowtimeDto, Movie, Room } from '@/types';
import { getErrorMessage } from '@/utils';
import { Plus, Calendar, Filter } from 'lucide-react';

export default function ShowtimesPage() {
  const { user } = useAuth();
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [filteredShowtimes, setFilteredShowtimes] = useState<Showtime[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState<Showtime | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Filter showtimes when filters change
  useEffect(() => {
    filterShowtimes();
  }, [showtimes, selectedMovie, selectedDate]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const [showtimesData, moviesData] = await Promise.all([
        showtimesService.getAll(),
        moviesService.getAll()
      ]);
      
      // Enriquecer showtimes con información de películas
      const enrichedShowtimes = showtimesData.map(showtime => {
        const movie = moviesData.find(m => m.id === showtime.movieId);
        return {
          ...showtime,
          movie: movie
        };
      });
      
      setShowtimes(enrichedShowtimes);
      setMovies(moviesData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const filterShowtimes = () => {
    let filtered = [...showtimes];

    if (selectedMovie) {
      filtered = filtered.filter(showtime => showtime.movieId.toString() === selectedMovie);
    }

    if (selectedDate) {
      filtered = filtered.filter(showtime => {
        const showtimeDate = new Date(showtime.startTime).toISOString().split('T')[0];
        return showtimeDate === selectedDate;
      });
    }

    setFilteredShowtimes(filtered);
  };

  const handleCreateShowtime = async (showtimeData: ShowtimeDto) => {
    try {
      setIsSubmitting(true);
      await showtimesService.create(showtimeData);
      await loadData();
      setShowForm(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateShowtime = async (showtimeData: ShowtimeDto) => {
    if (!editingShowtime) return;

    try {
      setIsSubmitting(true);
      await showtimesService.update(editingShowtime.id, showtimeData);
      await loadData();
      setShowForm(false);
      setEditingShowtime(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (showtimeData: ShowtimeDto) => {
    if (editingShowtime) {
      await handleUpdateShowtime(showtimeData);
    } else {
      await handleCreateShowtime(showtimeData);
    }
  };

  const handleEdit = (showtime: Showtime) => {
    setEditingShowtime(showtime);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta función?')) {
      return;
    }

    try {
      await showtimesService.deleteShowtime(id);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleNewShowtime = () => {
    setEditingShowtime(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingShowtime(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Funciones</h1>
              <p className="text-gray-600 mt-1">
                Programa y administra las funciones del cinema
              </p>
            </div>
            <button
              onClick={handleNewShowtime}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nueva Función
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Filtros de Búsqueda
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Movie filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por película
              </label>
              <select
                value={selectedMovie}
                onChange={(e) => setSelectedMovie(e.target.value)}
                className="input-field"
              >
                <option value="">Todas las películas</option>
                {movies.map(movie => (
                  <option key={movie.id} value={movie.id.toString()}>
                    {movie.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Date filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por fecha
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Funciones</p>
                <p className="text-2xl font-bold text-gray-900">{filteredShowtimes.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <Filter className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Películas Activas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(filteredShowtimes.map(s => s.movieId)).size}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                <Plus className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Salas en Uso</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(filteredShowtimes.map(s => s.room)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-200 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xs">!</span>
              </div>
              {error}
            </div>
          </div>
        )}

        {/* Showtimes List */}
        <ShowtimesList
          showtimes={filteredShowtimes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />

        {/* Showtime Form Modal */}
        {showForm && (
          <ShowtimeForm
            showtime={editingShowtime}
            movies={movies}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={isSubmitting}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
