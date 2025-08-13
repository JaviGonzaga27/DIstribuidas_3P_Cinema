// Lista de funciones

'use client';

import React from 'react';
import { Showtime } from '@/types';
import { Calendar, Clock, MapPin, Users, Edit, Trash2, Film } from 'lucide-react';

interface ShowtimesListProps {
  showtimes: Showtime[];
  onEdit?: (showtime: Showtime) => void;
  onDelete?: (id: number) => void;
  isLoading?: boolean;
}

export const ShowtimesList: React.FC<ShowtimesListProps> = ({
  showtimes,
  onEdit,
  onDelete,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-6 bg-gray-300 rounded mb-3 w-1/3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showtimes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg">
        <div className="text-center py-12">
          <Film className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-600 text-lg mb-2">No hay funciones programadas</div>
          <p className="text-gray-500">Crea una nueva función para comenzar</p>
        </div>
      </div>
    );
  }

  // Group showtimes by movie, then sort by date
  const groupedByMovie = showtimes.reduce((groups, showtime) => {
    const movieKey = showtime.movieId.toString();
    if (!groups[movieKey]) {
      groups[movieKey] = {
        movie: showtime.movie,
        showtimes: []
      };
    }
    groups[movieKey].showtimes.push(showtime);
    return groups;
  }, {} as Record<string, { movie: any; showtimes: Showtime[] }>);

  // Sort each movie's showtimes by date
  Object.values(groupedByMovie).forEach(group => {
    group.showtimes.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  });

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="space-y-8">
          {Object.entries(groupedByMovie)
            .sort(([, a], [, b]) => {
              const titleA = a.movie?.title || 'Sin título';
              const titleB = b.movie?.title || 'Sin título';
              return titleA.localeCompare(titleB);
            })
            .map(([movieId, { movie, showtimes: movieShowtimes }]) => (
              <div key={movieId} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                {/* Movie Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Film className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {movie?.title || 'Título no disponible'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {movieShowtimes.length} funciones programadas
                    </p>
                  </div>
                </div>

                {/* Showtimes Table */}
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hora
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sala
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Precio
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Asientos
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {movieShowtimes.map((showtime, index) => (
                          <tr key={showtime.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-900">
                                  {formatDate(showtime.startTime)}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-900">
                                  {formatTime(showtime.startTime)}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-900">
                                  Sala {showtime.room}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="text-sm font-semibold text-green-600">
                                ${showtime.price?.toFixed(2) || '0.00'}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-900">
                                  {showtime.availableSeats || 0}/{showtime.totalSeats || 0}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2">
                                {onEdit && (
                                  <button
                                    onClick={() => onEdit(showtime)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Editar función"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                )}
                                {onDelete && (
                                  <button
                                    onClick={() => onDelete(showtime.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Eliminar función"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
