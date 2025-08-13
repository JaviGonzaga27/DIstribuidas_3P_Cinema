# Script de configuración completa para Cinema API con Docker (Windows)
# Este script configura el sistema híbrido: Administradores + Clientes

Write-Host "🎬 Cinema API - Configuración Completa con Docker" -ForegroundColor Cyan
Write-Host "=================================================="

# Función para verificar si un puerto está abierto
function Wait-ForService {
    param(
        [string]$ServiceName,
        [int]$Port,
        [int]$MaxAttempts = 30
    )
    
    $attempt = 1
    Write-Host "⏳ Esperando que $ServiceName esté listo en puerto $Port..." -ForegroundColor Yellow
    
    while ($attempt -le $MaxAttempts) {
        try {
            $connection = New-Object System.Net.Sockets.TcpClient
            $connection.Connect("localhost", $Port)
            $connection.Close()
            Write-Host "✅ $ServiceName está listo" -ForegroundColor Green
            return
        }
        catch {
            Write-Host "   Intento $attempt/$MaxAttempts..." -ForegroundColor Gray
            Start-Sleep -Seconds 5
            $attempt++
        }
    }
    
    Write-Host "❌ Timeout esperando $ServiceName" -ForegroundColor Red
    exit 1
}

# Función para hacer peticiones HTTP con reintentos
function Invoke-RequestWithRetry {
    param(
        [string]$Url,
        [string]$Data,
        [int]$MaxAttempts = 5
    )
    
    $attempt = 1
    
    while ($attempt -le $MaxAttempts) {
        Write-Host "   Intento $attempt/$MaxAttempts para $Url" -ForegroundColor Gray
        
        try {
            $headers = @{
                "Content-Type" = "application/json"
            }
            
            $response = Invoke-RestMethod -Uri $Url -Method POST -Body $Data -Headers $headers -ErrorAction Stop
            Write-Host "✅ Petición exitosa" -ForegroundColor Green
            return $true
        }
        catch {
            Write-Host "   Falló, reintentando en 5 segundos..." -ForegroundColor Gray
            Start-Sleep -Seconds 5
            $attempt++
        }
    }
    
    Write-Host "❌ Falló después de $MaxAttempts intentos" -ForegroundColor Red
    return $false
}

Write-Host "🐳 Paso 1: Iniciando servicios Docker..." -ForegroundColor Cyan
docker-compose down --volumes
docker-compose up -d

Write-Host "⏳ Paso 2: Esperando que los servicios estén listos..." -ForegroundColor Yellow
Wait-ForService "PostgreSQL" 5432
Wait-ForService "RabbitMQ" 5672
Wait-ForService "Auth API" 5001
Wait-ForService "Users API" 5002
Wait-ForService "API Gateway" 5000

# Esperar adicional para que las migraciones terminen
Write-Host "⏳ Esperando que las migraciones de base de datos terminen..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

Write-Host "👨‍💼 Paso 3: Configurando primer administrador..." -ForegroundColor Cyan

$adminData = @{
    email = "admin@cinema.com"
    password = "CinemaAdmin2025!"
    name = "Administrator"
    fullName = "Administrador del Sistema"
    birthDate = "1990-01-01T00:00:00Z"
    phoneNumber = "+593-99-123-4567"
    address = "Oficina Principal - Cinema API"
} | ConvertTo-Json

if (Invoke-RequestWithRetry "http://localhost:5001/auth/register-first-admin" $adminData) {
    Write-Host "✅ Primer administrador creado exitosamente" -ForegroundColor Green
    Write-Host "   📧 Email: admin@cinema.com" -ForegroundColor White
    Write-Host "   🔑 Contraseña: CinemaAdmin2025!" -ForegroundColor White
}
else {
    Write-Host "⚠️  Primer administrador ya existe o error en creación" -ForegroundColor Yellow
}

Write-Host "🎭 Paso 4: Creando usuario cliente de ejemplo..." -ForegroundColor Cyan

$clientData = @{
    email = "cliente@test.com"
    password = "Cliente123!"
    name = "Juan Cliente"
    fullName = "Juan Pérez Cliente"
    birthDate = "1985-06-15T00:00:00Z"
    phoneNumber = "+593-99-987-6543"
    address = "Av. Principal 123, Quito"
} | ConvertTo-Json

if (Invoke-RequestWithRetry "http://localhost:5001/auth/register-client" $clientData) {
    Write-Host "✅ Usuario cliente de ejemplo creado" -ForegroundColor Green
    Write-Host "   📧 Email: cliente@test.com" -ForegroundColor White
    Write-Host "   🔑 Contraseña: Cliente123!" -ForegroundColor White
}
else {
    Write-Host "⚠️  Usuario cliente ya existe o error en creación" -ForegroundColor Yellow
}

Write-Host "🎬 Paso 5: Configurando datos iniciales del cinema..." -ForegroundColor Cyan
Write-Host "   Ejecutando insert_initial_data.sql..." -ForegroundColor Gray

try {
    # Ejecutar script SQL de datos iniciales
    $sqlPath = (Get-Location).Path + "\insert_initial_data.sql"
    docker exec apicinema-db psql -U postgres -d bookings -f /insert_initial_data.sql
    Write-Host "✅ Datos iniciales del cinema configurados" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Los datos iniciales ya existen o error en inserción" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 ¡Configuración completada!" -ForegroundColor Green
Write-Host "=========================="
Write-Host ""
Write-Host "🌐 URLs del sistema:" -ForegroundColor Cyan
Write-Host "   📱 Frontend (Clientes): http://localhost:3000" -ForegroundColor White
Write-Host "   👨‍💼 Admin Panel: http://localhost:3000/admin/login" -ForegroundColor White
Write-Host "   🔗 API Gateway: http://localhost:5000" -ForegroundColor White
Write-Host "   📊 RabbitMQ Management: http://localhost:15672" -ForegroundColor White
Write-Host "   🗄️  PgAdmin: http://localhost:5050" -ForegroundColor White
Write-Host ""
Write-Host "👥 Usuarios configurados:" -ForegroundColor Cyan
Write-Host "   👨‍💼 ADMINISTRADOR:" -ForegroundColor Yellow
Write-Host "      📧 Email: admin@cinema.com" -ForegroundColor White
Write-Host "      🔑 Contraseña: CinemaAdmin2025!" -ForegroundColor White
Write-Host "      🎯 Acceso: Panel completo de administración" -ForegroundColor White
Write-Host ""
Write-Host "   🎭 CLIENTE DE EJEMPLO:" -ForegroundColor Yellow
Write-Host "      📧 Email: cliente@test.com" -ForegroundColor White
Write-Host "      🔑 Contraseña: Cliente123!" -ForegroundColor White
Write-Host "      🎯 Acceso: Cartelera y compra de boletos" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Seguridad:" -ForegroundColor Cyan
Write-Host "   ✅ Solo administradores pueden crear otros administradores" -ForegroundColor Green
Write-Host "   ✅ Clientes pueden registrarse libremente en el frontend" -ForegroundColor Green
Write-Host "   ✅ Separación completa de roles y permisos" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Accede al panel de admin para gestionar películas y horarios" -ForegroundColor White
Write-Host "   2. Los clientes pueden registrarse en http://localhost:3000/auth/register" -ForegroundColor White
Write-Host "   3. Cambia las contraseñas por defecto inmediatamente" -ForegroundColor White
Write-Host ""
Write-Host "🚀 ¡El sistema está listo para usar!" -ForegroundColor Green
