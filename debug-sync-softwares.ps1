# Script PowerShell para debugar o erro de sync-softwares
# Usage: .\debug-sync-softwares.ps1

param(
    [string]$ServerIP = "10.5.254.70"
)

Write-Host "🔍 Diagnosticando erro de sync-softwares..." -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 1. Testando endpoint diretamente:" -ForegroundColor Yellow
Write-Host "=========================================="
$testPayload = @{
    softwares = @(
        @{
            nome = "Teste Debug"
            versao = "1.0"
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "http://${ServerIP}/api/v1/agent/sync-softwares" `
        -Method POST `
        -ContentType "application/json" `
        -Body $testPayload `
        -ErrorAction Stop
    Write-Host "✅ Endpoint respondeu com sucesso!" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ Erro ao testar endpoint:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Resposta do servidor:" -ForegroundColor Yellow
        Write-Host $responseBody
    }
}
Write-Host ""

Write-Host "📋 2. Testando com curl (se disponível):" -ForegroundColor Yellow
Write-Host "=========================================="
$curlTest = @"
curl -X POST http://${ServerIP}/api/v1/agent/sync-softwares \
  -H "Content-Type: application/json" \
  -d '{"softwares":[{"nome":"Teste","versao":"1.0"}]}'
"@
Write-Host $curlTest
Write-Host ""

Write-Host "✅ Diagnóstico concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "Para ver os logs do servidor, execute no servidor Ubuntu:" -ForegroundColor Cyan
Write-Host "docker compose -f docker-compose.prod.yml exec backend tail -n 100 storage/logs/laravel.log" -ForegroundColor Yellow

