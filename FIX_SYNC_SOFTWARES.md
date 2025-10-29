# 🔧 Como Corrigir o Erro 500 em sync-softwares

## Problema
O agente está recebendo erro 500 ao tentar sincronizar softwares:
```
500 Server Error: Internal Server Error for url: http://10.5.254.70/api/v1/agent/sync-softwares
```

## Diagnóstico Passo a Passo

### 1. Verificar Logs do Servidor

Execute no servidor Ubuntu:

```bash
# Ver últimas 100 linhas do log
docker compose -f docker-compose.prod.yml exec backend tail -n 100 storage/logs/laravel.log

# Filtrar apenas erros relacionados a sync-softwares
docker compose -f docker-compose.prod.yml exec backend tail -n 200 storage/logs/laravel.log | grep -A 20 "sync-softwares\|Falha ao processar\|Erro fatal"

# Ver erros mais recentes
docker compose -f docker-compose.prod.yml exec backend tail -f storage/logs/laravel.log
```

### 2. Verificar se as Migrations foram Executadas

```bash
# Ver status das migrations
docker compose -f docker-compose.prod.yml exec backend php artisan migrate:status

# Executar migrations pendentes
docker compose -f docker-compose.prod.yml exec backend php artisan migrate --force
```

### 3. Verificar Estrutura da Tabela softwares

```bash
docker compose -f docker-compose.prod.yml exec backend php artisan tinker
```

Depois execute no tinker:
```php
// Verificar colunas
Schema::getColumnListing('softwares');

// Deve conter:
// - data_instalacao
// - chave_licenca  
// - detectado_por_agente

// Verificar se consegue criar um software
$s = App\Models\Software::create([
    'nome' => 'Teste',
    'tipo_licenca' => 'proprietario',
    'detectado_por_agente' => true,
]);
echo "✅ Software criado: " . $s->id;
$s->delete();
```

### 4. Testar Endpoint Diretamente

No servidor ou de outro computador:

```bash
curl -X POST http://10.5.254.70/api/v1/agent/sync-softwares \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "softwares": [
      {
        "nome": "Teste Software",
        "versao": "1.0",
        "fabricante": "Teste Corp"
      }
    ]
  }'
```

## Correções Aplicadas no Código

As seguintes melhorias foram feitas no `AgentController`:

1. ✅ Validação mais robusta dos dados de entrada
2. ✅ Sanitização de strings (limite 255 caracteres)
3. ✅ Tratamento de erro por software (continua processando outros)
4. ✅ Logging detalhado de erros
5. ✅ Verificação de campos obrigatórios (nome)
6. ✅ Normalização de versão vazia/null

## Soluções Possíveis

### Solução 1: Executar Migrations Pendentes

```bash
docker compose -f docker-compose.prod.yml exec backend php artisan migrate --force
```

### Solução 2: Verificar Permissões do Banco

```bash
# Verificar se o usuário do banco tem permissão para INSERT/UPDATE
docker compose -f docker-compose.prod.yml exec db mysql -u root -p -e "SHOW GRANTS FOR 'labsapp'@'%';"
```

### Solução 3: Limpar Cache e Recompilar

```bash
docker compose -f docker-compose.prod.yml exec backend php artisan config:clear
docker compose -f docker-compose.prod.yml exec backend php artisan cache:clear
docker compose -f docker-compose.prod.yml exec backend php artisan route:clear
docker compose -f docker-compose.prod.yml exec backend php artisan config:cache
docker compose -f docker-compose.prod.yml exec backend php artisan route:cache
docker compose -f docker-compose.prod.yml restart backend
```

### Solução 4: Verificar Logs em Tempo Real

```bash
# Em uma janela do terminal
docker compose -f docker-compose.prod.yml exec backend tail -f storage/logs/laravel.log

# Em outra janela, execute o agente e veja os erros aparecerem em tempo real
```

## Verificar se Funcionou

Após as correções, verifique:

1. ✅ Logs não mostram mais erros 500
2. ✅ Endpoint responde com status 200
3. ✅ Softwares são criados/atualizados no banco
4. ✅ Agente consegue sincronizar sem erros

## Próximos Passos se Ainda Houver Erro

1. Copie o erro completo dos logs do Laravel
2. Verifique a mensagem de erro específica
3. Verifique se há constraints de banco de dados violadas
4. Verifique se há problemas de memória (muitos softwares de uma vez)

## Informações Importantes

- O código agora processa softwares individualmente e continua mesmo se um falhar
- Erros detalhados são logados em `storage/logs/laravel.log`
- A resposta JSON inclui `errors_count` e `errors` com detalhes dos problemas

