# 🚀 Guia de Implantação em Produção - Parque Tecnológico IFG

## 📋 Visão Geral

Este guia fornece instruções passo a passo para implantar o sistema Parque Tecnológico IFG em um servidor local usando Docker na porta 80, sem HTTPS, com PostgreSQL em container e recursos mínimos (2 CPU / 4GB RAM / 50GB disco).

## 🎯 Especificações do Sistema

- **Acesso:** Por IP local (ex: http://192.168.1.100)
- **Porta:** 80 (HTTP)
- **Banco de dados:** PostgreSQL em container Docker
- **Recursos mínimos:** 2 CPU / 4GB RAM / 50GB disco
- **Backup:** Manual (scripts fornecidos)

## 📦 Pré-requisitos

### Sistema Operacional
- Ubuntu 20.04+ / CentOS 7+ / Windows Server 2019+
- Acesso root/sudo

### Software Necessário
- Docker 20.10+
- Docker Compose 2.0+ (integrado ao Docker CLI)
- Git
- Curl (para testes)

### Recursos do Servidor
- **CPU:** Mínimo 2 cores
- **RAM:** Mínimo 4GB
- **Disco:** Mínimo 50GB (SSD recomendado)
- **Rede:** IP estático configurado

## 🔧 Instalação do Docker

### Ubuntu/Debian
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Adicionar chave GPG do Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Adicionar repositório
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Reiniciar sessão
newgrp docker
```

### CentOS/RHEL
```bash
# Instalar dependências
sudo yum install -y yum-utils

# Adicionar repositório
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Instalar Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Iniciar e habilitar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
```

### Windows Server
```powershell
# Instalar Docker Desktop for Windows Server
# Download: https://docs.docker.com/desktop/windows/install/

# Ou usar Chocolatey
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

choco install docker-desktop -y
```

## 📥 Preparação do Servidor

### 1. Configurar IP Estático
```bash
# Ubuntu/Debian - Editar /etc/netplan/01-netcfg.yaml
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: false
      addresses: [192.168.1.100/24]
      gateway4: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]

# Aplicar configuração
sudo netplan apply
```

### 2. Configurar Firewall
```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

### 3. Criar Usuário para Aplicação
```bash
# Criar usuário dedicado
sudo useradd -m -s /bin/bash labs-app
sudo usermod -aG docker labs-app

# Criar diretório de trabalho
sudo mkdir -p /opt/labs-app
sudo chown labs-app:labs-app /opt/labs-app
```

## 🚀 Implantação

### 1. Clonar Repositório
```bash
# Fazer login como usuário da aplicação
sudo su - labs-app

# Clonar repositório
cd /opt/labs-app
git clone <URL_DO_REPOSITORIO> .
```

### 2. Configurar Variáveis de Ambiente

#### Backend (.env.production)
```bash
# Copiar arquivo de exemplo
cp backend/.env.production backend/.env.production.local

# Editar com IP do servidor
nano backend/.env.production.local
```

**Conteúdo do arquivo:**
```env
APP_NAME="Parque Tecnológico IFG"
APP_ENV=production
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=false
APP_URL=http://192.168.1.100

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=labs_app
DB_USERNAME=labs_user
DB_PASSWORD=labs_password_prod_2024

SESSION_DRIVER=file
SESSION_LIFETIME=120

SANCTUM_STATEFUL_DOMAINS=192.168.1.100
SESSION_DOMAIN=192.168.1.100

CORS_ALLOWED_ORIGINS=http://192.168.1.100
CORS_ALLOWED_HEADERS=*
CORS_ALLOWED_METHODS=*
CORS_SUPPORTS_CREDENTIALS=true
```

#### Frontend (.env.production)
```bash
# Copiar arquivo de exemplo
cp frontend/.env.production frontend/.env.production.local

# Editar com IP do servidor
nano frontend/.env.production.local
```

**Conteúdo do arquivo:**
```env
NEXT_PUBLIC_API_URL=http://192.168.1.100/api/v1
NODE_ENV=production
```

### 3. Executar Deploy

#### Linux
```bash
# Tornar script executável
chmod +x deploy.sh

# Executar deploy
./deploy.sh 192.168.1.100
```

#### Windows
```powershell
# Executar script PowerShell
.\deploy.ps1 -ServerIP "192.168.1.100"
```

### 4. Verificar Implantação
```bash
# Verificar status dos containers
docker compose -f docker-compose.prod.yml ps

# Verificar logs
docker compose -f docker-compose.prod.yml logs -f

# Testar endpoints
curl http://192.168.1.100/health
curl http://192.168.1.100/api/v1/dashboard
```

## 🔐 Primeiro Acesso

### 1. Acessar Sistema
- Abrir navegador em: `http://192.168.1.100`
- Sistema deve carregar a página de login

### 2. Credenciais Padrão
Após o deploy, o sistema é populado com usuários de exemplo:

#### Administrador (Acesso Total)
- **Email:** admin@ifg.edu.br
- **Senha:** password

#### Técnico (Criar/Editar)
- **Email:** tecnico@ifg.edu.br
- **Senha:** password

#### Visualizador (Somente Leitura)
- **Email:** professor@ifg.edu.br
- **Senha:** password

### 3. Configurações Iniciais
1. Fazer login como administrador
2. Alterar senhas padrão
3. Criar usuários reais
4. Configurar laboratórios
5. Cadastrar equipamentos

## 🛠️ Comandos de Gerenciamento

