#!/bin/bash

# Script para executar o LabAgent no Linux
# Ativa o ambiente virtual automaticamente se existir

set -e

# Verificar se está no diretório correto
if [ ! -f "agent.py" ]; then
    echo "❌ Erro: Execute este script no diretório do agent"
    echo "   Exemplo: cd /caminho/para/agent && ./run.sh"
    exit 1
fi

# Se existe ambiente virtual, ativar
if [ -d "venv" ]; then
    echo "🔄 Ativando ambiente virtual..."
    source venv/bin/activate
else
    echo "⚠️  Ambiente virtual não encontrado!"
    echo "   Execute primeiro: ./install.sh"
    echo ""
    read -p "Deseja continuar sem ambiente virtual? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

# Executar o agent
echo "🚀 Iniciando LabAgent..."
echo ""
python3 agent.py

