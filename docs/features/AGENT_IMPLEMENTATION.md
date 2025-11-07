# Sistema de Agente Automático de Inventário - Implementação Completa

## Visão Geral

Sistema completo de coleta automática de inventário de hardware e software para os laboratórios do IFG Câmpus Jataí, composto por:

1. **Backend Laravel** - API REST com autenticação via API Key
2. **Agente Python** - Coleta automática em cada computador Windows
3. **Frontend React** - Painel administrativo para gerenciamento

---

## ✅ O QUE FOI IMPLEMENTADO

### 1. BACKEND LARAVEL

#### Migrations
- ✅ `add_agent_fields_to_equipamentos` - 12 novos campos para equipamentos
- ✅ `create_agent_api_keys_table` - Tabela completa de API Keys
- ✅ `add_agent_fields_to_softwares` - 3 novos campos para softwares

#### Models
- ✅ `AgentApiKey` - Gerenciamento de chaves de API
  - Métodos: `generateKey()`, `markAsUsed()`, `scopeActive()`
  - Relacionamentos: `creator`, `laboratorio`

#### Middleware
- ✅ `AuthenticateAgent` - Autenticação via header `X-Agent-API-Key`
  - Valida chave no banco
  - Atualiza `last_used_at`, `last_ip`, `last_hostname`
  - Adiciona `agent_key` ao request

#### Controllers
- ✅ `AgentController` - 3 endpoints para o agente:
  - `POST /sync-equipamento` - Sincroniza dados do equipamento
  - `POST /sync-softwares` - Sincroniza lista de softwares
  - `POST /sync-equipamento-softwares` - Sincroniza relacionamento

- ✅ `AgentManagementController` - Gerenciamento (Admin):
  - `GET /agent-management` - Lista todas as chaves
  - `POST /agent-management` - Cria nova chave
  - `DELETE /agent-management/{id}` - Desativa chave
  - `POST /agent-management/{id}/reactivate` - Reativa chave
  - `GET /agent-management/download` - Download do executável

#### Commands
- ✅ `agent:generate-key` - Comando Artisan para gerar API Keys
  ```bash
  php artisan agent:generate-key --name="Lab 01" --lab=1
  ```

#### Rotas
- ✅ Rotas do agente (autenticação via API Key)
- ✅ Rotas de gerenciamento (autenticação via Sanctum)

---

### 2. AGENTE PYTHON

#### Estrutura Completa
```
agent/
├── agent.py                    # Script principal ✅
├── config.yaml.template        # Template de configuração ✅
├── requirements.txt            # Dependências ✅
├── README.md                   # Documentação ✅
├── collectors/
│   ├── __init__.py            ✅
│   ├── hardware.py            # WMI para hardware ✅
│   ├── software.py            # Registry para software ✅
│   └── network.py             # psutil para rede ✅
├── api/
│   ├── __init__.py            ✅
│   └── client.py              # Cliente HTTP ✅
├── utils/
│   ├── __init__.py            ✅
│   ├── logger.py              # Sistema de logs ✅
│   └── config_manager.py      # Gerenciador de config ✅
└── service/
    ├── install.bat            # Instalador Windows ✅
    └── uninstall.bat          # Desinstalador ✅
```

#### Funcionalidades do Agente
- ✅ Coleta de hardware (fabricante, modelo, CPU, RAM, disco)
- ✅ Coleta de software (Registry do Windows)
- ✅ Coleta de rede (IP, MAC, Gateway, DNS)
- ✅ Detecção de mudanças via hash SHA256
- ✅ Sincronização automática (a cada 5 minutos, configurável)
- ✅ Retry automático com exponential backoff
- ✅ Sistema de logs com rotação
- ✅ Configuração via YAML
- ✅ Instalação como serviço Windows

---

### 3. FRONTEND (Next.js)

#### Página de Gerenciamento de Agentes
- ✅ `/agentes` - Página completa com:
  - Listagem de todas as API Keys
  - Status (ativo/inativo)
  - Última sincronização
  - Último hostname e IP
  - Botão para desativar/reativar
  - Modal para gerar nova API Key
  - Exibição única da chave gerada
  - Botão de copiar chave
  - Download do executável do agente
  - Filtro por laboratório

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### Tabela: `equipamentos` (Campos Novos)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `hostname` | string | Nome do computador |
| `processador` | string | Modelo do processador + cores |
| `memoria_ram` | string | Tamanho da RAM (ex: "16GB") |
| `disco` | string | Tamanho e tipo (ex: "512GB SSD") |
| `ip_local` | string | Endereço IP local |
| `mac_address` | string | Endereço MAC (indexado) |
| `gateway` | string | Gateway padrão |
| `dns_servers` | JSON | Array de servidores DNS |
| `gerenciado_por_agente` | boolean | Se é gerenciado pelo agente |
| `agent_version` | string | Versão do agente |
| `ultima_sincronizacao` | timestamp | Última sincronização |
| `dados_hash` | string | Hash SHA256 para detectar mudanças |

