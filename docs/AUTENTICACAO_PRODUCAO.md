# Análise Profunda: Problema de Autenticação em Produção

## Problema Identificado

Ao tentar fazer login no servidor de produção (acessível via IP fixo), o sistema apresentava o erro:
```
XSRF token não encontrado. Verifique se os cookies estão habilitados.
```

## Causa Raiz

O problema ocorria porque o Laravel Sanctum não estava reconhecendo o IP de produção como um domínio "stateful", impedindo que os cookies de sessão e CSRF fossem definidos corretamente.

### Fluxo de Autenticação Sanctum SPA

1. **Frontend** faz requisição `GET /sanctum/csrf-cookie`
2. **Backend** verifica se a origem está na lista de domínios stateful
3. Se estiver, define cookies: `XSRF-TOKEN` e `laravel_session`
4. **Frontend** lê o cookie `XSRF-TOKEN`
5. **Frontend** faz `POST /login` com header `X-XSRF-TOKEN`
6. **Backend** valida o token e autentica o usuário

### Problemas Encontrados

1. **Sanctum Stateful Domains**: Configurado apenas para `localhost` e `127.0.0.1`
2. **CORS Allowed Origins**: Configurado apenas para `localhost` e `127.0.0.1`
3. **Frontend API URLs**: Usando variáveis de ambiente estáticas ao invés de dinâmicas
4. **Cookies SameSite**: Configurado como `lax` por padrão, que não funciona bem com IPs

## Soluções Implementadas

### 1. Configuração Dinâmica do Sanctum

**Arquivo**: `backend/config/sanctum.php`

```php
'stateful' => array_filter(array_unique(array_merge(
    explode(',', env('SANCTUM_STATEFUL_DOMAINS', '')),
    [
        'localhost',
        'localhost:3000',
        '127.0.0.1',
        '127.0.0.1:8000',
        '::1',
    ],
    // Adicionar host do APP_URL se configurado
    env('APP_URL') ? [parse_url(env('APP_URL'), PHP_URL_HOST)] : [],
    // Adicionar host do FRONTEND_URL se configurado
    env('FRONTEND_URL') ? [parse_url(env('FRONTEND_URL'), PHP_URL_HOST)] : [],
    // Adicionar URL completa com porta se necessário
    env('FRONTEND_URL') && parse_url(env('FRONTEND_URL'), PHP_URL_PORT) 
        ? [parse_url(env('FRONTEND_URL'), PHP_URL_HOST) . ':' . parse_url(env('FRONTEND_URL'), PHP_URL_PORT)] 
        : [],
))),
```

**Benefícios**:
- Aceita automaticamente o IP de produção via `APP_URL` e `FRONTEND_URL`
- Funciona tanto em desenvolvimento quanto em produção
- Não requer configuração manual adicional

### 2. Configuração Dinâmica do CORS

**Arquivo**: `backend/config/cors.php`

```php
'allowed_origins' => array_filter(array_unique(array_merge(
    explode(',', env('CORS_ALLOWED_ORIGINS', '')),
    [
        'http://localhost:3000',
        'http://localhost',
        'http://127.0.0.1:3000',
        'http://127.0.0.1',
    ],
    // Adicionar FRONTEND_URL se configurada
    env('FRONTEND_URL') ? [env('FRONTEND_URL')] : [],
    // Adicionar APP_URL se configurada (para produção)
    env('APP_ENV') === 'production' && env('APP_URL') ? [env('APP_URL')] : [],
))),
```

**Benefícios**:
- Permite requisições CORS do IP de produção
- Suporta múltiplas origens via variável de ambiente
- Mantém compatibilidade com desenvolvimento

### 3. URLs Dinâmicas no Frontend

**Arquivo**: `frontend/lib/api.ts`

