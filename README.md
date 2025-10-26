# Sistema de Gerenciamento do Parque Tecnológico - IFG Câmpus Jataí

Sistema completo para gerenciamento de hardware, software e laboratórios de informática do IFG Câmpus Jataí.

## 🚀 Tecnologias

### Backend
- **Laravel 12** - Framework PHP
- **PostgreSQL** - Banco de dados
- **Laravel Sanctum** - Autenticação API
- **Docker** - Containerização

### Frontend
- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Estilização
- **shadcn/ui** - Componentes UI
- **Recharts** - Gráficos
- **Zustand** - Gerenciamento de estado
- **Axios** - Cliente HTTP

## 📋 Funcionalidades

- ✅ **Autenticação** com 3 níveis de acesso (Admin, Técnico, Visualizador)
- ✅ **Dashboard** com estatísticas e gráficos em tempo real
- ✅ **Gerenciamento de Laboratórios** (CRUD completo)
- ✅ **Gerenciamento de Equipamentos** (CRUD completo)
- ✅ **Gerenciamento de Softwares** (CRUD completo)
- ✅ **Controle de Manutenções** (preventivas e corretivas)
- ✅ **Histórico de Movimentações** entre laboratórios
- ✅ **Relatórios** (equipamentos, softwares, manutenções)
- ✅ **Alertas** (licenças expirando, equipamentos em manutenção)
- ✅ **Log de Atividades** (auditoria)

## 🐳 Instalação com Docker

### Pré-requisitos
- Docker
- Docker Compose
- Git

### Passo a Passo

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd labs-app
```

2. **Configure as variáveis de ambiente**

Backend (`backend/.env`):
```env
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=labs_app
DB_USERNAME=labs_user
DB_PASSWORD=labs_password
```

Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

3. **Inicie os containers**
```bash
docker-compose up -d
```

4. **Execute as migrations e seeders** (primeira vez)
```bash
docker-compose exec backend php artisan migrate --seed
```

5. **Acesse o sistema**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## 👥 Usuários de Teste

Após executar os seeders, você terá acesso a estes usuários:

| Perfil | E-mail | Senha | Permissões |
|--------|--------|-------|-----------|
| **Admin** | admin@ifg.edu.br | password | Acesso total |
| **Técnico** | tecnico@ifg.edu.br | password | Criar/editar registros |
| **Visualizador** | professor@ifg.edu.br | password | Somente leitura |

## 📊 Estrutura do Banco de Dados

### Tabelas Principais
- **users** - Usuários do sistema
- **laboratorios** - Laboratórios de informática
- **equipamentos** - Equipamentos (computadores, projetores, etc.)
- **softwares** - Softwares instalados
- **manutencoes** - Histórico de manutenções
- **historico_movimentacoes** - Movimentações de equipamentos
- **activity_logs** - Log de auditoria

### Relacionamentos
- Laboratórios ↔ Equipamentos (1:N)
- Laboratórios ↔ Softwares (N:N)
- Equipamentos ↔ Softwares (N:N)
- Equipamentos ↔ Manutenções (1:N)

## 🛠️ Comandos Úteis

### Backend (Laravel)

```bash
# Executar migrations
docker-compose exec backend php artisan migrate

# Executar seeders
docker-compose exec backend php artisan db:seed

# Limpar cache
docker-compose exec backend php artisan cache:clear

# Gerar chave da aplicação
docker-compose exec backend php artisan key:generate

# Criar um novo controller
docker-compose exec backend php artisan make:controller NomeController

# Criar uma nova migration
docker-compose exec backend php artisan make:migration criar_tabela

# Testes
docker-compose exec backend php artisan test
```

### Frontend (Next.js)

```bash
# Instalar dependências
cd frontend && npm install

# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm run start
```

## 📁 Estrutura de Pastas

```
labs-app/
├── backend/                 # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── Api/V1/  # Controllers da API
│   │   ├── Models/          # Models Eloquent
│   │   └── Policies/        # Policies de autorização
│   ├── database/
│   │   ├── migrations/      # Migrations
│   │   ├── factories/       # Factories
│   │   └── seeders/         # Seeders
│   └── routes/
│       └── api.php          # Rotas da API
│
├── frontend/                # Next.js App
│   ├── app/
│   │   ├── (dashboard)/     # Páginas autenticadas
│   │   └── login/           # Página de login
│   ├── components/          # Componentes React
│   │   └── ui/              # Componentes shadcn/ui
│   ├── lib/                 # Utilitários
│   │   ├── api.ts           # Cliente Axios
│   │   └── types.ts         # TypeScript types
│   └── store/               # Zustand stores
│
├── docker-compose.yml       # Configuração Docker
└── README.md
```

## 🎨 Interface

O sistema possui uma interface moderna e responsiva com:
- **Tema Verde** (cores institucionais do IFG)
- **Modo Claro/Escuro**
- **Design Responsivo** (mobile-first)
- **Gráficos Interativos** (Recharts)
- **Componentes Modernos** (shadcn/ui)

### Páginas Principais
- **Dashboard** - Visão geral com estatísticas e gráficos
- **Laboratórios** - Gerenciamento de laboratórios
- **Equipamentos** - Controle de hardware
- **Softwares** - Gestão de licenças e softwares
- **Manutenções** - Histórico e agendamento
- **Relatórios** - Geração de relatórios

## 🔐 Segurança

- Autenticação via **Laravel Sanctum**
- Autorização com **Policies**
- Validação de dados com **Form Requests**
- Proteção **CORS** configurada
- **Senhas criptografadas** (bcrypt)
- **Tokens de API** com expiração

## 📈 API REST

### Endpoints Principais

```
POST   /api/v1/login              # Login
POST   /api/v1/logout             # Logout
GET    /api/v1/me                 # Usuário autenticado
GET    /api/v1/dashboard          # Estatísticas

# Laboratórios
GET    /api/v1/laboratorios       # Listar
POST   /api/v1/laboratorios       # Criar
GET    /api/v1/laboratorios/:id   # Visualizar
PUT    /api/v1/laboratorios/:id   # Atualizar
DELETE /api/v1/laboratorios/:id   # Deletar

# Equipamentos
GET    /api/v1/equipamentos       # Listar
POST   /api/v1/equipamentos       # Criar
GET    /api/v1/equipamentos/:id   # Visualizar
PUT    /api/v1/equipamentos/:id   # Atualizar
DELETE /api/v1/equipamentos/:id   # Deletar

# Softwares
GET    /api/v1/softwares          # Listar
POST   /api/v1/softwares          # Criar
GET    /api/v1/softwares/:id      # Visualizar
PUT    /api/v1/softwares/:id      # Atualizar
DELETE /api/v1/softwares/:id      # Deletar

# Manutenções
GET    /api/v1/manutencoes        # Listar
POST   /api/v1/manutencoes        # Criar
GET    /api/v1/manutencoes/:id    # Visualizar
PUT    /api/v1/manutencoes/:id    # Atualizar
DELETE /api/v1/manutencoes/:id    # Deletar

# Relatórios
GET    /api/v1/relatorios/equipamentos-por-laboratorio
GET    /api/v1/relatorios/softwares-por-laboratorio
GET    /api/v1/relatorios/manutencoes/:inicio/:fim
```

## 🧪 Testes

```bash
# Backend - PHPUnit
docker-compose exec backend php artisan test

# Frontend - Jest (se configurado)
cd frontend && npm test
```

## 📝 Dados de Exemplo

O sistema vem com dados de exemplo após executar os seeders:
- **2 Laboratórios** (Lab. Informática 1, Lab. Redes)
- **12 Equipamentos** (10 desktops, 1 projetor, 1 switch)
- **5 Softwares** (Office, VS Code, LibreOffice, Photoshop, IntelliJ)
- **3 Manutenções** (preventivas concluídas)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é de código aberto para uso educacional no IFG Câmpus Jataí.

## 📞 Suporte

Para suporte, entre em contato com a equipe de TI do IFG Câmpus Jataí.

---

**Desenvolvido para IFG Câmpus Jataí** 🎓

