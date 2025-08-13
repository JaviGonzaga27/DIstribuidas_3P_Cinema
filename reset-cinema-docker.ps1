# Script para limpiar y resetear el entorno de Cinema API

Write-Host "🧹 Cinema API - Limpieza y Reset del Entorno" -ForegroundColor Cyan
Write-Host "============================================="

Write-Host "⚠️  ADVERTENCIA: Esto eliminará todos los datos y contenedores" -ForegroundColor Yellow
Write-Host "   - Todos los usuarios registrados" -ForegroundColor Yellow
Write-Host "   - Todas las reservas y datos del cinema" -ForegroundColor Yellow
Write-Host "   - Todas las imágenes y volúmenes de Docker" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "¿Estás seguro de que quieres continuar? (escriba 'SI' para confirmar)"

if ($confirmation -ne "SI") {
    Write-Host "❌ Operación cancelada" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🛑 Paso 1: Deteniendo todos los contenedores..." -ForegroundColor Yellow
docker-compose down

Write-Host "🗑️  Paso 2: Eliminando volúmenes de datos..." -ForegroundColor Yellow
docker volume rm cinema_postgres_data 2>$null
docker volume rm apicinema_postgres_data 2>$null
docker volume prune -f

Write-Host "🧹 Paso 3: Limpiando imágenes no utilizadas..." -ForegroundColor Yellow
docker image prune -f

Write-Host "🔨 Paso 4: Eliminando imágenes del proyecto..." -ForegroundColor Yellow
docker images | Select-String "apicinema" | ForEach-Object {
    $imageId = ($_ -split '\s+')[2]
    docker rmi $imageId -f 2>$null
}

Write-Host "🌐 Paso 5: Limpiando redes..." -ForegroundColor Yellow
docker network prune -f

Write-Host "🔄 Paso 6: Reconstruyendo servicios..." -ForegroundColor Yellow
docker-compose build --no-cache

Write-Host ""
Write-Host "✅ Limpieza completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Ejecutar: docker-compose up -d" -ForegroundColor White
Write-Host "   2. Ejecutar: .\setup-cinema-docker.ps1" -ForegroundColor White
Write-Host "   3. O ejecutar: .\setup-first-admin.ps1 (solo para admin)" -ForegroundColor White
Write-Host ""
Write-Host "🚀 El entorno está listo para una configuración limpia" -ForegroundColor Green
