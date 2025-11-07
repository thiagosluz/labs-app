#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Iniciando deploy em ambiente de produção local...${NC}"

# Definir IP de produção (argumento ou padrão)
PRODUCTION_IP=${1:-"192.168.1.100"} # Padrão: 192.168.1.100

echo -e "${YELLOW}Configurando IP de produção: ${PRODUCTION_IP}${NC}"

# 1. Verificar pré-requisitos
echo -e "${YELLOW}Verificando pré-requisitos (Docker e Docker Compose)...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não encontrado. Por favor, instale o Docker.${NC}"
    exit 1
fi
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose (v2) não encontrado. Por favor, instale o Docker Compose.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker e Docker Compose encontrados.${NC}"

# 2. Criar arquivos .env.production a partir dos templates
echo -e "${YELLOW}Configurando arquivos .env.production...${NC}"

if [ ! -f "backend/.env.production" ]; then
    echo -e "${YELLOW}📝 Criando backend/.env.production...${NC}"
    if [ -f "backend/.env.production.template" ]; then
        cp backend/.env.production.template backend/.env.production
        # Substituir IP no arquivo
        sed -i "s|192.168.1.100|${PRODUCTION_IP}|g" backend/.env.production
    else
        # Criar arquivo .env.production diretamente
        cat > backend/.env.production << EOF
APP_NAME="LabApp Production"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://${PRODUCTION_IP}
FRONTEND_URL=http://${PRODUCTION_IP}

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=pgsql
DB_HOST=postgres-prod
DB_PORT=5432
DB_DATABASE=labs_app
DB_USERNAME=labs_user
DB_PASSWORD=labs_password

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null
SESSION_SAME_SITE=none
SESSION_SECURE_COOKIE=false

MAIL_MAILER=log
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="\${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

SANCTUM_STATEFUL_DOMAINS=${PRODUCTION_IP},${PRODUCTION_IP}:80
CORS_ALLOWED_ORIGINS=http://${PRODUCTION_IP}
EOF
    fi
    echo -e "${GREEN}✅ Arquivo backend/.env.production criado${NC}"
else
    echo -e "${GREEN}✅ backend/.env.production já existe${NC}"
    # Atualizar IP no arquivo existente
    sed -i "s|APP_URL=http://[0-9.]*|APP_URL=http://${PRODUCTION_IP}|g" backend/.env.production
    sed -i "s|FRONTEND_URL=http://[0-9.]*|FRONTEND_URL=http://${PRODUCTION_IP}|g" backend/.env.production
    # Garantir que configurações de sessão estão presentes
    if ! grep -q "SESSION_SAME_SITE" backend/.env.production; then
        echo "" >> backend/.env.production
        echo "SESSION_SAME_SITE=none" >> backend/.env.production
        echo "SESSION_SECURE_COOKIE=false" >> backend/.env.production
        echo "SESSION_DOMAIN=null" >> backend/.env.production
    fi
fi

if [ ! -f "frontend/.env.production" ]; then
    echo -e "${YELLOW}📝 Criando frontend/.env.production...${NC}"
    if [ -f "frontend/.env.production.template" ]; then
        cp frontend/.env.production.template frontend/.env.production
        # Substituir IP no arquivo
        sed -i "s|192.168.1.100|${PRODUCTION_IP}|g" frontend/.env.production
    else
        # Criar arquivo .env.production diretamente
        cat > frontend/.env.production << EOF
NEXT_PUBLIC_API_URL=http://${PRODUCTION_IP}/api/v1
NEXT_PUBLIC_FRONTEND_URL=http://${PRODUCTION_IP}
EOF
    fi
    echo -e "${GREEN}✅ Arquivo frontend/.env.production criado${NC}"
else
    echo -e "${GREEN}✅ frontend/.env.production já existe${NC}"
    # Atualizar IP no arquivo existente
    sed -i "s|NEXT_PUBLIC_API_URL=http://[0-9.]*/api/v1|NEXT_PUBLIC_API_URL=http://${PRODUCTION_IP}/api/v1|g" frontend/.env.production
    sed -i "s|NEXT_PUBLIC_FRONTEND_URL=http://[0-9.]*|NEXT_PUBLIC_FRONTEND_URL=http://${PRODUCTION_IP}|g" frontend/.env.production
