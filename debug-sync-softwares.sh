#!/bin/bash

# Script para debugar o erro de sync-softwares
# Usage: ./debug-sync-softwares.sh

echo "🔍 Diagnosticando erro de sync-softwares..."
echo ""

echo "📋 1. Verificando logs recentes do Laravel:"
echo "=========================================="
docker compose -f docker-compose.prod.yml exec backend tail -n 50 storage/logs/laravel.log | grep -A 10 -B 5 "sync-softwares\|Falha ao processar\|Erro fatal"
echo ""

echo "📋 2. Verificando últimas 20 linhas do log:"
echo "=========================================="
docker compose -f docker-compose.prod.yml exec backend tail -n 20 storage/logs/laravel.log
echo ""

echo "📋 3. Verificando estrutura da tabela softwares:"
echo "=========================================="
docker compose -f docker-compose.prod.yml exec backend php artisan tinker --execute="echo 'Colunas: '; print_r(Schema::getColumnListing('softwares'));"
echo ""

echo "📋 4. Verificando se há softwares na tabela:"
echo "=========================================="
docker compose -f docker-compose.prod.yml exec backend php artisan tinker --execute="echo 'Total: ' . App\Models\Software::count();"
echo ""

echo "📋 5. Testando criação de software manualmente:"
echo "=========================================="
docker compose -f docker-compose.prod.yml exec backend php artisan tinker --execute="
try {
    \$s = App\Models\Software::create([
        'nome' => 'Teste Debug',
        'versao' => '1.0',
        'tipo_licenca' => 'proprietario',
        'detectado_por_agente' => true,
    ]);
    echo '✅ Software criado: ' . \$s->id;
    \$s->delete();
} catch (\Exception \$e) {
    echo '❌ Erro: ' . \$e->getMessage();
}
"
echo ""

echo "✅ Diagnóstico concluído!"
echo "Verifique os logs acima para identificar o problema."

