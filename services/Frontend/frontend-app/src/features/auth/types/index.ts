// Tipos específicos para autenticación

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  fullName: string;
  birthDate: string; // En formato ISO string
  phoneNumber: string;
  address: string;
  role?: string; // Opcional, por defecto "User"
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

// Respuesta del backend (AuthResult)
export interface AuthResult {
  accessToken: string;
  userId: number;
  email: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}
