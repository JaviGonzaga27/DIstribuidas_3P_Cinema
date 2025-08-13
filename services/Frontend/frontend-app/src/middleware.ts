// Middleware para proteger rutas administrativas

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que requieren autenticación de administrador
const adminRoutes = [
  '/admin',
  '/dashboard',
  '/admin/dashboard',
  '/admin/movies',
  '/admin/showtimes',
  '/admin/users',
  '/admin/reports'
];

// Rutas públicas que no requieren autenticación
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/movies',
  '/cartelera',
  '/booking'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('cinema_token')?.value;

  // Verificar si es una ruta administrativa
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  
  // Si es ruta administrativa y no hay token, redirigir al login de admin
  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Si es ruta administrativa con token, verificar rol (esto se haría con JWT decode)
  if (isAdminRoute && token) {
    // Aquí deberías decodificar el JWT y verificar el rol
    // Por simplicidad, asumimos que el middleware solo verifica la presencia del token
    // La verificación de rol se hace en el componente
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
