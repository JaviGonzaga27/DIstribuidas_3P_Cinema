# 🎬 Cinema API - Sistema Híbrido de Gestión de Cine

Sistema completo de gestión de cine con arquitectura de microservicios que maneja dos tipos de usuarios:

- **👨‍💼 Administradores**: Gestión completa del cine (películas, salas, horarios, reportes)
- **🎭 Clientes**: Portal público para ver cartelera y comprar boletos

## 🚀 Instalación Rápida con Docker

### Requisitos previos
- **Docker Desktop** instalado
- **PowerShell** (Windows) o **Bash** (Linux/Mac)
- Puertos disponibles: 3000, 5000-5006, 5432, 5672, 15672, 5050

### 🎬 Configuración Automática (Recomendado)

#### Windows (PowerShell):
```powershell
# Clonar repositorio
git clone https://github.com/JoelArg02/API-CINEMA.git
cd API-CINEMA

# Configuración completa automática
.\setup-cinema-docker.ps1
```

#### Linux/Mac (Bash):
```bash
# Clonar repositorio
git clone https://github.com/JoelArg02/API-CINEMA.git
cd API-CINEMA

# Configuración completa automática
chmod +x setup-cinema-docker.sh
./setup-cinema-docker.sh
```

### 🔧 Configuración Manual

```bash
# 1. Copiar variables de entorno
cp .env.example .env

# 2. Iniciar servicios
docker-compose up -d

# 3. Configurar primer administrador (Windows)
.\setup-first-admin.ps1
```

## 🌐 URLs del Sistema

| Servicio | URL | Descripción |
|----------|-----|-------------|
| 🎭 **Portal Clientes** | http://localhost:3000 | Registro, cartelera y compras |
| 👨‍💼 **Panel Admin** | http://localhost:3000/admin/login | Gestión completa del cine |
| 🔗 **API Gateway** | http://localhost:5000 | Gateway principal |
| 📊 **RabbitMQ UI** | http://localhost:15672 | Gestión de mensajes |
| 🗄️ **PgAdmin** | http://localhost:5050 | Admin de base de datos |

## 👥 Usuarios Configurados Automáticamente

### 👨‍💼 Administrador
- **Email**: `admin@cinema.com`
- **Contraseña**: `CinemaAdmin2025!`
- **Acceso**: Panel completo de administración

### 🎭 Cliente de Ejemplo
- **Email**: `cliente@test.com`
- **Contraseña**: `Cliente123!`
- **Acceso**: Cartelera y compra de boletos

> ⚠️ **SEGURIDAD**: Cambia estas contraseñas inmediatamente en producción

## 🏗️ Arquitectura

### Microservicios
- **Gateway** (Puerto 5000) - API Gateway con Ocelot
- **Auth** (Puerto 5001) - Autenticación y autorización
- **Movies** (Puerto 5002) - Gestión de películas
- **Bookings** (Puerto 5005) - Reservas y WebSockets
- **Users** (Puerto 5003) - Gestión de usuarios
- **Catalog** (Puerto 5004) - Catálogo de contenido
- **Reviews** (Puerto 5006) - Sistema de reseñas

### Frontend
- **Next.js 15.4.6** con React
- **Tailwind CSS** para estilos
- **SignalR** para WebSockets en tiempo real
- **Diseño responsivo** y moderno

### Base de Datos
- **PostgreSQL** para persistencia
- **Migraciones automáticas**
- **Docker Compose** para orquestación

## ✨ Características

### 🎯 Funcionalidades Principales
- 🔐 **Autenticación segura** con JWT
- 🎬 **Catálogo de películas** con búsqueda y filtros
- 📅 **Gestión de horarios** de funciones
- 🪑 **Selección de asientos en tiempo real** con WebSockets
- 💳 **Simulación de pagos**
- 📱 **Diseño responsivo** para móviles y desktop
- ⭐ **Sistema de reseñas**

### 🌐 Tecnologías WebSocket
- **SignalR Hub** para comunicación en tiempo real
- **Selección simultánea** de asientos por múltiples usuarios
- **Feedback visual inmediato**
- **Reconexión automática**

## 🛠️ Desarrollo

### Ejecutar en modo desarrollo
```bash
# Backend
docker-compose up

# Frontend (desarrollo local)
cd services/Frontend/frontend-app
npm install
npm run dev
```

### Ver logs de servicios
```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f frontend
docker-compose logs -f bookings-api
```

### Reiniciar servicios
```bash
# Reiniciar todo
docker-compose restart

# Reiniciar servicio específico
docker-compose restart frontend
```

## 📱 Uso de la Aplicación

### Para Usuarios
1. **Navegar al catálogo** de películas
2. **Seleccionar una película** y horario
3. **Elegir asientos** en tiempo real
4. **Completar la reserva** con información personal
5. **Simular el pago**

### Para Administradores
- **Panel de administración** para gestión de películas
- **Configuración de horarios** y salas
- **Monitoreo de reservas** en tiempo real

## 🔧 Configuración

### Variables de Entorno
Las configuraciones están en `docker-compose.yml` y se configuran automáticamente.

### Base de Datos
La base de datos se inicializa automáticamente con datos de prueba.

## 🚨 Solución de Problemas

### Puerto ocupado
```bash
# Verificar puertos en uso
netstat -an | findstr :3000
netstat -an | findstr :5000
```

### Limpiar Docker
```bash
# Limpiar contenedores y volúmenes
docker-compose down -v
docker system prune -f
```

### Reconstruir contenedores
```bash
# Reconstruir todo
docker-compose build --no-cache
docker-compose up
```

## 📚 Documentación API

Una vez ejecutando, visita:
- **Swagger UI**: http://localhost:5000/swagger
- **Gateway Health**: http://localhost:5000/health

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Autores

- **Joel** - *Desarrollo Principal* - [JoelArg02](https://github.com/JoelArg02)

---

⭐ **¡Dale una estrella al proyecto si te ha sido útil!**
