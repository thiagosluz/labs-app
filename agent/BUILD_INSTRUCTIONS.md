# 🏗️ Instruções de Build do LabAgent

Este guia explica como compilar o LabAgent em um executável Windows.

---

## 📋 Pré-requisitos

- **Python 3.8 ou superior**
- **Windows 10/11**
- **Conexão com internet** (para baixar dependências)

---

## 🚀 Passo 1: Instalar Dependências

Execute o script de instalação:

```batch
install.bat
```

Este script irá:
- ✅ Verificar se Python está instalado
- ✅ Atualizar pip
- ✅ Instalar todas as dependências do `requirements.txt`:
  - requests
  - psutil
  - WMI
  - pywin32
  - PyYAML
  - netifaces

---

## 🔨 Passo 2: Compilar o Agente

### Opção 1: Build sem Console (Produção)

Para gerar um executável sem janela de console:

```batch
build.bat
```

Isso irá:
- ✅ Instalar PyInstaller (se necessário)
- ✅ Compilar `agent.py` em `LabAgent.exe`
- ✅ Gerar executável único (sem dependências externas)
- ✅ Copiar automaticamente para `backend/storage/app/public/agent/`

**Resultado:** `dist/LabAgent.exe` (~25-30 MB)

---

### Opção 2: Build com Console (Debug)

Para gerar um executável com janela de console (útil para debug):

```batch
build_with_console.bat
```

**Resultado:** `dist/LabAgent-Debug.exe`

Esta versão mostra todas as mensagens de log no console, facilitando testes e diagnóstico de problemas.

---

## 📦 Estrutura após Build

```
agent/
├── agent.py                      # Código fonte principal
├── requirements.txt              # Dependências Python
├── install.bat                   # Script de instalação
├── build.bat                     # Script de compilação (produção)
├── build_with_console.bat        # Script de compilação (debug)
├── BUILD_INSTRUCTIONS.md         # Este arquivo
├── dist/
│   └── LabAgent.exe             # ✅ Executável gerado
├── build/                        # Arquivos temporários do PyInstaller
└── agent.spec                    # Especificação do PyInstaller
```

**Backend após build:**
```
backend/storage/app/public/agent/
└── LabAgent-Setup.exe           # ✅ Executável pronto para download
```

---

## ✅ Verificar se Funcionou

Após o build, você pode:

### 1. **Testar Localmente**
```batch
cd dist
LabAgent.exe
```

### 2. **Verificar no Backend**
Confira se o arquivo foi copiado:
```batch
dir ..\backend\storage\app\public\agent\LabAgent-Setup.exe
```

### 3. **Testar Download via Web**
1. Acesse: `http://localhost:3000/agentes`
2. Login: `admin@ifg.edu.br` / `password`
3. Clique em **"Download do Agente"**
4. O arquivo `LabAgent-Setup.exe` deve baixar

### 4. **Configuração em Produção**
Quando executar o agente pela primeira vez em um computador do laboratório, ele solicitará:
1. **URL do servidor** (ex: `http://192.168.1.100`)
2. **API Key** (fornecida pelo administrador)
3. **ID do Laboratório** (específico de cada computador)

---

## 🐛 Troubleshooting

### Erro: "Python não encontrado"
**Solução:** Instale Python de [python.org](https://www.python.org/downloads/)
- ⚠️ Marque "Add Python to PATH" durante instalação

### Erro: "ModuleNotFoundError: No module named 'wmi'"
**Solução:** Execute `install.bat` primeiro

### Erro: "PyInstaller não encontrado"
**Solução:** O script `build.bat` instala automaticamente, mas você pode instalar manualmente:
```batch
pip install pyinstaller
```

### Executável muito grande (>100 MB)
**Normal!** PyInstaller embute Python completo + todas as dependências.
Tamanho esperado: **25-35 MB**

### Erro ao copiar para backend
**Solução:** Verifique se o Docker está rodando:
```batch
docker-compose ps
```

Se o diretório não existir, crie manualmente:
```batch
mkdir ..\backend\storage\app\public\agent
```

---

## 🔄 Rebuild após Alterações

Se você modificar o código do agente:

1. **Limpe builds anteriores:**
```batch
rmdir /s /q dist build
del agent.spec
```

2. **Recompile:**
```batch
build.bat
```

---

## 📝 Notas Importantes

- ⚠️ O executável é específico para **Windows**
- ⚠️ Não funciona em Linux/Mac (requer build separado)
- ⚠️ Antivírus pode marcar como falso positivo (normal para executáveis PyInstaller)
- ✅ O executável inclui **todas as dependências** (não precisa Python no computador de destino)
- ✅ Configuração é feita via arquivo `config.yaml` (gerado na primeira execução)

---

## 🎯 Próximos Passos

Após compilar com sucesso:

1. ✅ Distribua `LabAgent-Setup.exe` para os computadores do laboratório
2. ✅ Execute o agente em cada máquina
3. ✅ Configure URL do servidor, API Key e ID do laboratório
4. ✅ Monitore sincronizações no painel web

---

## 📞 Suporte

Se encontrar problemas durante o build, verifique:
- ✅ Versão do Python: `python --version` (mínimo 3.8)
- ✅ Dependências instaladas: `pip list`
- ✅ Espaço em disco: ~500 MB livres
- ✅ Permissões de escrita no diretório

---

**Build feliz! 🎉**