```typescript
// Helper para obter URL base da API (sem /api/v1)
const getApiBaseUrl = () => {
  // No browser, usar a origem atual (funciona em dev e produção)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // No servidor, usar variável de ambiente
  return process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
};

// Helper para obter URL completa da API
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/v1`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
};
```

**Benefícios**:
- Detecta automaticamente o IP/domínio atual no navegador
- Funciona em qualquer ambiente sem configuração adicional
- Não depende de variáveis de ambiente no build

### 4. Configuração de Cookies para Produção

**Arquivo**: `backend/.env.production`

```env
SESSION_SAME_SITE=none
SESSION_SECURE_COOKIE=false
SESSION_DOMAIN=null
```

**Explicação**:
- `SESSION_SAME_SITE=none`: Necessário para cookies funcionarem quando frontend e backend estão no mesmo IP mas em portas diferentes (via Nginx)
- `SESSION_SECURE_COOKIE=false`: Necessário porque estamos usando HTTP (não HTTPS) em produção local
- `SESSION_DOMAIN=null`: Permite que cookies funcionem em qualquer domínio/IP

## Configuração Necessária em Produção

### Arquivo `.env.production` do Backend

```env
APP_URL=http://192.168.1.100
FRONTEND_URL=http://192.168.1.100
SESSION_SAME_SITE=none
SESSION_SECURE_COOKIE=false
SESSION_DOMAIN=null
```

### Arquivo `.env.production` do Frontend

```env
NEXT_PUBLIC_API_URL=http://192.168.1.100/api/v1
```

## Verificação do Problema

### Como Verificar se o Sanctum Está Funcionando

1. **Verificar cookies no navegador**:
   - Abra DevTools → Application → Cookies
   - Após fazer requisição `/sanctum/csrf-cookie`, deve aparecer:
     - `XSRF-TOKEN`
     - `laravel_session`

2. **Verificar logs do backend**:
```bash
docker compose logs backend | grep -i sanctum
```

3. **Testar requisição CSRF cookie**:
```bash
curl -v http://192.168.1.100/sanctum/csrf-cookie \
  -H "Origin: http://192.168.1.100" \
  -H "Cookie: laravel_session=test"
```

### Debug no Frontend

O código agora inclui logs de debug que mostram:
- Cookies disponíveis após requisição CSRF
- Token XSRF encontrado ou não

## Troubleshooting

### Problema: Cookies não aparecem

**Solução**:
1. Verificar se `SESSION_SAME_SITE=none` está configurado
2. Verificar se `SESSION_SECURE_COOKIE=false` (para HTTP)
3. Verificar se o IP está na lista de domínios stateful do Sanctum
4. Verificar se o CORS está permitindo a origem

### Problema: CORS error

**Solução**:
1. Verificar se `FRONTEND_URL` está configurado no `.env.production`
2. Verificar se o CORS está permitindo a origem correta
3. Verificar se `supports_credentials: true` está configurado

### Problema: XSRF token não encontrado

**Solução**:
1. Verificar se a requisição `/sanctum/csrf-cookie` está sendo feita
2. Verificar se os cookies estão sendo definidos (DevTools)
3. Verificar se `withCredentials: true` está configurado no Axios
4. Verificar se o domínio/IP está na lista stateful do Sanctum

## Atualização: Docker Compose

Todos os comandos foram atualizados de `docker-compose` para `docker compose` (versão mais recente do Docker).

### Comandos Atualizados

- `docker-compose up -d` → `docker compose up -d`
- `docker-compose exec backend` → `docker compose exec backend`
- `docker-compose logs` → `docker compose logs`
- etc.

## Resumo das Correções

1. ✅ Sanctum aceita IP de produção dinamicamente via `APP_URL` e `FRONTEND_URL`
2. ✅ CORS aceita IP de produção dinamicamente via `FRONTEND_URL`
3. ✅ Frontend usa `window.location.origin` dinamicamente (funciona em qualquer IP)
4. ✅ Configuração de cookies otimizada para produção local (HTTP + IP)
5. ✅ Todos os comandos atualizados para `docker compose`

## Próximos Passos

Após aplicar essas correções:

1. **Configurar `.env.production`** com o IP fixo
2. **Reiniciar o backend** para aplicar novas configurações
3. **Rebuild do frontend** (se necessário)
4. **Testar login** no servidor de produção

O sistema agora deve funcionar corretamente tanto em desenvolvimento quanto em produção local.

