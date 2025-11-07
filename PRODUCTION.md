# Guia de Implantação em Produção Local

Este guia detalha como implantar o sistema em um servidor de produção local, acessível via IP dentro da rede local, mantendo as configurações de desenvolvimento intactas.

## Objetivo

- Rodar a aplicação em um ambiente de produção local (Docker Compose).
- Acessar a aplicação via IP fixo (ex: `http://192.168.1.100`).
- Manter o ambiente de desenvolvimento (`docker-compose.yml`) funcionando sem alterações.
- Não usar HTTPS/SSL para simplificar a configuração local.

## Tecnologias Utilizadas

- **Docker Compose**: Orquestração dos containers.
- **Nginx**: Servidor web e reverse proxy para o frontend e backend.
- **Laravel Backend**: API PHP.
- **Next.js Frontend**: Aplicação React.
- **PostgreSQL**: Banco de dados.

## Pré-requisitos

1. **Docker e Docker Compose (v2)**: Certifique-se de que o Docker e o Docker Compose (o comando `docker compose` sem o hífen) estejam instalados e funcionando no seu servidor.
   ```bash
   docker --version
   docker compose version
   ```
2. **Git**: Para clonar o repositório.
3. **IP Fixo**: O servidor de produção deve ter um IP fixo na rede local. Exemplo: `192.168.1.100`.

### Como configurar um IP Fixo no Ubuntu Server (Exemplo)

1. Edite o arquivo de configuração do Netplan:
   ```bash
   sudo nano /etc/netplan/00-installer-config.yaml
   ```
2. Adicione ou modifique a seção `ethernets` com seu IP e gateway:
   ```yaml
   network:
     version: 2
     renderer: networkd
     ethernets:
       enp0s3: # Substitua pela sua interface de rede (ex: eth0, eno1, ens33)
         dhcp4: no
         addresses:
           - 192.168.1.100/24 # Seu IP fixo e máscara de sub-rede
         routes:
           - to: default
             via: 192.168.1.1 # Seu gateway
         nameservers:
             addresses: [8.8.8.8, 8.8.4.4] # Servidores DNS
   ```
3. Aplique as mudanças:
   ```bash
   sudo netplan apply
   ```
4. Verifique o IP:
   ```bash
   ip addr show
   ```

## Deploy Automatizado

### Opção 1: Usando o Script de Deploy (Recomendado)

1. Clone o repositório (se ainda não tiver):
   ```bash
   git clone <url-do-repositorio>
   cd labs-app
   ```

2. Execute o script de deploy:
   ```bash
   ./deploy.sh [IP_FIXO]
   ```

   Exemplo:
   ```bash
   ./deploy.sh 192.168.1.100
   ```

   Se não fornecer o IP, será usado o padrão: `192.168.1.100`

   O script irá:
   - Verificar pré-requisitos
   - Criar/atualizar arquivos `.env.production`
   - Construir imagens Docker
   - Instalar dependências
   - Build do frontend para produção
   - Iniciar containers
   - Executar migrations
   - Verificar saúde dos serviços

### Opção 2: Deploy Manual

1. **Configurar arquivos de ambiente:**

   Copie os templates e configure o IP:
   ```bash
   cp backend/.env.production.template backend/.env.production
   cp frontend/.env.production.template frontend/.env.production
   ```

   Edite os arquivos e substitua `192.168.1.100` pelo seu IP fixo:
   ```bash
   # backend/.env.production
   APP_URL=http://SEU_IP_FIXO
   FRONTEND_URL=http://SEU_IP_FIXO
   SESSION_SAME_SITE=none
   SESSION_SECURE_COOKIE=false
   SESSION_DOMAIN=null

   # frontend/.env.production
   NEXT_PUBLIC_API_URL=http://SEU_IP_FIXO/api/v1
   ```

   **Importante**: As configurações `SESSION_SAME_SITE=none` e `SESSION_SECURE_COOKIE=false` são necessárias para que os cookies funcionem corretamente quando acessando via IP (não domínio) em HTTP.

2. **Atualizar configuração do Nginx:**
   ```bash
   # Edite nginx/production.conf e substitua o IP
   sed -i 's/192.168.1.100/SEU_IP_FIXO/g' nginx/production.conf
   ```

3. **Construir e iniciar containers:**
   ```bash
   # Construir imagens
   docker compose -f docker-compose.prod.yml build

   # Instalar dependências do backend
   docker compose -f docker-compose.prod.yml run --rm backend-prod composer install --no-dev --optimize-autoloader

   # Instalar dependências do frontend
   docker compose -f docker-compose.prod.yml run --rm frontend-prod npm ci

   # Build do frontend
   docker compose -f docker-compose.prod.yml run --rm frontend-prod npm run build

   # Iniciar containers
   docker compose -f docker-compose.prod.yml up -d
   ```