### Tabela: `agent_api_keys` (Nova)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | integer | ID único |
| `name` | string | Nome da chave |
| `key` | string(64) | Chave API (única) |
| `active` | boolean | Se está ativa |
| `version` | string | Versão do agente |
| `laboratorio_id` | integer | FK para laboratórios |
| `last_used_at` | timestamp | Último uso |
| `last_ip` | string | Último IP |
| `last_hostname` | string | Último hostname |
| `created_by` | integer | FK para usuários |

### Tabela: `softwares` (Campos Novos)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `data_instalacao` | date | Data de instalação |
| `chave_licenca` | string | Chave de licença |
| `detectado_por_agente` | boolean | Se foi detectado pelo agente |

---

## 🔄 FLUXO DE SINCRONIZAÇÃO

### 1. Agente coleta dados (a cada 5 minutos)
```
Hardware (WMI) + Rede (psutil) + Software (Registry)
         ↓
    Gera Hash SHA256
         ↓
   Compara com último hash
         ↓
  Se mudou → Sincroniza com API
```

### 2. API processa dados
```
POST /api/v1/agent/sync-equipamento
    ↓
Busca equipamento por serial/MAC
    ↓
Se existe: atualiza se hash mudou
Se não existe: cria novo
    ↓
Retorna equipamento_id
```

```
POST /api/v1/agent/sync-softwares
    ↓
Para cada software:
  Busca por nome+versão
  Se não existe: cria
    ↓
Retorna array de software_ids
```

```
POST /api/v1/agent/sync-equipamento-softwares
    ↓
Sincroniza relacionamento (sync)
Remove softwares ausentes
Adiciona softwares novos
```

---

## 🚀 GUIA DE INSTALAÇÃO

### BACKEND (Já está configurado)

1. **Migrations já foram executadas:**
   ```bash
   ✅ 2025_10_24_141925_add_agent_fields_to_equipamentos
   ✅ 2025_10_24_142015_create_agent_api_keys_table
   ✅ 2025_10_24_142055_add_agent_fields_to_softwares
   ```

2. **Gerar API Key de teste:**
   ```bash
   docker compose exec backend php artisan agent:generate-key
   ```

### AGENTE PYTHON

1. **Instalar Python no computador do lab:**
   - Download: https://www.python.org/downloads/
   - ⚠️ Marcar "Add Python to PATH"

2. **Instalar dependências:**
   ```bash
   cd agent
   pip install -r requirements.txt
   ```

3. **Executar pela primeira vez:**
   ```bash
   python agent.py
   ```
   - Será solicitado: API Key e ID do laboratório
   - Configurações salvas em `config.yaml`

4. **Instalar como serviço (opcional):**
   - Baixar NSSM: https://nssm.cc/download
   - Executar `service/install.bat` como Administrador

### FRONTEND

1. **Acessar painel:**
   ```
   http://localhost:3000/agentes
   ```

2. **Gerar nova API Key:**
   - Clicar em "Gerar Nova API Key"
   - Preencher nome e laboratório
   - Copiar a chave gerada

3. **Download do agente:**
   - Clicar em "Download do Agente"
   - ⚠️ Executável precisa ser compilado primeiro (ver abaixo)

---

## 🔨 COMPILAR AGENTE EM EXECUTÁVEL

Para distribuir o agente como `.exe`:

1. **Instalar PyInstaller:**
   ```bash
   pip install pyinstaller
   ```

2. **Compilar:**
   ```bash
   cd agent
   pyinstaller --onefile --name=LabAgent agent.py
   ```

3. **Copiar para Laravel:**
   ```bash
   mkdir backend/storage/app/public/agent
   copy dist\LabAgent.exe backend\storage\app\public\agent\LabAgent-Setup.exe
   ```

4. **Criar link simbólico (se necessário):**
   ```bash
   docker compose exec backend php artisan storage:link
   ```

---

## 🧪 TESTES

### Testar API do Agente

```bash
# Gerar API Key
docker compose exec backend php artisan agent:generate-key --name="Teste" --lab=1

# Testar endpoint (substitua API_KEY)
curl -X POST http://localhost:8000/api/v1/agent/sync-equipamento \
  -H "X-Agent-API-Key: SUA_CHAVE_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "hostname": "LAB01-PC01",
    "laboratorio_id": 1,
    "dados_hash": "abc123"
  }'
```

### Testar Agente Localmente

