# 🚀 Guia Rápido - LabAgent

## Problema 1: ModuleNotFoundError: No module named 'wmi'

### ✅ Solução Windows:
```batch
cd C:\Users\thiago\Projetos\labs-app\agent
install.bat
```

### ✅ Solução Linux:
```bash
cd /home/thiago/Projetos/labs-app/agent
./install.sh
```

Isso instala todas as dependências necessárias.

---

## Problema 2: "Agente não disponível" ao baixar

### ✅ Solução Windows:
```batch
cd C:\Users\thiago\Projetos\labs-app\agent
build.bat
```

Isso compila o agente e copia automaticamente para o backend.

---

## 📋 Resumo dos Comandos

### 🪟 Windows

#### 1️⃣ Instalar Dependências
```batch
cd C:\Users\thiago\Projetos\labs-app\agent
install.bat
```

#### 2️⃣ Testar Agente (Desenvolvimento)
```batch
python agent.py
```

#### 3️⃣ Compilar Executável (Produção)
```batch
build.bat
```

#### 4️⃣ Compilar com Console (Debug)
```batch
build_with_console.bat
```

### 🐧 Linux

#### 1️⃣ Instalar Dependências
```bash
cd /home/thiago/Projetos/labs-app/agent
./install.sh
```

#### 2️⃣ Testar Agente (Desenvolvimento)
```bash
# Opção 1: Usar script helper (recomendado)
./run.sh

# Opção 2: Manualmente
source venv/bin/activate
python3 agent.py
```

#### 3️⃣ Executar sem Ambiente Virtual
```bash
python3 agent.py
```

---

## ✅ Após Compilar (Windows)

O executável estará em:
- **Agente:** `dist/LabAgent.exe`
- **Backend:** `../backend/storage/app/public/agent/LabAgent-Setup.exe`

Você poderá baixar pelo painel web em:
`http://localhost:3000/agentes` → **Download do Agente**

---

## 🎯 Ordem de Execução

### Windows:
1. Execute `install.bat` *(apenas uma vez)*
2. Teste com `python agent.py` *(opcional)*
3. Compile com `build.bat` *(para distribuir)*
4. Baixe do painel web *(http://localhost:3000/agentes)*

### Linux:
1. Execute `./install.sh` *(apenas uma vez)*
2. Teste com `./run.sh` ou `python3 agent.py` *(opcional)*
3. O agent funciona diretamente com Python, não precisa compilar

---

## 🔧 Compatibilidade

O LabAgent agora funciona em:
- ✅ **Windows** (via WMI e Registry)
- ✅ **Linux** (via /proc, /sys, dpkg/rpm)
- ✅ **Detecção automática** do sistema operacional

---

**Dúvidas? Consulte `BUILD_INSTRUCTIONS.md` para detalhes completos.**

