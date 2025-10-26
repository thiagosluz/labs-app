# LabAgent - Agente de Inventário Automatizado

Agente Python para coleta automática de informações de hardware e software em computadores Windows.

## 📋 Requisitos

- **Sistema Operacional:** Windows 10/11 ou Windows Server 2016+
- **Python:** 3.9 ou superior
- **Privilégios:** Administrador (para instalação como serviço)
- **Rede:** Acesso ao servidor da API Laravel

## 🚀 Instalação Rápida

### 1. Instalar Python

Baixe e instale Python 3.9+ de [python.org](https://www.python.org/downloads/)

**IMPORTANTE:** Marque a opção "Add Python to PATH" durante a instalação!

### 2. Instalar Dependências

```bash
pip install -r requirements.txt
```

### 3. Configurar API Key

1. Acesse o painel administrativo do sistema
2. Vá em "Gerenciar Agentes"
3. Clique em "Gerar API Key"
4. Copie a chave gerada

### 4. Executar pela Primeira Vez

```bash
python agent.py
```

Na primeira execução, será solicitado:
- **API Key:** Cole a chave copiada do painel admin
- **ID do Laboratório:** Digite o número do laboratório deste computador

## 🔧 Configuração

O arquivo `config.yaml` é criado automaticamente com as seguintes opções:

```yaml
api:
  url: http://localhost:8000/api/v1/agent  # URL da API
  key: ''                                   # API Key

laboratorio:
  id: null                                  # ID do laboratório

coleta:
  intervalo_segundos: 300                   # Intervalo (5 minutos)

logging:
  level: INFO                               # Nível de log
  arquivo: agent.log                        # Arquivo de log
  max_size_mb: 10                           # Tamanho máximo do log
```

## 🎯 O Que o Agente Coleta

### Hardware
- Nome do computador (hostname)
- Fabricante e modelo
- Número de série
- Processador (modelo e cores)
- Memória RAM
- Disco rígido (tamanho e tipo)

### Rede
- Endereço IP local
- Endereço MAC
- Gateway padrão
- Servidores DNS

### Software
- Todos os programas instalados via Windows Registry
- Versão de cada software
- Fabricante
- Data de instalação (quando disponível)

## 🔄 Como Funciona

1. **Coleta:** O agente coleta informações do sistema a cada 5 minutos (configurável)
2. **Detecção de Mudanças:** Usa hash SHA256 para detectar se algo mudou
3. **Sincronização:** Apenas envia dados quando há mudanças
4. **Retry Automático:** Se a API estiver indisponível, tenta novamente

## 📊 Monitoramento

### Logs

Os logs são salvos em `agent.log` com rotação automática:

```
2025-10-24 11:30:00 - LabAgent - INFO - Agente iniciado
2025-10-24 11:30:05 - LabAgent - INFO - Coletando informações de hardware...
2025-10-24 11:30:10 - LabAgent - INFO - ✅ Equipamento atualizado: ID 42
2025-10-24 11:30:15 - LabAgent - INFO - ✅ Softwares processados: 125
```

### Verificar Status

Para verificar se o agente está rodando:

```bash
# Ver processo
tasklist | findstr python

# Ver logs
type agent.log
```

## 🛠️ Instalação como Serviço Windows

### Usando NSSM (Recomendado)

1. Baixe NSSM de [nssm.cc](https://nssm.cc/download)
2. Execute `service/install.bat` como Administrador

O agente será instalado como serviço e iniciará automaticamente com o Windows.

### Gerenciar Serviço

```bash
# Iniciar
net start LabAgentService

# Parar
net stop LabAgentService

# Ver status
sc query LabAgentService
```

## 🔍 Troubleshooting

### "API Key inválida ou inativa"

- Verifique se a chave está correta no `config.yaml`
- Confirme que a chave não foi desativada no painel admin

### "Erro ao conectar na API"

- Verifique a URL da API no `config.yaml`
- Confirme que o servidor Laravel está rodando
- Verifique firewall/proxy

### "Permissão negada"

- O agente precisa rodar como Administrador para coletar informações do sistema

### Softwares não aparecem

- Alguns softwares portáteis não são detectados (não estão no Registry)
- O agente coleta apenas programas instalados formalmente no Windows

## 📝 Estrutura de Arquivos

```
agent/
├── agent.py              # Script principal
├── config.yaml          # Configurações
├── requirements.txt     # Dependências Python
├── collectors/          # Módulos de coleta
│   ├── hardware.py     # Coleta hardware
│   ├── software.py     # Coleta software
│   └── network.py      # Coleta rede
├── api/                # Cliente API
│   └── client.py       # Comunicação com Laravel
├── utils/              # Utilitários
│   ├── logger.py       # Sistema de logs
│   └── config_manager.py  # Gerenciador de config
└── service/            # Scripts de serviço
    ├── install.bat     # Instalar serviço
    └── uninstall.bat   # Desinstalar serviço
```

## 🔒 Segurança

- API Key armazenada localmente em `config.yaml`
- Comunicação com a API via HTTPS (em produção)
- Apenas leitura do sistema (não modifica nada)
- Logs não contêm informações sensíveis

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs em `agent.log`
2. Consulte o painel administrativo
3. Entre em contato com o suporte técnico do IFG

---

**Versão:** 1.0.0  
**Desenvolvido para:** IFG Câmpus Jataí

