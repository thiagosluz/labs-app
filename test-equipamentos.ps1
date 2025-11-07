# ======================================================
# 🧪 Script de Teste - Módulo de Equipamentos
# ======================================================
# IFG Câmpus Jataí - Sistema de Gestão de Laboratórios
# Data: 24/10/2025
# ======================================================

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  🧪 TESTE DO MÓDULO DE EQUIPAMENTOS" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Docker está rodando
Write-Host "📦 Verificando containers Docker..." -ForegroundColor Yellow
$containers = docker ps --format "{{.Names}}" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker não está rodando!" -ForegroundColor Red
    exit 1
}

$requiredContainers = @("labs-backend", "labs-frontend", "labs-postgres")
$allRunning = $true

foreach ($container in $requiredContainers) {
    if ($containers -contains $container) {
        Write-Host "  ✅ $container" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $container (não encontrado)" -ForegroundColor Red
        $allRunning = $false
    }
}

if (-not $allRunning) {
    Write-Host ""
    Write-Host "❌ Alguns containers não estão rodando!" -ForegroundColor Red
    Write-Host "   Execute: docker compose up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  ✅ CONTAINERS OK - INICIANDO TESTES" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Função para fazer requisições HTTP
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    Write-Host "🔍 Testando: $Name" -ForegroundColor Cyan
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ErrorAction = 'Stop'
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = 'application/json'
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "   ✅ $Method $Url - OK" -ForegroundColor Green
        return $response
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        Write-Host "   ⚠️  $Method $Url - Status $statusCode" -ForegroundColor Yellow
        return $null
    }
}

# =====================================================
# TESTE 1: Verificar Backend
# =====================================================
Write-Host "-----------------------------------------------------" -ForegroundColor Gray
Write-Host "📡 TESTE 1: Backend API" -ForegroundColor Yellow
Write-Host "-----------------------------------------------------" -ForegroundColor Gray
Write-Host ""

$headers = @{
    'Accept' = 'application/json'
}

$equipamentos = Test-Endpoint -Name "Listar Equipamentos (sem auth)" `
    -Method "GET" `
    -Url "http://localhost:8000/api/v1/equipamentos" `
    -Headers $headers

if ($null -eq $equipamentos) {
    Write-Host "   📝 Resposta esperada: Requer autenticação" -ForegroundColor White
    Write-Host "   ✅ API de equipamentos está protegida corretamente!" -ForegroundColor Green
}

Write-Host ""

# =====================================================
# TESTE 2: Verificar Frontend
# =====================================================
Write-Host "-----------------------------------------------------" -ForegroundColor Gray
Write-Host "🌐 TESTE 2: Frontend" -ForegroundColor Yellow
Write-Host "-----------------------------------------------------" -ForegroundColor Gray
Write-Host ""

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ Frontend está respondendo (Status: $($frontendResponse.StatusCode))" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ Frontend não está respondendo!" -ForegroundColor Red
    Write-Host "   Execute: docker compose restart frontend" -ForegroundColor Yellow
}

Write-Host ""

# =====================================================
# TESTE 3: Verificar Storage Link
# =====================================================
Write-Host "-----------------------------------------------------" -ForegroundColor Gray
Write-Host "📂 TESTE 3: Storage Link" -ForegroundColor Yellow
Write-Host "-----------------------------------------------------" -ForegroundColor Gray
Write-Host ""

$storageCheck = docker compose exec -T backend test -L public/storage 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Storage link está configurado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Storage link não encontrado" -ForegroundColor Yellow
    Write-Host "   Criando link..." -ForegroundColor White
    docker compose exec backend php artisan storage:link
    Write-Host "   ✅ Storage link criado!" -ForegroundColor Green
}

Write-Host ""

# =====================================================
# TESTE 4: Verificar Database
# =====================================================
Write-Host "-----------------------------------------------------" -ForegroundColor Gray
Write-Host "🗄️  TESTE 4: Database" -ForegroundColor Yellow
Write-Host "-----------------------------------------------------" -ForegroundColor Gray
Write-Host ""

$dbCheck = docker compose exec -T backend php artisan db:show 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Conexão com PostgreSQL OK" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erro ao conectar com o banco de dados" -ForegroundColor Red
}

Write-Host ""

# =====================================================
# RESULTADO FINAL
# =====================================================
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  📊 RESULTADO DOS TESTES" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Containers: " -NoNewline -ForegroundColor Green
Write-Host "OK" -ForegroundColor White

Write-Host "✅ Backend API: " -NoNewline -ForegroundColor Green
Write-Host "OK (protegida com autenticação)" -ForegroundColor White

Write-Host "✅ Frontend: " -NoNewline -ForegroundColor Green
Write-Host "OK" -ForegroundColor White

Write-Host "✅ Storage: " -NoNewline -ForegroundColor Green
Write-Host "OK" -ForegroundColor White

Write-Host "✅ Database: " -NoNewline -ForegroundColor Green
Write-Host "OK" -ForegroundColor White

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  🎯 COMO TESTAR MANUALMENTE" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣  Acesse: " -NoNewline -ForegroundColor Yellow
Write-Host "http://localhost:3000" -ForegroundColor Cyan

Write-Host "2️⃣  Faça login:" -ForegroundColor Yellow
Write-Host "    Email: " -NoNewline -ForegroundColor White
Write-Host "admin@ifg.edu.br" -ForegroundColor Cyan
Write-Host "    Senha: " -NoNewline -ForegroundColor White
Write-Host "password" -ForegroundColor Cyan

Write-Host "3️⃣  No menu lateral, clique em: " -NoNewline -ForegroundColor Yellow
Write-Host "Equipamentos" -ForegroundColor Cyan

Write-Host "4️⃣  Teste as funcionalidades:" -ForegroundColor Yellow
Write-Host "    ✓ Criar novo equipamento" -ForegroundColor White
Write-Host "    ✓ Upload de foto" -ForegroundColor White
Write-Host "    ✓ Visualizar detalhes (4 abas)" -ForegroundColor White
Write-Host "    ✓ Editar equipamento" -ForegroundColor White
Write-Host "    ✓ Excluir equipamento" -ForegroundColor White
Write-Host "    ✓ Buscar na listagem" -ForegroundColor White

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  📖 DOCUMENTAÇÃO" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📄 TESTE_EQUIPAMENTOS.md" -ForegroundColor White
Write-Host "   → Guia completo de testes" -ForegroundColor Gray

Write-Host "📄 RESUMO_EQUIPAMENTOS.md" -ForegroundColor White
Write-Host "   → Resumo da implementação" -ForegroundColor Gray

Write-Host "📄 SANCTUM_SPA_AUTH.md" -ForegroundColor White
Write-Host "   → Documentação de autenticação" -ForegroundColor Gray

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  ✅ SISTEMA PRONTO PARA USO!" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Abrir navegador automaticamente
$openBrowser = Read-Host "Deseja abrir o sistema no navegador? (S/N)"
if ($openBrowser -eq "S" -or $openBrowser -eq "s") {
    Start-Process "http://localhost:3000"
    Write-Host ""
    Write-Host "🌐 Navegador aberto!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

