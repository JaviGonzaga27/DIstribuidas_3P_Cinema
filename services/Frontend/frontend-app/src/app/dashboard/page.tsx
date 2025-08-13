// Página principal del dashboard

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCards } from '@/features/dashboard/components/StatsCards';
import { PopularMovies } from '@/features/dashboard/components/PopularMovies';
import { RecentActivityList } from '@/features/dashboard/components/RecentActivityList';
import { dashboardService } from '@/features/dashboard/services/dashboardService';
import { DashboardData } from '@/features/dashboard/types';
import { getErrorMessage } from '@/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const data = await dashboardService.getDashboardData();
        setDashboardData(data);
      } catch (err) {
        setError(getErrorMessage(err));
        // En caso de error, establecer datos por defecto
        setDashboardData({
          stats: {
            totalMovies: 0,
            totalBookings: 0,
            totalRevenue: 0,
            totalUsers: 0
          },
          popularMovies: [],
          recentActivity: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Bienvenido de vuelta, {user?.firstName} {user?.lastName}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">ℹ️</span>
              </div>
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  Calculando estadísticas desde datos locales
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Los datos se generan en base a las películas y funciones registradas en el sistema.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <StatsCards 
          stats={dashboardData?.stats || {
            totalMovies: 0,
            totalBookings: 0,
            totalRevenue: 0,
            totalUsers: 0
          }} 
          isLoading={isLoading} 
        />

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/movies"
              className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <span className="text-blue-600 text-xl">🎬</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Gestionar Películas</h3>
                <p className="text-sm text-gray-600">Agregar o editar películas</p>
              </div>
            </a>
            
            <a
              href="/showtimes"
              className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors border border-green-100"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <span className="text-green-600 text-xl">🎯</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Programar Funciones</h3>
                <p className="text-sm text-gray-600">Crear horarios de películas</p>
              </div>
            </a>
            
            <a
              href="/reservas"
              className="flex items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors border border-purple-100"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                <span className="text-purple-600 text-xl">📋</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Ver Reservas</h3>
                <p className="text-sm text-gray-600">Administrar reservas</p>
              </div>
            </a>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Movies */}
          <PopularMovies 
            movies={dashboardData?.popularMovies || []} 
            isLoading={isLoading} 
          />

          {/* Recent Activity */}
          <RecentActivityList 
            activities={dashboardData?.recentActivity || []} 
            isLoading={isLoading} 
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
