# 🔍 Diagnóstico Completo - Erro 500 no Agent

## Problema
O agente retorna erro 500, mas não aparecem logs no Laravel.

## ✅ Correções Aplicadas

1. ✅ Logging detalhado no middleware `AuthenticateAgent`
2. ✅ Logging no início dos métodos `syncEquipamento` e `syncSoftwares`
3. ✅ Handler global de exceções no `bootstrap/app.php`
4. ✅ Endpoint de teste `/api/v1/agent/test`
5. ✅ Limites PHP aumentados (post_max_size, memory_limit, timeouts)
6. ✅ Timeouts Nginx aumentados

## 📋 Passos de Diagnóstico

### 1. Verificar se o Container foi Reconstruído

```bash
# IMPORTANTE: Reconstruir o backend para aplicar mudanças
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml up -d backend
docker compose -f docker-compose.prod.yml restart nginx

# Verificar se o container está rodando
docker compose -f docker-compose.prod.yml ps backend
```

### 2. Testar Endpoint de Teste

```bash
# Substitua YOUR_API_KEY pela chave real do agente
curl -X GET http://10.5.254.70/api/v1/agent/test \
  -H "X-Agent-API-Key: YOUR_API_KEY"

# Deve retornar:
# {"status":"ok","message":"Agent endpoint is working","agent_key_id":1}
```

Se o endpoint de teste funcionar, significa que:
- ✅ Middleware está funcionando
- ✅ Rota está acessível
- ❌ Problema está no método `syncEquipamento`

### 3. Verificar Logs em Tempo Real

**Terminal 1 - Monitorar logs:**
```bash
# Em um terminal, monitore logs em tempo real
docker compose -f docker-compose.prod.yml exec backend tail -f storage/logs/laravel.log
```

**Terminal 2 - Executar agente:**
```bash
# Em outro terminal, execute o agente
python agent.py
```

**O que procurar nos logs:**
- `Agent middleware - Início` - Middleware foi executado
- `Agent middleware - Autenticação OK` - API key válida
- `=== INÍCIO sync-equipamento ===` - Controller recebeu requisição
- `Exception não capturada` - Erro global capturado

### 4. Verificar Logs do Nginx

```bash
# Verificar se erro está no Nginx
docker compose -f docker-compose.prod.yml logs -f nginx | grep -i error
```

### 5. Testar Endpoint Manualmente

```bash
# Testar sync-equipamento diretamente
curl -X POST http://10.5.254.70/api/v1/agent/sync-equipamento \
  -H "Content-Type: application/json" \
  -H "X-Agent-API-Key: YOUR_API_KEY" \
  -d '{
    "hostname":"PC-TESTE",
    "laboratorio_id":1,
    "dados_hash":"abc123",
    "numero_serie":"SN-123",
    "mac_address":"00:11:22:33:44:55",
    "fabricante":"Dell",
    "modelo":"OptiPlex",
    "processador":"Intel Core i5",
    "memoria_ram":"8GB",
    "disco":"256GB SSD",
    "ip_local":"192.168.1.100",
    "gateway":"192.168.1.1",
    "dns_servers":["8.8.8.8","8.8.4.4"]
  }'
```

### 6. Verificar Migrations

```bash
# Verificar se todas as migrations foram executadas
docker compose -f docker-compose.prod.yml exec backend php artisan migrate:status

# Se houver migrations pendentes
docker compose -f docker-compose.prod.yml exec backend php artisan migrate --force
```

### 7. Verificar Estrutura do Banco

```bash
# Verificar colunas da tabela equipamentos
docker compose -f docker-compose.prod.yml exec backend php artisan tinker
```

No tinker:
```php
Schema::getColumnListing('equipamentos');
// Deve conter: hostname, processador, memoria_ram, disco, ip_local, mac_address, gateway, dns_servers, gerenciado_por_agente, agent_version, ultima_sincronizacao, dados_hash
```

### 8. Verificar Permissões de Storage

```bash
# Verificar se storage tem permissões corretas
docker compose -f docker-compose.prod.yml exec backend ls -la storage/logs/

# Se não existir, criar
docker compose -f docker-compose.prod.yml exec backend chmod -R 775 storage bootstrap/cache
```

## 🐛 Possíveis Causas

### 1. Container não reconstruído
**Solução:** Reconstruir backend com `docker compose build backend`

### 2. Migrations não executadas
**Solução:** Executar `php artisan migrate --force`

### 3. Problema na validação
**Solução:** Ver logs de validação (`Erro de validação em sync-equipamento`)

### 4. Problema no banco de dados
**Solução:** Verificar conexão e permissões

### 5. Erro antes do Laravel
**Solução:** Verificar logs do Nginx e PHP-FPM

## 📊 O Que Esperar dos Logs

### Se Middleware está OK:
```
[timestamp] local.INFO: Agent middleware - Início {"path":"api/v1/agent/sync-equipamento",...}
[timestamp] local.INFO: Agent middleware - Autenticação OK {"agent_id":1}
```

### Se Controller está OK:
```
[timestamp] local.INFO: === INÍCIO sync-equipamento === {"method":"POST",...}
```

### Se houver erro:
```
[timestamp] local.ERROR: Exception não capturada {"message":"...", "file":"...", "line":...}
```

### Se houver erro de validação:
```
[timestamp] local.ERROR: Erro de validação em sync-equipamento {"errors":{...}}
```

## 🚀 Próximos Passos

1. **Reconstruir container backend**
2. **Testar endpoint `/test` primeiro**
3. **Monitorar logs em tempo real enquanto executa agente**
4. **Compartilhar logs completos** se ainda houver erro

## 📝 Comandos Rápidos

```bash
# Script de diagnóstico completo
chmod +x check-agent-logs.sh
./check-agent-logs.sh

# Rebuild completo
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml up -d backend
docker compose -f docker-compose.prod.yml restart nginx

# Limpar cache e logs antigos
docker compose -f docker-compose.prod.yml exec backend php artisan config:clear
docker compose -f docker-compose.prod.yml exec backend php artisan route:clear
docker compose -f docker-compose.prod.yml exec backend rm -f storage/logs/laravel.log
docker compose -f docker-compose.prod.yml exec backend touch storage/logs/laravel.log
docker compose -f docker-compose.prod.yml exec backend chmod 666 storage/logs/laravel.log
```