### Controle de Containers
```bash
# Iniciar todos os serviços
docker compose -f docker-compose.prod.yml up -d

# Parar todos os serviços
docker compose -f docker-compose.prod.yml down

# Reiniciar um serviço específico
docker compose -f docker-compose.prod.yml restart backend

# Ver logs em tempo real
docker compose -f docker-compose.prod.yml logs -f

# Ver logs de um serviço específico
docker compose -f docker-compose.prod.yml logs -f backend
```

### Comandos Laravel
```bash
# Executar migrations
docker compose -f docker-compose.prod.yml exec backend php artisan migrate

# Executar seeders
docker compose -f docker-compose.prod.yml exec backend php artisan db:seed

# Limpar cache
docker compose -f docker-compose.prod.yml exec backend php artisan cache:clear
docker compose -f docker-compose.prod.yml exec backend php artisan config:clear
docker compose -f docker-compose.prod.yml exec backend php artisan route:clear
docker compose -f docker-compose.prod.yml exec backend php artisan view:clear

# Otimizar aplicação
docker compose -f docker-compose.prod.yml exec backend php artisan config:cache
docker compose -f docker-compose.prod.yml exec backend php artisan route:cache
```

### Backup e Restore
```bash
# Fazer backup
./backup.sh

# Restaurar backup
./restore.sh backup_20241201_143022.tar.gz

# Verificar saúde do sistema
./health-check.sh 192.168.1.100
```

## 📊 Monitoramento

### Verificação de Saúde
```bash
# Executar health check completo
./health-check.sh 192.168.1.100

# Verificar status dos containers
docker compose -f docker-compose.prod.yml ps

# Verificar uso de recursos
docker stats
```

### Logs do Sistema
```bash
# Logs do Nginx
docker compose -f docker-compose.prod.yml logs nginx

# Logs do Backend
docker compose -f docker-compose.prod.yml logs backend

# Logs do Frontend
docker compose -f docker-compose.prod.yml logs frontend

# Logs do PostgreSQL
docker compose -f docker-compose.prod.yml logs postgres
```

### Métricas de Performance
```bash
# Uso de CPU e memória
docker stats --no-stream

# Espaço em disco
df -h

# Uso de memória
free -h

# Processos em execução
ps aux | grep docker
```

## 🔄 Atualizações

### Atualizar Código
```bash
# Fazer backup antes da atualização
./backup.sh

# Atualizar código
git pull origin main

# Rebuild e restart
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build

# Executar migrations se necessário
docker compose -f docker-compose.prod.yml exec backend php artisan migrate
```

### Atualizar Dependências
```bash
# Atualizar dependências do backend
docker compose -f docker-compose.prod.yml exec backend composer update

# Atualizar dependências do frontend
docker compose -f docker-compose.prod.yml exec frontend npm update
```

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Containers não iniciam
```bash
# Verificar logs
docker compose -f docker-compose.prod.yml logs

# Verificar espaço em disco
df -h

# Verificar memória
free -h

# Reiniciar Docker
sudo systemctl restart docker
```

#### 2. Erro de permissão
```bash
# Corrigir permissões do Laravel
docker compose -f docker-compose.prod.yml exec backend chown -R www-data:www-data /var/www/storage
docker compose -f docker-compose.prod.yml exec backend chmod -R 775 /var/www/storage
```

#### 3. Banco de dados não conecta
```bash
# Verificar se PostgreSQL está rodando
docker compose -f docker-compose.prod.yml ps postgres

# Verificar logs do PostgreSQL
docker compose -f docker-compose.prod.yml logs postgres

# Testar conexão
docker compose -f docker-compose.prod.yml exec postgres pg_isready -U labs_user
```

#### 4. API não responde
```bash
# Verificar se backend está rodando
docker compose -f docker-compose.prod.yml ps backend

# Verificar logs do backend
docker compose -f docker-compose.prod.yml logs backend

# Testar endpoint diretamente
curl http://192.168.1.100/api/v1/dashboard
```

#### 5. Frontend não carrega
```bash
# Verificar se frontend está rodando
docker compose -f docker-compose.prod.yml ps frontend

# Verificar logs do frontend
docker compose -f docker-compose.prod.yml logs frontend

# Testar endpoint diretamente
curl http://192.168.1.100/
```

### Logs de Erro
```bash
# Verificar logs do sistema
journalctl -u docker

# Verificar logs do Nginx
docker compose -f docker-compose.prod.yml logs nginx | grep error

# Verificar logs do Laravel
docker compose -f docker-compose.prod.yml exec backend tail -f /var/www/storage/logs/laravel.log
```

## 🔒 Segurança

### Configurações Básicas
1. **Alterar senhas padrão** imediatamente após deploy
2. **Configurar firewall** para permitir apenas portas necessárias
3. **Atualizar sistema** regularmente
4. **Monitorar logs** para atividades suspeitas
5. **Fazer backups** regulares

### Recomendações Adicionais
- Configurar SSL/TLS em produção real
- Implementar autenticação de dois fatores
- Configurar monitoramento de segurança
- Implementar políticas de backup automatizado
- Configurar alertas de sistema

## 📞 Suporte

### Informações do Sistema
- **Versão:** 1.0.0
- **Desenvolvido para:** IFG Câmpus Jataí
- **Tecnologias:** Laravel 12, Next.js 15, PostgreSQL 16, Docker

### Contatos
- **Desenvolvedor:** [Thiago Luz]
- **Email:** [thiago.silva@ifg.edu.br]

### Documentação Adicional
- [README.md](README.md) - Documentação geral
- [DEVELOPMENT.md](DEVELOPMENT.md) - Guia de desenvolvimento
- [QUICK_START.md](QUICK_START.md) - Início rápido para desenvolvimento

---

**Desenvolvido para IFG Câmpus Jataí** 🎓
