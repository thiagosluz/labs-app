#!/bin/bash
set -e

# Install Composer dependencies if vendor directory doesn't exist
if [ ! -d "vendor" ]; then
    echo "📦 Instalando dependências do Composer..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# Wait for database to be ready
echo "⏳ Aguardando banco de dados..."
MAX_ATTEMPTS=30
ATTEMPT=0
until php -r "
    try {
        \$pdo = new PDO('pgsql:host=${DB_HOST:-postgres};port=${DB_PORT:-5432};dbname=${DB_DATABASE:-labs_app}', '${DB_USERNAME:-labs_user}', '${DB_PASSWORD:-labs_password}');
        \$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        \$pdo->query('SELECT 1');
        exit(0);
    } catch (Exception \$e) {
        exit(1);
    }
" 2>/dev/null; do
    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
        echo "❌ Timeout aguardando banco de dados após $MAX_ATTEMPTS tentativas"
        exit 1
    fi
    echo "Aguardando conexão com o banco de dados... (tentativa $ATTEMPT/$MAX_ATTEMPTS)"
    sleep 2
done

echo "✅ Banco de dados pronto!"

# Execute the command passed to the entrypoint
exec "$@"