4. **Executar Migrations e Seeders:**
   ```bash
   docker compose -f docker-compose.prod.yml exec backend-prod php artisan migrate --force --seed
   ```

5. **Criar Symlink do Storage:**
   ```bash
   docker compose -f docker-compose.prod.yml exec backend-prod php artisan storage:link
   ```

## Acesso ao Sistema

Após o deploy, o sistema estará acessível em `http://SEU_IP_FIXO`.

## Usuários de Teste

Se os seeders foram executados, você pode usar as seguintes credenciais:

- **Admin**: `admin@ifg.edu.br` / `password`
- **Técnico**: `tecnico@ifg.edu.br` / `password`
- **Visualizador**: `professor@ifg.edu.br` / `password`

## Solução de Problemas Comuns

### 1. Erro "XSRF token não encontrado" ou problemas de login

**Causa**: Geralmente relacionado a configurações incorretas do Laravel Sanctum, CORS ou cookies.

**Solução**:
- Verifique se `backend/.env.production` tem as seguintes linhas:
  ```env
  APP_URL=http://SEU_IP_FIXO
  FRONTEND_URL=http://SEU_IP_FIXO
  SESSION_SAME_SITE=none
  SESSION_SECURE_COOKIE=false
  SESSION_DOMAIN=null
  SANCTUM_STATEFUL_DOMAINS=SEU_IP_FIXO,SEU_IP_FIXO:80
  CORS_ALLOWED_ORIGINS=http://SEU_IP_FIXO
  ```
- Certifique-se de que o Nginx está configurado para rotear `/sanctum` para o backend e que `Access-Control-Allow-Credentials: true` está presente.
- Reinicie os containers do backend e frontend após qualquer alteração nas variáveis de ambiente ou configurações.

### 2. Erro "403 Forbidden" ao acessar imagens ou QR codes

**Causa**: O symlink `public/storage` não existe ou as permissões estão incorretas.

**Solução**:
- Execute o comando para criar o symlink:
  ```bash
  docker compose -f docker-compose.prod.yml exec backend-prod php artisan storage:link
  ```
- Verifique as permissões do diretório `backend/storage/app/public`. Elas devem permitir que o usuário do servidor web (geralmente `www-data` dentro do container) leia os arquivos.

### 3. Erro "The 'intl' PHP extension is required"

**Causa**: A extensão `intl` do PHP não está instalada no container do backend.

**Solução**:
- Certifique-se de que o `backend/Dockerfile` inclui a instalação de `libicu-dev` e `intl`.
- Reconstrua a imagem do backend:
  ```bash
  docker compose -f docker-compose.prod.yml build backend-prod
  docker compose -f docker-compose.prod.yml up -d backend-prod
  ```

### 4. Backend preso em "Aguardando banco de dados..."

**Causa**: O script `docker-entrypoint.sh` do backend não consegue se conectar ao PostgreSQL.

**Solução**:
- Verifique os logs do container `postgres-prod` para garantir que o banco de dados iniciou corretamente.
- Verifique as variáveis de ambiente `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` em `backend/.env.production`.

## Limpeza

Para parar e remover todos os containers, redes e volumes de produção:
```bash
docker compose -f docker-compose.prod.yml down -v
```

## Separação de Ambientes

- **Desenvolvimento**: `docker-compose.yml` (portas 3000, 8000, 5432)
- **Produção**: `docker-compose.prod.yml` (porta 80 via Nginx, containers com sufixo `-prod`)
- Volumes separados (ex: `postgres_data` vs `postgres_data_prod`)
- Redes separadas (ex: `labs-network` vs `labs-network-prod`)

## Estrutura de Arquivos

```
labs-app/
├── docker-compose.yml              # Desenvolvimento
├── docker-compose.prod.yml         # Produção
├── deploy.sh                       # Script de deploy automatizado
├── PRODUCTION.md                   # Este arquivo
├── backend/
│   ├── .env.production.template    # Template de variáveis de ambiente
│   └── .env.production             # Variáveis de ambiente (criado pelo script)
├── frontend/
│   ├── .env.production.template    # Template de variáveis de ambiente
│   ├── .env.production             # Variáveis de ambiente (criado pelo script)
│   └── Dockerfile.prod             # Dockerfile para produção
└── nginx/
    └── production.conf             # Configuração do Nginx para produção
```

