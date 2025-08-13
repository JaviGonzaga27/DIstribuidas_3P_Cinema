// Tipos globales de la aplicación

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos para Movies
export interface Movie {
  director: any;
  id: number;
  title: string;
  description: string;
  genre: string;
  durationMinutes: number;
  releaseDate: string;
  posterUrl?: string;
}

export interface CreateMovieDto {
  title: string;
  description: string;
  genre: string;
  durationMinutes: number;
  releaseDate: string;
  posterUrl?: string;
  showtimes?: MovieShowtimeDto[];
}

export interface MovieShowtimeDto {
  id?: number;
  movieId?: number;
  startTime: string;
  room: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  language: string;
  format: string;
  isSubtitled: boolean;
}

// Tipos para Showtimes
export interface Showtime {
  id: number;
  movieId: number;
  startTime: string;
  room: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  language: string;
  format: string;
  isSubtitled: boolean;
  movie?: Movie;
}

export interface ShowtimeDto {
  movieId: number;
  startTime: string;
  room: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  language?: string;
  format?: string;
  isSubtitled?: boolean;
}

// Tipos para Rooms
export interface Room {
  id: number;
  name: string;
  capacity: number;
  type: string;
  description?: string;
}

export interface Seat {
  id: number;
  roomId: number;
  seatNumber: string;
  row: string;
  column: number;
  isAvailable: boolean;
  seatType: string;
}

// Tipos para Bookings
export interface Booking {
  id: number;
  userId: number;
  showtimeId: number;
  bookingDate: string;
  totalAmount: number;
  status: string;
  seats: BookingSeat[];
  showtime?: Showtime;
}

export interface BookingSeat {
  id: number;
  bookingId: number;
  seatId: number;
  seat?: Seat;
}

export interface CreateBookingDto {
  userId: number;
  showtimeId: number;
  seatIds: number[];
}
