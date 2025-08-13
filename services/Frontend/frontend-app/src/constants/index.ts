// Constantes de la aplicación

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register-client', // Cambiar a endpoint de clientes
    REGISTER_ADMIN: '/auth/register', // Endpoint para admin
    REGISTER_FIRST_ADMIN: '/auth/register-first-admin', // Endpoint para primer admin
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile'
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile'
  },
  MOVIES: {
    BASE: '/movies',
    SEARCH: '/movies/search'
  },
  CATALOG: {
    BASE: '/catalog',
    MOVIES: '/catalog/movies'
  },
  SHOWTIMES: {
    BASE: '/showtimes',
    BY_MOVIE: '/showtimes/movie'
  },
  BOOKINGS: {
    BASE: '/bookings',
    USER_BOOKINGS: '/bookings/user',
    BY_SHOWTIME: '/bookings/showtime'
  },
  ROOMS: {
    BASE: '/rooms',
    SEATS: '/rooms/{roomId}/seats'
  },
  REVIEWS: {
    BASE: '/reviews',
    MOVIE_REVIEWS: '/reviews/movie'
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    POPULAR_MOVIES: '/dashboard/popular-movies',
    RECENT_ACTIVITY: '/dashboard/recent-activity'
  }
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'cinema_token',
  REFRESH_TOKEN: 'cinema_refresh_token',
  USER: 'cinema_user'
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  MOVIES: '/movies',
  BOOKINGS: '/reservas',
  PROFILE: '/profile'
} as const;

export const PAGE_SIZE = 10;

export const JWT_EXPIRATION_BUFFER = 5 * 60 * 1000; // 5 minutos en milisegundos
