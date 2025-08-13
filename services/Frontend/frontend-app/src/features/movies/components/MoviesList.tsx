// Componente para mostrar la lista de películas

'use client';

import React from 'react';
import { Movie } from '@/types';
import { MovieCard } from './MovieCard';

interface MoviesListProps {
  movies: Movie[];
  onEdit?: (movie: Movie) => void;
  onDelete?: (id: number) => void;
  onViewDetails?: (movie: Movie) => void;
  isLoading?: boolean;
}

export const MoviesList: React.FC<MoviesListProps> = ({
  movies,
  onEdit,
  onDelete,
  onViewDetails,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md animate-pulse">
            <div className="h-64 bg-gray-300 rounded-t-lg"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No hay películas disponibles</div>
        <p className="text-gray-400 mt-2">Agrega una nueva película para comenzar</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};