fi

# 3. Atualizar configuração do Nginx
echo -e "${YELLOW}Configurando Nginx...${NC}"
if [ -f "nginx/production.conf" ]; then
    sed -i "s|server_name 192.168.1.100;|server_name ${PRODUCTION_IP};|g" nginx/production.conf
    echo -e "${GREEN}✅ nginx/production.conf atualizado com o IP de produção.${NC}"
else
    echo -e "${RED}❌ Arquivo nginx/production.conf não encontrado.${NC}"
    exit 1
fi

# 4. Construir imagens Docker
echo -e "${YELLOW}Construindo imagens Docker para produção...${NC}"
docker compose -f docker-compose.prod.yml build --no-cache
echo -e "${GREEN}✅ Imagens Docker construídas.${NC}"

# 5. Instalar dependências do backend (fora do container de serviço)
echo -e "${YELLOW}Instalando dependências do backend...${NC}"
docker compose -f docker-compose.prod.yml run --rm backend-prod composer install --no-dev --optimize-autoloader
echo -e "${GREEN}✅ Dependências do backend instaladas.${NC}"

# 6. Instalar dependências do frontend e fazer build de produção
echo -e "${YELLOW}Instalando dependências do frontend e fazendo build de produção...${NC}"
docker compose -f docker-compose.prod.yml run --rm frontend-prod npm ci
docker compose -f docker-compose.prod.yml run --rm frontend-prod npm run build
echo -e "${GREEN}✅ Build de produção do frontend concluído.${NC}"

# 7. Iniciar containers
echo -e "${YELLOW}Iniciando containers Docker em modo de produção...${NC}"
docker compose -f docker-compose.prod.yml up -d
echo -e "${GREEN}✅ Containers iniciados.${NC}"

# 8. Aguardar serviços ficarem saudáveis
echo -e "${YELLOW}⏳ Aguardando serviços ficarem saudáveis...${NC}"
docker compose -f docker-compose.prod.yml ps
sleep 10 # Pequeno delay inicial
docker compose -f docker-compose.prod.yml ps --filter "status=healthy" | grep -q "postgres-prod" || { echo -e "${RED}❌ PostgreSQL não está saudável.${NC}"; exit 1; }
docker compose -f docker-compose.prod.yml ps --filter "status=healthy" | grep -q "backend-prod" || { echo -e "${RED}❌ Backend não está saudável.${NC}"; exit 1; }
docker compose -f docker-compose.prod.yml ps --filter "status=healthy" | grep -q "frontend-prod" || { echo -e "${RED}❌ Frontend não está saudável.${NC}"; exit 1; }
docker compose -f docker-compose.prod.yml ps --filter "status=healthy" | grep -q "nginx-prod" || { echo -e "${RED}❌ Nginx não está saudável.${NC}"; exit 1; }
echo -e "${GREEN}✅ Todos os serviços estão saudáveis.${NC}"

# 9. Executar migrations e seeders (se for a primeira vez ou forçar)
echo -e "${YELLOW}Executando migrations e seeders do backend...${NC}"
docker compose -f docker-compose.prod.yml exec backend-prod php artisan migrate --force --seed
echo -e "${GREEN}✅ Migrations e seeders executados.${NC}"

# 10. Criar symlink do storage
echo -e "${YELLOW}Criando symlink do storage...${NC}"
docker compose -f docker-compose.prod.yml exec backend-prod php artisan storage:link
echo -e "${GREEN}✅ Symlink do storage criado.${NC}"

echo -e "${GREEN}==================================================================${NC}"
echo -e "${GREEN}🎉 Deploy de produção concluído com sucesso!${NC}"
echo -e "${GREEN}==================================================================${NC}"
echo -e "${GREEN}🌐 Acesse o sistema em: http://${PRODUCTION_IP}${NC}"
echo -e "${GREEN}👤 Credenciais de teste (se seeders foram executados):${NC}"
echo -e "${GREEN}   Admin:        admin@ifg.edu.br / password${NC}"
echo -e "${GREEN}   Técnico:      tecnico@ifg.edu.br / password${NC}"
echo -e "${GREEN}   Visualizador: professor@ifg.edu.br / password${NC}"
echo -e "${GREEN}==================================================================${NC}"

