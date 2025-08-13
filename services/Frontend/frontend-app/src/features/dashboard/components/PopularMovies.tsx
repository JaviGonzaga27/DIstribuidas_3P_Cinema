// Componente de películas populares

import { MovieStats } from '@/features/dashboard/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { formatCurrency } from '@/utils';

interface PopularMoviesProps {
  movies: MovieStats[];
  isLoading?: boolean;
}

export function PopularMovies({ movies, isLoading }: PopularMoviesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Películas Populares</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Películas Populares</CardTitle>
      </CardHeader>
      <CardContent>
        {movies.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No hay datos de películas disponibles
          </p>
        ) : (
          <div className="space-y-4">
            {movies.map((movie, index) => (
              <div 
                key={movie.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{movie.title}</h4>
                    <p className="text-sm text-gray-500">
                      {movie.totalBookings} reservas
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">
                    {formatCurrency(movie.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
