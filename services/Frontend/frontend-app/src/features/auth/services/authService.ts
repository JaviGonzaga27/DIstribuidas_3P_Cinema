// Servicio de autenticación

import { apiService } from '@/services/api';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/constants';
import { 
  LoginRequest, 
  RegisterRequest, 
  LoginResponse, 
  RefreshTokenRequest,
  AuthResult,
  User,
  UserRole 
} from '@/features/auth/types';

export class AuthService {
  // Convierte AuthResult del backend a LoginResponse del frontend
  private convertAuthResult(authResult: AuthResult): LoginResponse {
    const user: User = {
      id: authResult.userId.toString(),
      email: authResult.email,
      firstName: '', // Estos campos los completaremos después desde el microservicio Users
      lastName: '',
      role: UserRole.USER,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return {
      token: authResult.accessToken,
      refreshToken: authResult.refreshToken,
      user
    };
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.post<AuthResult>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    if (response.success && response.data) {
      const loginResponse = this.convertAuthResult(response.data);
      this.setTokens(loginResponse.token, loginResponse.refreshToken);
      this.setUser(loginResponse.user);
      return loginResponse;
    }

    throw new Error(response.message || 'Error en el login');
  }

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    const response = await apiService.post<AuthResult>(
      API_ENDPOINTS.AUTH.REGISTER,
      userData
    );

    if (response.success && response.data) {
      const loginResponse = this.convertAuthResult(response.data);
      this.setTokens(loginResponse.token, loginResponse.refreshToken);
      this.setUser(loginResponse.user);
      return loginResponse;
    }

    throw new Error(response.message || 'Error en el registro');
  }

  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No hay refresh token disponible');
    }

    const response = await apiService.post<{ token: string }>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken } as RefreshTokenRequest
    );

    if (response.success && response.data) {
      this.setToken(response.data.token);
      return response.data.token;
    }

    throw new Error(response.message || 'Error al refrescar el token');
  }

  async getProfile(): Promise<User> {
    const response = await apiService.get<User>(API_ENDPOINTS.AUTH.PROFILE);
    
    if (response.success && response.data) {
      this.setUser(response.data);
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener el perfil');
  }

  logout(): void {
    this.clearTokens();
    this.clearUser();
  }

  // Métodos de almacenamiento local
  private setTokens(token: string, refreshToken: string): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }

  private setToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  }

  private setUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  private clearTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  private clearUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
