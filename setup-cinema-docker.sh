#!/bin/bash

# Script de configuración completa para Cinema API con Docker
# Este script configura el sistema híbrido: Administradores + Clientes

echo "🎬 Cinema API - Configuración Completa con Docker"
echo "=================================================="

# Función para verificar si un contenedor está listo
wait_for_service() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Esperando que $service_name esté listo en puerto $port..."
    
    while ! nc -z localhost $port; do
        if [ $attempt -eq $max_attempts ]; then
            echo "❌ Timeout esperando $service_name"
            exit 1
        fi
        echo "   Intento $attempt/$max_attempts..."
        sleep 5
        ((attempt++))
    done
    
    echo "✅ $service_name está listo"
}

# Función para hacer peticiones HTTP con reintentos
make_request() {
    local url=$1
    local data=$2
    local max_attempts=5
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "   Intento $attempt/$max_attempts para $url"
        
        if curl -s -X POST "$url" \
             -H "Content-Type: application/json" \
             -d "$data" > /dev/null 2>&1; then
            echo "✅ Petición exitosa"
            return 0
        fi
        
        echo "   Falló, reintentando en 5 segundos..."
        sleep 5
        ((attempt++))
    done
    
    echo "❌ Falló después de $max_attempts intentos"
    return 1
}

echo "🐳 Paso 1: Iniciando servicios Docker..."
docker-compose down --volumes
docker-compose up -d

echo "⏳ Paso 2: Esperando que los servicios estén listos..."
wait_for_service "PostgreSQL" 5432
wait_for_service "RabbitMQ" 5672
wait_for_service "Auth API" 5001
wait_for_service "Users API" 5002
wait_for_service "API Gateway" 5000

# Esperar adicional para que las migraciones terminen
echo "⏳ Esperando que las migraciones de base de datos terminen..."
sleep 20

echo "👨‍💼 Paso 3: Configurando primer administrador..."

ADMIN_DATA='{
    "email": "admin@cinema.com",
    "password": "CinemaAdmin2025!",
    "name": "Administrator",
    "fullName": "Administrador del Sistema",
    "birthDate": "1990-01-01T00:00:00Z",
    "phoneNumber": "+593-99-123-4567",
    "address": "Oficina Principal - Cinema API"
}'

if make_request "http://localhost:5001/auth/register-first-admin" "$ADMIN_DATA"; then
    echo "✅ Primer administrador creado exitosamente"
    echo "   📧 Email: admin@cinema.com"
    echo "   🔑 Contraseña: CinemaAdmin2025!"
else
    echo "⚠️  Primer administrador ya existe o error en creación"
fi

echo "🎭 Paso 4: Creando usuario cliente de ejemplo..."

CLIENT_DATA='{
    "email": "cliente@test.com",
    "password": "Cliente123!",
    "name": "Juan Cliente",
    "fullName": "Juan Pérez Cliente",
    "birthDate": "1985-06-15T00:00:00Z",
    "phoneNumber": "+593-99-987-6543",
    "address": "Av. Principal 123, Quito"
}'

if make_request "http://localhost:5001/auth/register-client" "$CLIENT_DATA"; then
    echo "✅ Usuario cliente de ejemplo creado"
    echo "   📧 Email: cliente@test.com"
    echo "   🔑 Contraseña: Cliente123!"
else
    echo "⚠️  Usuario cliente ya existe o error en creación"
fi

echo "🎬 Paso 5: Configurando datos iniciales del cinema..."

# Ejecutar script SQL de datos iniciales
echo "   Ejecutando insert_initial_data.sql..."
if docker exec apicinema-db psql -U postgres -d bookings -f /docker-entrypoint-initdb.d/../../../insert_initial_data.sql > /dev/null 2>&1; then
    echo "✅ Datos iniciales del cinema configurados"
else
    echo "⚠️  Los datos iniciales ya existen o error en inserción"
fi

echo ""
echo "🎉 ¡Configuración completada!"
echo "=========================="
echo ""
echo "🌐 URLs del sistema:"
echo "   📱 Frontend (Clientes): http://localhost:3000"
echo "   👨‍💼 Admin Panel: http://localhost:3000/admin/login"
echo "   🔗 API Gateway: http://localhost:5000"
echo "   📊 RabbitMQ Management: http://localhost:15672"
echo "   🗄️  PgAdmin: http://localhost:5050"
echo ""
echo "👥 Usuarios configurados:"
echo "   👨‍💼 ADMINISTRADOR:"
echo "      📧 Email: admin@cinema.com"
echo "      🔑 Contraseña: CinemaAdmin2025!"
echo "      🎯 Acceso: Panel completo de administración"
echo ""
echo "   🎭 CLIENTE DE EJEMPLO:"
echo "      📧 Email: cliente@test.com" 
echo "      🔑 Contraseña: Cliente123!"
echo "      🎯 Acceso: Cartelera y compra de boletos"
echo ""
echo "🔐 Seguridad:"
echo "   ✅ Solo administradores pueden crear otros administradores"
echo "   ✅ Clientes pueden registrarse libremente en el frontend"
echo "   ✅ Separación completa de roles y permisos"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Accede al panel de admin para gestionar películas y horarios"
echo "   2. Los clientes pueden registrarse en http://localhost:3000/auth/register"
echo "   3. Cambia las contraseñas por defecto inmediatamente"
echo ""
echo "🚀 ¡El sistema está listo para usar!"
