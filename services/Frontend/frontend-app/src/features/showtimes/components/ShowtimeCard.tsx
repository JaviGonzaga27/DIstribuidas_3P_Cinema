// Componente para mostrar una tarjeta de función

'use client';

import React from 'react';
import { Showtime } from '@/types';
import { Edit, Trash2, Clock, MapPin, DollarSign } from 'lucide-react';

interface ShowtimeCardProps {
  showtime: Showtime;
  onEdit?: (showtime: Showtime) => void;
  onDelete?: (id: number) => void;
}

export const ShowtimeCard: React.FC<ShowtimeCardProps> = ({
  showtime,
  onEdit,
  onDelete
}) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
      {/* Movie info */}
      {showtime.movie && (
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {showtime.movie.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {showtime.movie.description}
          </p>
        </div>
      )}

      {/* Showtime details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2 text-blue-500" />
          <span className="font-medium">
            {formatTime(showtime.startTime)}
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2 text-green-500" />
          <span>
            {showtime.room}
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <DollarSign className="w-4 h-4 mr-2 text-yellow-500" />
          <span className="font-semibold text-green-600">
            ${showtime.price.toFixed(2)}
          </span>
        </div>

        <div className="text-sm text-gray-600">
          <span>Asientos: {showtime.availableSeats}/{showtime.totalSeats}</span>
        </div>
      </div>

      {/* Date */}
      <div className="mb-4 p-2 bg-gray-50 rounded-md">
        <p className="text-xs text-gray-500 uppercase font-medium">Fecha</p>
        <p className="text-sm font-medium text-gray-700">
          {formatDate(showtime.startTime)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {onEdit && (
          <button
            onClick={() => onEdit(showtime)}
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
        )}
        
        {onDelete && (
          <button
            onClick={() => onDelete(showtime.id)}
            className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
