#!/bin/bash

# Script para verificar logs do agente em tempo real
# Usage: ./check-agent-logs.sh

echo "🔍 Verificando logs do agente..."
echo ""

echo "📋 1. Últimas 50 linhas do log (filtrado para Agent):"
echo "=========================================="
docker compose -f docker-compose.prod.yml exec backend tail -n 50 storage/logs/laravel.log | grep -E "Agent|agent|sync-equipamento|sync-softwares|INÍCIO|ERROR|Exception" || echo "Nenhum log encontrado"
echo ""

echo "📋 2. Últimas 20 linhas completas do log:"
echo "=========================================="
docker compose -f docker-compose.prod.yml exec backend tail -n 20 storage/logs/laravel.log
echo ""

echo "📋 3. Verificando se o endpoint test funciona:"
echo "=========================================="
echo "Execute no terminal:"
echo "curl -X GET http://10.5.254.70/api/v1/agent/test -H 'X-Agent-API-Key: SUA_CHAVE'"
echo ""

echo "📋 4. Verificando se middleware está sendo executado:"
echo "=========================================="
docker compose -f docker-compose.prod.yml exec backend tail -n 100 storage/logs/laravel.log | grep -E "Agent middleware" || echo "Middleware não está logando - possível problema na configuração"
echo ""

echo "✅ Verificação concluída!"
echo ""
echo "Se não houver logs, o problema pode ser:"
echo "1. Container não foi reconstruído"
echo "2. Logs estão sendo escritos em outro lugar"
echo "3. Erro está acontecendo antes do Laravel"

