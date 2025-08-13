// Hook de autenticación

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '@/features/auth/services/authService';
import { 
  AuthContextType, 
  User, 
  LoginRequest, 
  RegisterRequest 
} from '@/features/auth/types';
import { getErrorMessage } from '@/utils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar el estado de autenticación
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = authService.getToken();
        const storedUser = authService.getUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          
          // Verificar que el token siga siendo válido obteniendo el perfil
          try {
            const profile = await authService.getProfile();
            setUser(profile);
          } catch (error) {
            // Si falla, intentar refrescar el token
            try {
              const newToken = await authService.refreshToken();
              setToken(newToken);
              const profile = await authService.getProfile();
              setUser(profile);
            } catch {
              // Si el refresh falla, limpiar todo
              authService.logout();
              setToken(null);
              setUser(null);
            }
          }
        }
      } catch {
        console.error('Error al inicializar autenticación');
        authService.logout();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const newToken = await authService.refreshToken();
      setToken(newToken);
    } catch (error) {
      logout();
      throw new Error(getErrorMessage(error));
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
