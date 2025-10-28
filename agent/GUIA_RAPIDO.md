# 🚀 Guia Rápido - LabAgent

## Problema 1: ModuleNotFoundError: No module named 'wmi'

### ✅ Solução:
```batch
cd C:\Users\thiago\Projetos\labs-app\agent
install.bat
```

Isso instala todas as dependências necessárias.

---

## Problema 2: "Agente não disponível" ao baixar

### ✅ Solução:
```batch
cd C:\Users\thiago\Projetos\labs-app\agent
build.bat
```

Isso compila o agente e copia automaticamente para o backend.

---

## 📋 Resumo dos Comandos

### 1️⃣ Instalar Dependências
```batch
cd C:\Users\thiago\Projetos\labs-app\agent
install.bat
```

### 2️⃣ Testar Agente (Desenvolvimento)
```batch
python agent.py
```

### 3️⃣ Compilar Executável (Produção)
```batch
build.bat
```

### 4️⃣ Compilar com Console (Debug)
```batch
build_with_console.bat
```

---

## ✅ Após Compilar

O executável estará em:
- **Agente:** `dist/LabAgent.exe`
- **Backend:** `../backend/storage/app/public/agent/LabAgent-Setup.exe`

Você poderá baixar pelo painel web em:
`http://localhost:3000/agentes` → **Download do Agente**

### Configuração em Produção
Quando executar o agente pela primeira vez, ele solicitará:
1. **URL do servidor** (ex: `http://192.168.1.100`)
2. **API Key** (fornecida pelo administrador)
3. **ID do Laboratório** (específico de cada computador)

---

## 🎯 Ordem de Execução

1. Execute `install.bat` *(apenas uma vez)*
2. Teste com `python agent.py` *(opcional)*
3. Compile com `build.bat` *(para distribuir)*
4. Baixe do painel web *(http://localhost:3000/agentes)*

---

**Dúvidas? Consulte `BUILD_INSTRUCTIONS.md` para detalhes completos.**

