#!/bin/bash

# Script para criar/corrigir o symlink do storage do Laravel
# Resolve o problema de erro 403 nos QR codes

set -e

echo "=========================================="
echo "  Corrigindo Storage Link - Laravel"
echo "=========================================="
echo ""

# Verificar se está no diretório correto
if [ ! -f "artisan" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do Laravel (backend)"
    exit 1
fi

# Verificar se o diretório storage existe
if [ ! -d "storage/app/public" ]; then
    echo "📁 Criando diretório storage/app/public..."
    mkdir -p storage/app/public
    echo "✅ Diretório criado"
fi

# Remover symlink antigo se existir (pode estar quebrado)
if [ -L "public/storage" ] || [ -e "public/storage" ]; then
    echo "🗑️  Removendo symlink/diretório antigo..."
    rm -rf public/storage
    echo "✅ Removido"
fi

# Criar novo symlink
echo "🔗 Criando symlink public/storage -> storage/app/public..."
ln -sfn ../storage/app/public public/storage

# Verificar se foi criado corretamente
if [ -L "public/storage" ]; then
    TARGET=$(readlink -f public/storage)
    if [ "$TARGET" = "$(pwd)/storage/app/public" ]; then
        echo "✅ Symlink criado corretamente!"
    else
        echo "⚠️  Symlink criado, mas aponta para: $TARGET"
    fi
else
    echo "❌ Erro ao criar symlink!"
    exit 1
fi

# Ajustar permissões
echo ""
echo "🔐 Ajustando permissões..."
chmod -R 755 storage/app/public
echo "✅ Permissões ajustadas"

echo ""
echo "=========================================="
echo "  ✅ Storage link corrigido com sucesso!"
echo "=========================================="
echo ""
echo "Os QR codes agora devem funcionar corretamente."
echo ""

