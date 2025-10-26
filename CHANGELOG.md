# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2025-01-20

### ✨ Adicionado

#### Backend (Laravel 12)
- Sistema de autenticação com Laravel Sanctum
- API RESTful completa com versionamento (`/api/v1`)
- Models com relacionamentos:
  - User (Usuário)
  - Laboratorio (Laboratório)
  - Equipamento
  - Software
  - Manutencao (Manutenção)
  - HistoricoMovimentacao (Histórico de Movimentação)
  - ActivityLog (Log de Atividades)
- Controllers para todas as entidades
- Policies para controle de acesso (Admin, Técnico, Visualizador)
- Migrations completas com soft deletes
- Factories para geração de dados de teste
- Seeder com dados de exemplo (2 labs, 12 equipamentos, 5 softwares)
- Middleware de autorização
- Validação de dados com Form Requests
- Configuração de CORS
- Docker com PostgreSQL

#### Frontend (Next.js 15)
- Interface moderna com TailwindCSS e shadcn/ui
- Tema verde institucional do IFG
- Páginas principais:
  - Login com autenticação
  - Dashboard com estatísticas e gráficos
  - Laboratórios (listagem e gerenciamento)
  - Equipamentos (listagem e gerenciamento)
  - Softwares (listagem e gerenciamento)
  - Manutenções (listagem e histórico)
  - Relatórios (geração de relatórios)
- Componentes reutilizáveis:
  - Navbar com perfil do usuário
  - Sidebar responsiva com menu de navegação
  - Cards informativos
  - Tabelas com paginação
  - Badges de status
- Gráficos interativos com Recharts:
  - Equipamentos por tipo (Pizza)
  - Equipamentos por estado (Barras)
  - Manutenções por mês
- Sistema de alertas:
  - Licenças próximas do vencimento
  - Equipamentos em manutenção
- Gerenciamento de estado com Zustand
- Cliente HTTP com Axios
- TypeScript completo
- Responsivo (mobile-first)

#### Infraestrutura
- Docker Compose com 4 serviços:
  - PostgreSQL (banco de dados)
  - Laravel Backend
  - Next.js Frontend
  - Nginx (proxy reverso)
- Dockerfiles otimizados
- Scripts de instalação (bash e PowerShell)
- Variáveis de ambiente configuráveis

#### Documentação
- README completo com guia de instalação
- QUICK_START para início rápido
- DEVELOPMENT com comandos úteis
- Comentários em código
- Exemplos de uso da API

### 🔒 Segurança
- Autenticação com tokens JWT via Sanctum
- Senhas criptografadas com bcrypt
- Validação de dados em todas as requisições
- Proteção CSRF
- Controle de acesso por roles (RBAC)
- Proteção contra SQL Injection (Eloquent ORM)
- Headers de segurança configurados
- CORS configurado corretamente

### 📊 Funcionalidades Principais

#### Laboratórios
- CRUD completo de laboratórios
- Associação com responsável
- Controle de status (ativo, inativo, manutenção)
- Listagem de equipamentos por laboratório
- Busca e filtros

#### Equipamentos
- CRUD completo de equipamentos
- Tipos: computador, projetor, roteador, switch, impressora, scanner, outro
- Estados: em uso, reserva, manutenção, descartado
- Upload de fotos
- Anexos (notas fiscais, laudos)
- Histórico de movimentações entre laboratórios
- Associação com softwares instalados
- Número de série e patrimônio único

#### Softwares
- CRUD completo de softwares
- Tipos de licença: livre, educacional, proprietário
- Controle de quantidade de licenças
- Data de expiração com alertas
- Associação com equipamentos e laboratórios
- Versionamento

#### Manutenções
- CRUD completo de manutenções
- Tipos: corretiva e preventiva
- Status: pendente, em andamento, concluída, cancelada
- Associação com técnico responsável
- Anexos (fotos, documentos)
- Histórico completo

#### Relatórios
- Equipamentos por laboratório
- Softwares por laboratório
- Manutenções por período
- Exportação em JSON
- Dashboard com gráficos interativos

#### Dashboard
- Cards com estatísticas gerais
- Gráficos de pizza e barras
- Alertas visuais
- Top 5 laboratórios
- Indicadores em tempo real

### 🎨 Design
- Tema verde do IFG (#22c55e)
- Interface moderna e limpa
- Componentes shadcn/ui
- Ícones Lucide React
- Responsivo (mobile, tablet, desktop)
- Animações suaves
- Feedback visual (toasts)

### 🧪 Testes
- Estrutura para testes PHPUnit no backend
- Factories para geração de dados de teste
- Ambiente de teste configurado

### 📦 Dados de Exemplo
- 3 Usuários (1 admin, 1 técnico, 1 visualizador)
- 2 Laboratórios
- 12 Equipamentos (10 desktops, 1 projetor, 1 switch)
- 5 Softwares (Office, VS Code, LibreOffice, Photoshop, IntelliJ)
- 3 Manutenções preventivas concluídas
- Relacionamentos entre entidades

### 🛠️ Ferramentas de Desenvolvimento
- Hot reload no frontend e backend
- Logs detalhados
- Comandos Artisan personalizados
- Scripts de instalação automatizados

## [Próximas Versões]

### 🚧 Planejado para v1.1.0
- [ ] Exportação de relatórios em PDF
- [ ] Exportação de relatórios em Excel
- [ ] Sistema de notificações por e-mail
- [ ] Agendamento de manutenções preventivas
- [ ] QR Code para equipamentos
- [ ] App mobile (React Native)
- [ ] Modo escuro completo
- [ ] Multi-idioma (i18n)
- [ ] Backup automático agendado
- [ ] API pública para integração com TVs
- [ ] Suporte a múltiplos campus

### 🔮 Futuro (v2.0.0)
- [ ] Sistema de reserva de laboratórios
- [ ] Controle de acesso físico (integração com catracas)
- [ ] Dashboard em tempo real (WebSockets)
- [ ] Análise preditiva de manutenções (ML)
- [ ] Integração com Active Directory
- [ ] Sistema de chamados
- [ ] Inventário automatizado via rede

---

**Desenvolvido para IFG Câmpus Jataí** 🎓

[1.0.0]: https://github.com/ifg-jatai/labs-app/releases/tag/v1.0.0

