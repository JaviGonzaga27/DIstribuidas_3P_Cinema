// Página de acceso para administradores

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { LoginRequest } from '@/features/auth/types';
import { ROUTES } from '@/constants';
import { isValidEmail } from '@/utils';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<Partial<LoginRequest>>({});
  const [submitError, setSubmitError] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginRequest> = {};

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    try {
      const result = await login(formData);
      
      // Verificar que el usuario sea Admin
      if (result.user.role !== 'Admin') {
        setSubmitError('Acceso denegado. Esta área es solo para administradores.');
        return;
      }
      
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Error al iniciar sesión');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof LoginRequest]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Cinema API</h1>
          <p className="mt-2 text-red-200">Panel de Administración</p>
          <div className="mt-4 p-3 bg-red-700/20 border border-red-600 rounded-lg">
            <p className="text-sm text-red-200">⚠️ Acceso restringido solo para administradores</p>
          </div>
        </div>

        <Card className="border-red-300 shadow-2xl">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-900">Acceso Administrativo</CardTitle>
            <CardDescription className="text-red-700">
              Ingrese sus credenciales de administrador
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="email"
                type="email"
                label="Email de Administrador"
                placeholder="admin@cinema.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />

              <Input
                name="password"
                type="password"
                label="Contraseña"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
              />

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{submitError}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Verificando...' : 'Acceder al Panel'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Eres cliente?{' '}
                <a 
                  href="/"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Ir al sitio principal
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
