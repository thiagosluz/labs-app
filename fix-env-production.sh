#!/bin/bash

# Script para corrigir .env.production no servidor de produção
# Usage: ./fix-env-production.sh [SERVER_IP]

set -e

SERVER_IP=${1:-"10.5.254.70"}

echo "🔧 Corrigindo .env.production para IP: $SERVER_IP"

if [ ! -f "backend/.env.production" ]; then
    echo "❌ Arquivo backend/.env.production não encontrado!"
    exit 1
fi

# Backup do arquivo
cp backend/.env.production backend/.env.production.backup.$(date +%Y%m%d_%H%M%S)

# Atualizar APP_URL
sed -i "s|APP_URL=.*|APP_URL=http://${SERVER_IP}|g" backend/.env.production

# Atualizar SANCTUM_STATEFUL_DOMAINS
sed -i "s|SANCTUM_STATEFUL_DOMAINS=.*|SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1,${SERVER_IP}|g" backend/.env.production

# Comentar ou remover SESSION_DOMAIN
sed -i "s|^SESSION_DOMAIN=.*|# SESSION_DOMAIN removed for IP-based access|g" backend/.env.production

# Adicionar configurações de sessão para IPs se não existirem
if ! grep -q "SESSION_SECURE_COOKIE" backend/.env.production; then
    echo "" >> backend/.env.production
    echo "# Session configuration for IP-based access" >> backend/.env.production
    echo "SESSION_SECURE_COOKIE=false" >> backend/.env.production
    echo "SESSION_SAME_SITE=lax" >> backend/.env.production
fi

# Atualizar FRONTEND_URL
sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=http://${SERVER_IP}|g" backend/.env.production
if ! grep -q "FRONTEND_URL" backend/.env.production; then
    echo "" >> backend/.env.production
    echo "# Frontend URL (for public links and QR codes)" >> backend/.env.production
    echo "FRONTEND_URL=http://${SERVER_IP}" >> backend/.env.production
fi

# Criar storage symlink se não existir
echo "🔗 Verificando storage symlink..."
docker compose -f docker-compose.prod.yml exec backend php artisan storage:link || echo "⚠️  Storage link já existe"

# Limpar cache do Laravel
echo "🔄 Limpando cache do Laravel..."
docker compose -f docker-compose.prod.yml exec backend php artisan config:clear
docker compose -f docker-compose.prod.yml exec backend php artisan cache:clear
docker compose -f docker-compose.prod.yml exec backend php artisan config:cache

echo "✅ .env.production corrigido!"
echo "🔄 Reiniciando containers..."
docker compose -f docker-compose.prod.yml restart backend

echo ""
echo "📋 Próximos passos:"
echo "1. Regenerar QR codes para usar nova URL:"
echo "   docker compose -f docker-compose.prod.yml exec backend php artisan equipamentos:generate-qrcodes --force"

echo "✅ Correção concluída!"
echo ""
echo "Verifique se o login está funcionando agora."

