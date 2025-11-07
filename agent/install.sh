#!/bin/bash

# Script de instalação do LabAgent para Linux
# Instala todas as dependências necessárias

set -e  # Parar em caso de erro

echo "=========================================="
echo "  LabAgent - Instalação de Dependências"
echo "=========================================="
echo ""

# Verificar se está no diretório correto
if [ ! -f "agent.py" ]; then
    echo "❌ Erro: Execute este script no diretório do agent"
    echo "   Exemplo: cd /caminho/para/agent && ./install.sh"
    exit 1
fi

# Verificar se Python 3 está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Erro: Python 3 não encontrado!"
    echo "   Instale Python 3: sudo apt-get install python3 python3-pip python3-venv"
    exit 1
fi

echo "✓ Python 3 encontrado: $(python3 --version)"
echo ""

# Verificar se pip está instalado
if ! command -v pip3 &> /dev/null; then
    echo "⚠️  pip3 não encontrado. Tentando instalar..."
    sudo apt-get update
    sudo apt-get install -y python3-pip
fi

echo "✓ pip3 encontrado: $(pip3 --version)"
echo ""

# Criar ambiente virtual se não existir
if [ ! -d "venv" ]; then
    echo "📦 Criando ambiente virtual..."
    python3 -m venv venv
    echo "✓ Ambiente virtual criado"
else
    echo "✓ Ambiente virtual já existe"
fi
echo ""

# Ativar ambiente virtual
echo "🔄 Ativando ambiente virtual..."
source venv/bin/activate

# Atualizar pip
echo "📦 Atualizando pip..."
pip install --upgrade pip --quiet

# Instalar dependências
echo ""
echo "📦 Instalando dependências do requirements.txt..."
pip install -r requirements.txt

echo ""
echo "=========================================="
echo "  ✅ Instalação concluída com sucesso!"
echo "=========================================="
echo ""
echo "Para usar o agent:"
echo "  1. Ative o ambiente virtual:"
echo "     source venv/bin/activate"
echo ""
echo "  2. Execute o agent:"
echo "     python3 agent.py"
echo ""
echo "  3. Para desativar o ambiente virtual:"
echo "     deactivate"
echo ""

