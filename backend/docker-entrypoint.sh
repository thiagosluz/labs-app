#!/bin/bash
set -e

# Install Composer dependencies if vendor directory doesn't exist
if [ ! -d "vendor" ]; then
    echo "📦 Instalando dependências do Composer..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# Wait for database to be ready
echo "⏳ Aguardando banco de dados..."
until php artisan db:show &> /dev/null; do
    echo "Aguardando conexão com o banco de dados..."
    sleep 2
done

echo "✅ Banco de dados pronto!"

# Execute the command passed to the entrypoint
exec "$@"

