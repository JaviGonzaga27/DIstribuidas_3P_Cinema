# Makefile para Cinema API
# Sistema híbrido: Administradores + Clientes

.PHONY: help setup start stop clean reset logs admin-setup client-test build

# Configuración por defecto
COMPOSE_FILE = docker-compose.yml
COMPOSE_DEV_FILE = docker-compose.dev.yml

help: ## Mostrar ayuda
	@echo "🎬 Cinema API - Comandos Disponibles"
	@echo "===================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Configuración completa automática (recomendado)
	@echo "🚀 Iniciando configuración completa..."
	@powershell -ExecutionPolicy Bypass -File setup-cinema-docker.ps1

setup-dev: ## Configuración usando docker-compose.dev.yml
	@echo "🔧 Configuración de desarrollo..."
	@docker-compose -f $(COMPOSE_DEV_FILE) down --volumes
	@docker-compose -f $(COMPOSE_DEV_FILE) up -d
	@echo "⏳ Esperando servicios..."
	@timeout 30
	@powershell -ExecutionPolicy Bypass -File setup-first-admin.ps1

start: ## Iniciar todos los servicios
	@echo "▶️  Iniciando Cinema API..."
	@docker-compose up -d

start-dev: ## Iniciar servicios de desarrollo
	@echo "▶️  Iniciando Cinema API (desarrollo)..."
	@docker-compose -f $(COMPOSE_DEV_FILE) up -d

stop: ## Detener todos los servicios
	@echo "⏹️  Deteniendo Cinema API..."
	@docker-compose down
	@docker-compose -f $(COMPOSE_DEV_FILE) down

build: ## Reconstruir imágenes
	@echo "🔨 Reconstruyendo imágenes..."
	@docker-compose build --no-cache

build-dev: ## Reconstruir imágenes de desarrollo
	@echo "🔨 Reconstruyendo imágenes (desarrollo)..."
	@docker-compose -f $(COMPOSE_DEV_FILE) build --no-cache

clean: ## Limpiar contenedores e imágenes
	@echo "🧹 Limpiando contenedores..."
	@docker-compose down --rmi all --volumes --remove-orphans
	@docker-compose -f $(COMPOSE_DEV_FILE) down --rmi all --volumes --remove-orphans

reset: ## Reset completo del entorno
	@echo "🔄 Reset completo del entorno..."
	@powershell -ExecutionPolicy Bypass -File reset-cinema-docker.ps1

logs: ## Ver logs de todos los servicios
	@docker-compose logs -f

logs-auth: ## Ver logs del servicio de autenticación
	@docker-compose logs -f auth-api

logs-frontend: ## Ver logs del frontend
	@docker-compose logs -f frontend

admin-setup: ## Configurar solo el primer administrador
	@echo "👨‍💼 Configurando primer administrador..."
	@powershell -ExecutionPolicy Bypass -File setup-first-admin.ps1

client-test: ## Crear usuario cliente de prueba
	@echo "🎭 Creando cliente de prueba..."
	@curl -X POST http://localhost:5001/auth/register-client \
		-H "Content-Type: application/json" \
		-d '{"email":"test@cliente.com","password":"Test123!","name":"Test Cliente","fullName":"Usuario de Prueba","birthDate":"1990-01-01T00:00:00Z","phoneNumber":"+593-99-000-0000","address":"Dirección de prueba"}'

status: ## Verificar estado de servicios
	@echo "📊 Estado de servicios:"
	@docker-compose ps

health: ## Verificar salud de servicios
	@echo "🏥 Verificación de salud:"
	@echo "Auth API:" && curl -s http://localhost:5001/health || echo "❌ No disponible"
	@echo "API Gateway:" && curl -s http://localhost:5000/health || echo "❌ No disponible"
	@echo "Frontend:" && curl -s http://localhost:3000 > /dev/null && echo "✅ OK" || echo "❌ No disponible"

urls: ## Mostrar URLs importantes
	@echo "🌐 URLs del sistema:"
	@echo "📱 Frontend (Clientes): http://localhost:3000"
	@echo "👨‍💼 Panel Admin: http://localhost:3000/admin/login"
	@echo "🔗 API Gateway: http://localhost:5000"
	@echo "📊 RabbitMQ: http://localhost:15672"
	@echo "🗄️  PgAdmin: http://localhost:5050"

credentials: ## Mostrar credenciales por defecto
	@echo "👥 Credenciales por defecto:"
	@echo "👨‍💼 ADMINISTRADOR:"
	@echo "   📧 Email: admin@cinema.com"
	@echo "   🔑 Contraseña: CinemaAdmin2025!"
	@echo ""
	@echo "🎭 CLIENTE DE EJEMPLO:"
	@echo "   📧 Email: cliente@test.com"
	@echo "   🔑 Contraseña: Cliente123!"

# Comandos de desarrollo
dev-setup: setup-dev ## Alias para setup-dev
dev-start: start-dev ## Alias para start-dev
dev-build: build-dev ## Alias para build-dev

# Meta-comandos
quick-start: build start admin-setup ## Inicio rápido: build + start + admin
full-reset: clean build start admin-setup ## Reset completo y configuración
