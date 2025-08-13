// Tipos para el dashboard

export interface DashboardStats {
  totalMovies: number;
  totalBookings: number;
  totalRevenue: number;
  totalUsers: number;
}

export interface MovieStats {
  id: string;
  title: string;
  totalBookings: number;
  revenue: number;
}

export interface RecentActivity {
  id: string;
  type: 'booking' | 'review' | 'user_registration';
  description: string;
  createdAt: string;
  userId?: string;
  userName?: string;
}

export interface DashboardData {
  stats: DashboardStats;
  popularMovies: MovieStats[];
  recentActivity: RecentActivity[];
}