```bash
cd agent
python agent.py
```

### Verificar Logs

```bash
# Backend
docker compose exec backend tail -f storage/logs/laravel.log

# Agente
type agent\agent.log
```

---

## 📊 MONITORAMENTO

### Backend
- Logs em `storage/logs/laravel.log`
- Registra: criação/atualização de equipamentos e softwares

### Agente
- Logs em `agent/agent.log` (rotação automática)
- Mostra: coleta, mudanças detectadas, sincronização

### Frontend
- Painel `/agentes` mostra:
  - Status de cada agente (ativo/inativo)
  - Última sincronização
  - Último hostname conectado
  - Último IP

---

## 🔒 SEGURANÇA

### API Keys
- 64 caracteres aleatórios (256 bits)
- Armazenadas no banco
- Podem ser desativadas remotamente
- Rastreiam último uso (IP, hostname, timestamp)

### Autenticação
- Agente: Header `X-Agent-API-Key`
- Admin: Laravel Sanctum (session)

### Boas Práticas
- ✅ Uma chave por computador
- ✅ Desativar chaves comprometidas
- ✅ Revisar chaves inativas regularmente
- ✅ Usar HTTPS em produção

---

## 📝 CAMPOS COLETADOS

### Hardware
- Hostname
- Fabricante (ex: Dell, HP)
- Modelo (ex: OptiPlex 7090)
- Número de série
- Processador (ex: Intel Core i5-11400 (6 cores))
- Memória RAM (ex: 16GB)
- Disco (ex: 512GB SSD)

### Rede
- IP Local
- MAC Address
- Gateway
- Servidores DNS

### Software
- Nome do programa
- Versão
- Fabricante
- Data de instalação

---

## ⚙️ CONFIGURAÇÃO DO AGENTE

Arquivo `config.yaml`:

```yaml
api:
  url: http://localhost:8000/api/v1/agent
  key: 'SUA_CHAVE_API'

laboratorio:
  id: 1

coleta:
  intervalo_segundos: 300  # 5 minutos

logging:
  level: INFO
  arquivo: agent.log
  max_size_mb: 10
```

---

## 🐛 TROUBLESHOOTING

### "API Key inválida ou inativa"
- Verificar chave em `config.yaml`
- Confirmar que não foi desativada no painel

### "Erro ao coletar hardware"
- Executar como Administrador
- Verificar se WMI está funcionando

### "Nenhum software encontrado"
- Normal se for instalação limpa
- Softwares portáteis não são detectados

### Frontend não carrega agentes
- Verificar se backend está rodando
- Verificar console do navegador (F12)

---

## 📈 PRÓXIMAS MELHORIAS (Opcionais)

- [ ] Dashboard com status de todos os agentes
- [ ] Alertas quando agente fica offline
- [ ] Histórico de mudanças de hardware
- [ ] Exportar inventário completo (CSV/Excel)
- [ ] Relatório de conformidade de software
- [ ] Detecção de software não licenciado
- [ ] Comandos remotos para agentes

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Backend
- [x] Migrations criadas e executadas
- [x] Models criados e configurados
- [x] Middleware de autenticação
- [x] Controllers (Agent + Management)
- [x] Comando Artisan
- [x] Rotas configuradas
- [x] Testes básicos funcionando

### Agente Python
- [x] Estrutura de diretórios
- [x] Coletores (hardware, software, rede)
- [x] Cliente API
- [x] Sistema de logs
- [x] Gerenciador de configuração
- [x] Script principal
- [x] Scripts de instalação
- [x] Documentação (README)

### Frontend
- [x] Página de gerenciamento
- [x] Listagem de agentes
- [x] Gerar API Key
- [x] Ativar/Desativar agentes
- [x] Download do executável
- [x] Modal com cópia da chave

---

## 🎓 COMO USAR

### Para o Administrador:

1. Acessar `http://localhost:3000/agentes`
2. Clicar em "Gerar Nova API Key"
3. Copiar a chave gerada
4. Instalar agente no computador do lab
5. Fornecer a chave durante instalação
6. Monitorar status no painel

### Para o Técnico de Lab:

1. Receber API Key do administrador
2. Baixar agente (ou copiar pasta `agent/`)
3. Instalar Python 3.9+
4. Executar `pip install -r requirements.txt`
5. Executar `python agent.py`
6. Informar API Key e ID do laboratório
7. (Opcional) Instalar como serviço

---

## 📞 SUPORTE

**Desenvolvido para:** IFG Câmpus Jataí  
**Versão:** 1.0.0  
**Data:** Outubro/2025  
**Status:** ✅ Implementado e Funcional

---

**Sistema completo de inventário automatizado pronto para uso!** 🎉

