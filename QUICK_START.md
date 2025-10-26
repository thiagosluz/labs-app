# 🚀 Guia de Início Rápido - Parque Tecnológico IFG

## Instalação Rápida (5 minutos)

### 1. Pré-requisitos
Certifique-se de ter instalado:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

### 2. Clone e Configure

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd labs-app

# Inicie os containers
docker-compose up -d

# Aguarde alguns segundos para os containers iniciarem
```

### 3. Configure o Backend

```bash
# Execute as migrations e seeders
docker-compose exec backend php artisan migrate --seed

# A mensagem de sucesso mostrará os usuários criados
```

### 4. Acesse o Sistema

🌐 Abra seu navegador em: **http://localhost:3000**

## 👤 Login

Use uma das credenciais de teste:

### Administrador (Acesso Total)
- **Email:** admin@ifg.edu.br
- **Senha:** password

### Técnico (Criar/Editar)
- **Email:** tecnico@ifg.edu.br
- **Senha:** password

### Visualizador (Somente Leitura)
- **Email:** professor@ifg.edu.br
- **Senha:** password

## 🎯 Primeira Exploração

1. **Dashboard** - Veja as estatísticas gerais do sistema
2. **Laboratórios** - Explore os 2 laboratórios de exemplo
3. **Equipamentos** - Veja os 12 equipamentos cadastrados
4. **Softwares** - Confira os 5 softwares instalados
5. **Manutenções** - Visualize o histórico de manutenções
6. **Relatórios** - Gere relatórios em JSON

## 🛠️ Comandos Úteis

### Ver logs dos containers
```bash
docker-compose logs -f
```

### Reiniciar os containers
```bash
docker-compose restart
```

### Parar os containers
```bash
docker-compose down
```

### Resetar o banco de dados
```bash
docker-compose exec backend php artisan migrate:fresh --seed
```

## ❓ Problemas Comuns

### Porta 3000 ou 8000 já em uso
Edite o `docker-compose.yml` e altere as portas:
```yaml
ports:
  - "3001:3000"  # Frontend
  - "8001:8000"  # Backend
```

### Erro de permissão no Laravel
```bash
docker-compose exec backend chmod -R 775 storage bootstrap/cache
```

### Erro de conexão com o banco
Aguarde alguns segundos após o `docker-compose up` para o PostgreSQL inicializar completamente.

## 📊 Dados de Exemplo

O sistema é populado com:
- ✅ 3 Usuários (admin, técnico, professor)
- ✅ 2 Laboratórios
- ✅ 12 Equipamentos
- ✅ 5 Softwares
- ✅ 3 Manutenções concluídas

## 🎨 Interface

O sistema possui:
- 🟢 **Tema verde** (cores do IFG)
- 📱 **Responsivo** (funciona em celular)
- 📊 **Gráficos interativos**
- 🔔 **Alertas** (licenças expirando, etc.)

## 🚀 Próximos Passos

1. Explore todas as páginas do sistema
2. Crie novos laboratórios e equipamentos
3. Gere relatórios personalizados
4. Configure alertas de manutenção
5. Customize as cores no Tailwind (se desejar)

## 📞 Precisa de Ajuda?

Consulte o [README.md](README.md) completo para mais detalhes.

---

**Desenvolvido para IFG Câmpus Jataí** 🎓

