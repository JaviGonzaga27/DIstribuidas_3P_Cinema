// Formulario para crear/editar funciones

'use client';

import React, { useState, useEffect } from 'react';
import { Showtime, ShowtimeDto, Movie, Room } from '@/types';

interface ShowtimeFormProps {
  showtime?: Showtime | null;
  movies: Movie[];
  onSubmit: (data: ShowtimeDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ShowtimeForm: React.FC<ShowtimeFormProps> = ({
  showtime,
  movies,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<ShowtimeDto>({
    movieId: 0,
    startTime: '',
    room: '',
    price: 0,
    totalSeats: 100,
    availableSeats: 100,
    language: 'Español',
    format: '2D',
    isSubtitled: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (showtime) {
      setFormData({
        movieId: showtime.movieId,
        startTime: showtime.startTime,
        room: showtime.room,
        price: showtime.price,
        totalSeats: showtime.totalSeats,
        availableSeats: showtime.availableSeats,
        language: showtime.language,
        format: showtime.format,
        isSubtitled: showtime.isSubtitled
      });
    }
  }, [showtime]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.movieId) {
      newErrors.movieId = 'Selecciona una película';
    }

    if (!formData.room.trim()) {
      newErrors.room = 'La sala es requerida';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'La hora de inicio es requerida';
    } else {
      // Validar que la fecha sea futura solo para nuevas funciones
      const selectedDate = new Date(formData.startTime);
      const now = new Date();
      if (!showtime && selectedDate <= now) {
        newErrors.startTime = 'La fecha debe ser futura';
      }
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (!formData.totalSeats || formData.totalSeats <= 0) {
      newErrors.totalSeats = 'El total de asientos debe ser mayor a 0';
    }

    if (formData.availableSeats > formData.totalSeats) {
      newErrors.availableSeats = 'Los asientos disponibles no pueden ser más que el total';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'movieId' ? parseInt(value) || 0 :
              name === 'price' || name === 'totalSeats' || name === 'availableSeats' ? parseFloat(value) || 0 :
              name === 'isSubtitled' ? value === 'true' : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {showtime ? 'Editar Función' : 'Nueva Función'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Película */}
            <div>
              <label htmlFor="movieId" className="block text-sm font-medium text-gray-700 mb-1">
                Película *
              </label>
              <select
                id="movieId"
                name="movieId"
                value={formData.movieId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  errors.movieId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecciona una película</option>
                {movies.map(movie => (
                  <option key={movie.id} value={movie.id}>
                    {movie.title} ({movie.durationMinutes} min)
                  </option>
                ))}
              </select>
              {errors.movieId && (
                <p className="text-red-500 text-sm mt-1">{errors.movieId}</p>
              )}
            </div>

            {/* Sala */}
            <div>
              <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-1">
                Sala *
              </label>
              <input
                type="text"
                id="room"
                name="room"
                value={formData.room}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  errors.room ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Sala 1"
              />
              {errors.room && (
                <p className="text-red-500 text-sm mt-1">{errors.room}</p>
              )}
            </div>

            {/* Hora de inicio */}
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Inicio *
              </label>
              <input
                type="datetime-local"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  errors.startTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.startTime && (
                <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
              )}
            </div>

            {/* Precio */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Precio *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="15.00"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            {/* Total de asientos */}
            <div>
              <label htmlFor="totalSeats" className="block text-sm font-medium text-gray-700 mb-1">
                Total de Asientos *
              </label>
              <input
                type="number"
                id="totalSeats"
                name="totalSeats"
                value={formData.totalSeats}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  errors.totalSeats ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="100"
              />
              {errors.totalSeats && (
                <p className="text-red-500 text-sm mt-1">{errors.totalSeats}</p>
              )}
            </div>

            {/* Asientos disponibles */}
            <div>
              <label htmlFor="availableSeats" className="block text-sm font-medium text-gray-700 mb-1">
                Asientos Disponibles *
              </label>
              <input
                type="number"
                id="availableSeats"
                name="availableSeats"
                value={formData.availableSeats}
                onChange={handleChange}
                min="0"
                max={formData.totalSeats}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  errors.availableSeats ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="100"
              />
              {errors.availableSeats && (
                <p className="text-red-500 text-sm mt-1">{errors.availableSeats}</p>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Guardando...' : (showtime ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
