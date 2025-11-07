#!/bin/bash

echo "🚀 Instalando Sistema de Gerenciamento do Parque Tecnológico - IFG"
echo "=================================================================="
echo ""

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker &> /dev/null || ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

echo "✅ Docker encontrado"
echo "✅ Docker Compose encontrado"
echo ""

# Criar arquivo .env do backend se não existir
if [ ! -f backend/.env ]; then
    echo "📝 Criando arquivo .env do backend..."
    cp backend/.env.example backend/.env
    echo "✅ Arquivo .env do backend criado"
fi

# Criar arquivo .env.local do frontend se não existir
if [ ! -f frontend/.env.local ]; then
    echo "📝 Criando arquivo .env.local do frontend..."
    cp frontend/.env.example frontend/.env.local
    echo "✅ Arquivo .env.local do frontend criado"
fi

echo ""
echo "🐳 Iniciando containers Docker..."
docker compose up -d

echo ""
echo "⏳ Aguardando containers iniciarem..."
sleep 10

echo ""
echo "📦 Instalando dependências do backend..."
docker compose exec -T backend composer install

echo ""
echo "🔑 Gerando chave da aplicação Laravel..."
docker compose exec -T backend php artisan key:generate

echo ""
echo "🗄️  Executando migrations e seeders..."
docker compose exec -T backend php artisan migrate --seed

echo ""
echo "📦 Instalando dependências do frontend..."
docker compose exec -T frontend npm install

echo ""
echo "=================================================================="
echo "✅ Instalação concluída com sucesso!"
echo "=================================================================="
echo ""
echo "🌐 Acesse o sistema em: http://localhost:3000"
echo ""
echo "👤 Credenciais de teste:"
echo "   Admin:        admin@ifg.edu.br / password"
echo "   Técnico:      tecnico@ifg.edu.br / password"
echo "   Visualizador: professor@ifg.edu.br / password"
echo ""
echo "📚 Para mais informações, consulte o README.md"
echo ""

