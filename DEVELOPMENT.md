# 🛠️ Guia de Desenvolvimento

## Estrutura do Projeto

```
labs-app/
├── backend/          # Laravel 12 API
├── frontend/         # Next.js 15 App
├── nginx/            # Configurações Nginx
└── docker-compose.yml
```

## Comandos Úteis

### Docker

```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f

# Parar todos os serviços
docker-compose down

# Rebuild dos containers
docker-compose up -d --build

# Remover volumes (limpa banco de dados)
docker-compose down -v
```

### Backend (Laravel)

```bash
# Acessar container do backend
docker-compose exec backend bash

# Rodar migrations
docker-compose exec backend php artisan migrate

# Resetar banco de dados
docker-compose exec backend php artisan migrate:fresh --seed

# Criar Model
docker-compose exec backend php artisan make:model NomeModel -m

# Criar Controller
docker-compose exec backend php artisan make:controller Api/V1/NomeController

# Criar Migration
docker-compose exec backend php artisan make:migration criar_tabela_nome

# Criar Seeder
docker-compose exec backend php artisan make:seeder NomeSeeder

# Criar Factory
docker-compose exec backend php artisan make:factory NomeFactory

# Criar Policy
docker-compose exec backend php artisan make:policy NomePolicy

# Limpar cache
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan config:clear
docker-compose exec backend php artisan route:clear

# Testes
docker-compose exec backend php artisan test
docker-compose exec backend php artisan test --filter NomeDoTeste

# Tinker (console interativo)
docker-compose exec backend php artisan tinker

# Ver rotas
docker-compose exec backend php artisan route:list
```

### Frontend (Next.js)

```bash
# Acessar container do frontend
docker-compose exec frontend sh

# Instalar pacotes
docker-compose exec frontend npm install <pacote>

# Build
docker-compose exec frontend npm run build

# Adicionar componente shadcn/ui
docker-compose exec frontend npx shadcn@latest add <componente>

# Listar componentes shadcn/ui disponíveis
docker-compose exec frontend npx shadcn@latest add

# Formatar código
docker-compose exec frontend npm run format

# Lint
docker-compose exec frontend npm run lint
```

### PostgreSQL

```bash
# Acessar PostgreSQL
docker-compose exec postgres psql -U labs_user -d labs_app

# Backup do banco
docker-compose exec postgres pg_dump -U labs_user labs_app > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U labs_user labs_app < backup.sql
```

## Desenvolvimento Local (Sem Docker)

### Backend

```bash
cd backend

# Instalar dependências
composer install

# Copiar .env
cp .env.example .env

# Gerar key
php artisan key:generate

# Configurar banco no .env
DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=labs_app
DB_USERNAME=labs_user
DB_PASSWORD=labs_password

# Rodar migrations
php artisan migrate --seed

# Iniciar servidor
php artisan serve
```

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Copiar .env
cp .env.example .env.local

# Configurar API
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Iniciar servidor
npm run dev
```

## Adicionando Novas Funcionalidades

### 1. Criar um novo módulo no Backend

```bash
# 1. Criar Migration
docker-compose exec backend php artisan make:migration criar_tabela_modulos

# 2. Criar Model
docker-compose exec backend php artisan make:model Modulo

# 3. Criar Controller
docker-compose exec backend php artisan make:controller Api/V1/ModuloController

# 4. Criar Policy
docker-compose exec backend php artisan make:policy ModuloPolicy

# 5. Criar Factory e Seeder
docker-compose exec backend php artisan make:factory ModuloFactory
docker-compose exec backend php artisan make:seeder ModuloSeeder

# 6. Adicionar rotas em routes/api.php

# 7. Rodar migrations
docker-compose exec backend php artisan migrate
```

### 2. Criar uma nova página no Frontend

```bash
# Criar página
mkdir -p frontend/app/(dashboard)/modulos
touch frontend/app/(dashboard)/modulos/page.tsx

# Adicionar no Sidebar
# Editar: frontend/components/Sidebar.tsx
```

## Debugging

### Backend

```bash
# Ver logs do Laravel
docker-compose exec backend tail -f storage/logs/laravel.log

# Debug com dd() ou dump()
# Adicionar no código: dd($variavel);

# Ativar modo debug no .env
APP_DEBUG=true
LOG_LEVEL=debug
```

### Frontend

```bash
# Ver logs do Next.js
docker-compose logs -f frontend

# Debug no navegador
# Usar console.log() no código
# Usar React DevTools
```

## Testes

### Backend - PHPUnit

```bash
# Rodar todos os testes
docker-compose exec backend php artisan test

# Rodar teste específico
docker-compose exec backend php artisan test --filter NomeDoTeste

# Com coverage
docker-compose exec backend php artisan test --coverage
```

### Frontend - Jest (Configurar)

```bash
# Instalar Jest
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Rodar testes
npm test
```

## Otimização

### Backend

```bash
# Otimizar autoload
docker-compose exec backend composer dump-autoload -o

# Cache de configuração
docker-compose exec backend php artisan config:cache

# Cache de rotas
docker-compose exec backend php artisan route:cache

# Cache de views
docker-compose exec backend php artisan view:cache
```

### Frontend

```bash
# Build otimizado
docker-compose exec frontend npm run build

# Analisar bundle
docker-compose exec frontend npm run build -- --analyze
```

## Git Workflow

```bash
# Criar nova branch
git checkout -b feature/nova-funcionalidade

# Commitar mudanças
git add .
git commit -m "feat: adiciona nova funcionalidade"

# Push
git push origin feature/nova-funcionalidade

# Criar Pull Request no GitHub/GitLab
```

## Troubleshooting

### Erro de permissão no Laravel

```bash
docker-compose exec backend chmod -R 775 storage bootstrap/cache
docker-compose exec backend chown -R www-data:www-data storage bootstrap/cache
```

### Porta já em uso

```bash
# Ver processos usando a porta
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Matar processo
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Limpar tudo e começar do zero

```bash
# Parar e remover containers, volumes e imagens
docker-compose down -v --rmi all

# Rebuild completo
docker-compose up -d --build

# Reinstalar
docker-compose exec backend composer install
docker-compose exec backend php artisan key:generate
docker-compose exec backend php artisan migrate --seed
docker-compose exec frontend npm install
```

## Recursos Úteis

- [Laravel Docs](https://laravel.com/docs/12.x)
- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Docker Docs](https://docs.docker.com)

---

**Happy Coding! 🚀**

