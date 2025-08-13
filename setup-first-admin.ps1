# Script para configurar el primer administrador del sistema de cinema
# Ejecutar este script solo una vez, cuando el sistema esté ejecutándose y no tenga usuarios

$authUrl = "http://localhost:5001/auth/register-first-admin"  # Ajustar puerto según configuración

$adminData = @{
    email = "admin@cinema.com"
    password = "CinemaAdmin2025!"  # Nueva contraseña más segura
    name = "Administrator"
    fullName = "Administrador del Sistema"
    birthDate = "1990-01-01T00:00:00Z"
    phoneNumber = "+593-99-123-4567"
    address = "Oficina Principal - Cinema API"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

try {
    Write-Host "Creando primer administrador..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri $authUrl -Method POST -Body $adminData -Headers $headers
    
    if ($response.accessToken) {
        Write-Host "✓ Primer administrador creado exitosamente!" -ForegroundColor Green
        Write-Host "Email: admin@cinema.com" -ForegroundColor Cyan
        Write-Host "Contraseña: CinemaAdmin2025!" -ForegroundColor Cyan
        Write-Host "" -ForegroundColor White
        Write-Host "IMPORTANTE: Cambie la contraseña inmediatamente después del primer login." -ForegroundColor Red
        Write-Host "Token de acceso: $($response.accessToken)" -ForegroundColor Gray
    }
    else {
        Write-Host "✗ Error: No se recibió token de acceso" -ForegroundColor Red
    }
}
catch {
    Write-Host "✗ Error al crear administrador:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $responseContent = $_.Exception.Response.Content | ConvertFrom-Json
        Write-Host "Detalles: $responseContent" -ForegroundColor Red
    }
}
