# 🐳 Cinema API - Guía de Docker

Esta guía explica cómo usar Cinema API con Docker, incluyendo la configuración del sistema híbrido de Administradores y Clientes.

## 🚀 Métodos de Instalación

### 1. 🎬 Configuración Automática (Recomendado)

#### Windows:
```powershell
git clone https://github.com/JoelArg02/API-CINEMA.git
cd API-CINEMA
.\setup-cinema-docker.ps1
```

#### Linux/Mac:
```bash
git clone https://github.com/JoelArg02/API-CINEMA.git
cd API-CINEMA
chmod +x setup-cinema-docker.sh
./setup-cinema-docker.sh
```

#### Con Make (si está disponible):
```bash
make setup
```

### 2. 🔧 Configuración Manual

```bash
# 1. Variables de entorno
cp .env.example .env

# 2. Iniciar servicios
docker-compose up -d

# 3. Configurar administrador
.\setup-first-admin.ps1  # Windows
./setup-first-admin.sh   # Linux/Mac
```

### 3. 🛠️ Configuración de Desarrollo

```bash
# Usar docker-compose.dev.yml con configuraciones extendidas
docker-compose -f docker-compose.dev.yml up -d

# O con Make
make setup-dev
```

## 📋 Archivos Docker Disponibles

| Archivo | Propósito | Uso |
|---------|-----------|-----|
| `docker-compose.yml` | Configuración estándar | Desarrollo y testing |
| `docker-compose.dev.yml` | Configuración avanzada | Desarrollo con health checks |
| `.env.example` | Variables de entorno | Copiar a `.env` |

## 🌐 Puertos y Servicios

| Puerto | Servicio | Descripción |
|--------|----------|-------------|
| `3000` | Frontend | Portal web (clientes y admin) |
| `5000` | API Gateway | Punto de entrada principal |
| `5001` | Auth API | Servicio de autenticación |
| `5002` | Users API | Gestión de usuarios |
| `5003` | Movies API | Gestión de películas |
| `5004` | Catalog API | Catálogo público |
| `5005` | Bookings API | Sistema de reservas |
| `5006` | Reviews API | Sistema de reseñas |
| `5432` | PostgreSQL | Base de datos |
| `5672` | RabbitMQ | Message broker |
| `15672` | RabbitMQ UI | Interfaz de RabbitMQ |
| `5050` | PgAdmin | Administrador de BD |

## 🎭 Sistema de Usuarios

### 👨‍💼 Administradores
- **Registro**: Solo otros administradores pueden crear cuentas de admin
- **Acceso**: Panel completo de administración
- **Endpoints**: `/auth/register` (protegido), `/auth/register-first-admin` (una vez)

### 🎬 Clientes
- **Registro**: Público, disponible en el frontend
- **Acceso**: Cartelera y compra de boletos
- **Endpoint**: `/auth/register-client` (público)

## 🔐 Configuración de Seguridad

### Variables JWT (.env)
```env
JWT_SECRET=ClaveUltraSeguraYSecretaParaJWT2025CinemaAPI!
JWT_REFRESH_SECRET=OtroSecretoSuperLargoYSeguroParaRefresh2025!
JWT_EXPIRATION_MINUTES=180
JWT_REFRESH_EXPIRATION_DAYS=7
```

### Credenciales por Defecto
```
👨‍💼 ADMINISTRADOR:
   📧 Email: admin@cinema.com
   🔑 Contraseña: CinemaAdmin2025!

🎭 CLIENTE DE EJEMPLO:
   📧 Email: cliente@test.com
   🔑 Contraseña: Cliente123!
```

> ⚠️ **PRODUCCIÓN**: Cambiar todas las contraseñas y secretos antes de desplegar

## 🛠️ Comandos Útiles

### Gestión de Servicios
```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down

# Rebuild completo
docker-compose down --volumes
docker-compose build --no-cache
docker-compose up -d
```

### Con Makefile
```bash
make help          # Ver todos los comandos
make start          # Iniciar servicios
make stop           # Parar servicios
make logs           # Ver logs
make reset          # Reset completo
make credentials    # Ver credenciales
make urls           # Ver URLs
```

### Scripts de Utilidad
```bash
.\setup-cinema-docker.ps1      # Configuración completa
.\setup-first-admin.ps1        # Solo primer admin
.\reset-cinema-docker.ps1      # Reset completo
```

## 🔍 Troubleshooting

### Problemas Comunes

#### Puerto en uso
```bash
# Verificar puertos en uso
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Parar servicios conflictivos
docker-compose down
```

#### Base de datos no inicializa
```bash
# Limpiar volúmenes y reiniciar
docker-compose down --volumes
docker volume prune -f
docker-compose up -d
```

#### Servicios no están listos
```bash
# Verificar estado
docker-compose ps

# Ver logs específicos
docker-compose logs auth-api
docker-compose logs db
```

### Verificación de Salud
```bash
# Verificar APIs
curl http://localhost:5001/health  # Auth API
curl http://localhost:5000/health  # Gateway
curl http://localhost:3000         # Frontend

# Con Make
make health
```

## 📁 Estructura de Datos

### Volúmenes Persistentes
- `postgres_data`: Datos de PostgreSQL
- `rabbitmq_data`: Datos de RabbitMQ (si se configura)

### Archivos de Configuración
- `docker/postgres/init.sql`: Inicialización de BD
- `insert_initial_data.sql`: Datos iniciales del cinema
- `.env`: Variables de entorno locales

## 🔄 Flujo de Desarrollo

1. **Desarrollo inicial**:
   ```bash
   make setup
   ```

2. **Cambios en código**:
   ```bash
   make build
   make start
   ```

3. **Reset para testing**:
   ```bash
   make reset
   ```

4. **Verificación**:
   ```bash
   make status
   make health
   ```

## 🌍 Configuración de Producción

### Variables importantes para producción
```env
ASPNETCORE_ENVIRONMENT=Production
NODE_ENV=production
JWT_SECRET=<secret-ultra-seguro>
DB_PASSWORD=<password-segura>
RABBITMQ_USER=<usuario-seguro>
RABBITMQ_PASS=<password-segura>
```

### Consideraciones de seguridad
- Cambiar todas las contraseñas por defecto
- Usar secretos externos (Azure Key Vault, AWS Secrets, etc.)
- Configurar HTTPS en el reverse proxy
- Limitar acceso a puertos de administración
- Configurar backups automáticos de PostgreSQL

## 📞 Soporte

- **Logs**: `docker-compose logs -f`
- **Estado**: `make status`
- **URLs**: `make urls`
- **Credenciales**: `make credentials`
- **Reset**: `make reset`
