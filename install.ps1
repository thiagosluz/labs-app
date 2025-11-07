# Script de Instalação - Parque Tecnológico IFG (Windows PowerShell)

Write-Host "🚀 Instalando Sistema de Gerenciamento do Parque Tecnológico - IFG" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green
Write-Host ""

# Verificar se Docker está instalado
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker não encontrado. Por favor, instale o Docker Desktop primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se Docker Compose está instalado
if (-not (Get-Command docker compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose não encontrado. Por favor, instale o Docker Compose primeiro." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker encontrado" -ForegroundColor Green
Write-Host "✅ Docker Compose encontrado" -ForegroundColor Green
Write-Host ""

# Criar arquivo .env do backend se não existir
if (-not (Test-Path "backend/.env")) {
    Write-Host "📝 Criando arquivo .env do backend..." -ForegroundColor Yellow
    Copy-Item "backend/.env.example" "backend/.env"
    Write-Host "✅ Arquivo .env do backend criado" -ForegroundColor Green
}

# Criar arquivo .env.local do frontend se não existir
if (-not (Test-Path "frontend/.env.local")) {
    Write-Host "📝 Criando arquivo .env.local do frontend..." -ForegroundColor Yellow
    Copy-Item "frontend/.env.example" "frontend/.env.local"
    Write-Host "✅ Arquivo .env.local do frontend criado" -ForegroundColor Green
}

Write-Host ""
Write-Host "🐳 Iniciando containers Docker..." -ForegroundColor Yellow
docker compose up -d

Write-Host ""
Write-Host "⏳ Aguardando containers iniciarem..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "📦 Instalando dependências do backend..." -ForegroundColor Yellow
docker compose exec backend composer install

Write-Host ""
Write-Host "🔑 Gerando chave da aplicação Laravel..." -ForegroundColor Yellow
docker compose exec backend php artisan key:generate

Write-Host ""
Write-Host "🗄️  Executando migrations e seeders..." -ForegroundColor Yellow
docker compose exec backend php artisan migrate --seed

Write-Host ""
Write-Host "📦 Instalando dependências do frontend..." -ForegroundColor Yellow
docker compose exec frontend npm install

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Green
Write-Host "✅ Instalação concluída com sucesso!" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Acesse o sistema em: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "👤 Credenciais de teste:" -ForegroundColor Yellow
Write-Host "   Admin:        admin@ifg.edu.br / password" -ForegroundColor White
Write-Host "   Técnico:      tecnico@ifg.edu.br / password" -ForegroundColor White
Write-Host "   Visualizador: professor@ifg.edu.br / password" -ForegroundColor White
Write-Host ""
Write-Host "📚 Para mais informações, consulte o README.md" -ForegroundColor Cyan
Write-Host ""

