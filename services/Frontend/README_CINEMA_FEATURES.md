# Cinema Management System - Frontend

Este frontend provee una interfaz completa para gestionar un sistema de cinema con las siguientes funcionalidades:

## Funcionalidades Implementadas

### 🎬 Gestión de Películas (`/movies`)
- **Listar películas**: Vista de todas las películas con información detallada
- **Crear película**: Formulario completo para agregar nuevas películas
- **Editar película**: Modificar información de películas existentes
- **Eliminar película**: Eliminar películas del catálogo
- **Búsqueda y filtros**: Buscar por título, descripción, director o filtrar por género

**Campos incluidos:**
- Título, descripción, género, duración
- Fecha de estreno, director, reparto
- URL del poster, calificación

### 🎯 Gestión de Funciones (`/showtimes`)
- **Programar funciones**: Crear nuevos horarios para películas
- **Editar funciones**: Modificar horarios existentes
- **Eliminar funciones**: Remover funciones del calendario
- **Filtros avanzados**: Por película, fecha, sala
- **Cálculo automático**: La hora de fin se calcula automáticamente basada en la duración de la película

**Características:**
- Asociación con películas y salas
- Gestión de precios por función
- Organización por fechas
- Vista agrupada por días

### 📋 Gestión de Reservas (`/bookings`)
- **Vista de reservas**: Lista completa de todas las reservas
- **Estados de reserva**: Confirmadas, pendientes, canceladas
- **Información detallada**: Datos del usuario, película, asientos, total
- **Filtros**: Por estado, fecha, búsqueda por ID
- **Estadísticas**: Ingresos totales, reservas por estado

### 📊 Dashboard Mejorado
- **Acciones rápidas**: Enlaces directos a las principales funcionalidades
- **Estadísticas generales**: Resumen de películas, reservas, ingresos
- **Navegación intuitiva**: Header con navegación a todas las secciones

## Estructura de Archivos

```
src/
├── app/
│   ├── movies/          # Página de gestión de películas
│   ├── showtimes/       # Página de gestión de funciones
│   ├── bookings/        # Página de gestión de reservas
│   └── dashboard/       # Dashboard principal
├── features/
│   ├── movies/          # Componentes y servicios de películas
│   ├── showtimes/       # Componentes y servicios de funciones
│   └── bookings/        # Componentes y servicios de reservas
├── types/               # Tipos TypeScript actualizados
└── components/          # Componentes compartidos
```

## APIs Utilizadas

El frontend está configurado para conectarse con los siguientes microservicios a través del API Gateway:

- **Movies API** (`/movies`): Gestión de películas
- **Catalog API** (`/showtimes`): Gestión de funciones
- **Bookings API** (`/api/bookings`): Gestión de reservas

## Tecnologías

- **Next.js 15** con App Router
- **TypeScript** para tipado fuerte
- **Tailwind CSS** para estilos
- **Lucide React** para iconos
- **Arquitectura modular** con features separadas

## Cómo usar

1. **Inicia sesión** en el sistema
2. **Dashboard**: Ve el resumen general y usa las acciones rápidas
3. **Películas**: Gestiona el catálogo de películas
4. **Funciones**: Programa horarios para las películas
5. **Reservas**: Supervisa todas las reservas realizadas

## Notas importantes

- Las páginas están protegidas por autenticación
- Los formularios incluyen validación completa
- La interfaz es responsive y funciona en móviles
- Los datos se cargan dinámicamente desde las APIs
- Manejo de errores en todas las operaciones

## Próximas mejoras sugeridas

- Gestión de salas (CRUD completo)
- Selección visual de asientos
- Reportes y analytics avanzados
- Notificaciones en tiempo real
- Gestión de usuarios administrativos
