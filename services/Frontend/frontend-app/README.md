# Frontend - Cinema API

Frontend desarrollado con Next.js 15 para el sistema de gestión de cines con arquitectura de microservicios.

## 🏗️ Arquitectura

El frontend está organizado con la siguiente estructura:

```
src/
├── app/                    # App Router de Next.js
│   ├── auth/              # Páginas de autenticación
│   ├── dashboard/         # Página del dashboard
│   ├── layout.tsx         # Layout raíz
│   └── page.tsx           # Página principal
├── components/            # Componentes globales
│   ├── ui/               # Componentes de UI reutilizables
│   └── layout/           # Componentes de layout
├── features/             # Features organizadas por dominio
│   ├── auth/             # Feature de autenticación
│   │   ├── components/   # Componentes específicos de auth
│   │   ├── services/     # Servicios de auth
│   │   └── types/        # Tipos de auth
│   └── dashboard/        # Feature del dashboard
│       ├── components/   # Componentes del dashboard
│       ├── services/     # Servicios del dashboard
│       └── types/        # Tipos del dashboard
├── hooks/                # Custom hooks
├── services/             # Servicios globales
├── types/                # Tipos globales
├── utils/                # Utilidades
└── constants/            # Constantes
```

## 🚀 Tecnologías

- **Next.js 15** - Framework de React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS
- **React Hooks** - Gestión de estado local
- **Context API** - Gestión de estado global para autenticación

## 🌟 Características

### Autenticación
- ✅ Formulario de login
- ✅ Formulario de registro
- ✅ Gestión de tokens JWT
- ✅ Refresh automático de tokens
- ✅ Protección de rutas
- ✅ Contexto de autenticación global

### Dashboard
- ✅ Estadísticas generales
- ✅ Películas populares
- ✅ Actividad reciente
- ✅ Layout responsivo

### Componentes UI
- ✅ Botones con variantes
- ✅ Inputs con validación
- ✅ Cards modulares
- ✅ Loading states
- ✅ Error handling

## 🔧 Desarrollo

### Prerequisitos
- Node.js 18+
- npm o yarn

### Instalación
```bash
cd services/Frontend/frontend-app
npm install
```

### Variables de entorno
Crear un archivo `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Ejecutar en desarrollo
```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 🐳 Docker

El frontend está incluido en el `docker-compose.yml` principal:
```bash
# Desde la raíz del proyecto
docker-compose up frontend
```

## 📡 API Integration

El frontend se conecta al API Gateway en el puerto 5000 con autenticación JWT automática.
