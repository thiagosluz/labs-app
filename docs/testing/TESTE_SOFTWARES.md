# 🧪 Guia de Teste - Módulo de Softwares

## ✅ Implementação Completa

### 💿 Funcionalidades Implementadas

#### 1. **Listar Softwares** (`/softwares`)
- ✅ Grid de cards responsivo (3 colunas)
- ✅ Busca em tempo real (nome, fabricante)
- ✅ Badges coloridos por tipo de licença
- ✅ Informações em cada card: versão, fabricante, quantidade de licenças, data de expiração
- ✅ Botão "Ver Detalhes" em cada card
- ✅ Botão "Novo Software"

#### 2. **Criar Software** (`/softwares/novo`)
- ✅ Formulário completo com validações
- ✅ Campos: nome, versão, fabricante, tipo de licença
- ✅ Licenciamento: quantidade (opcional), data de expiração (opcional)
- ✅ Descrição detalhada
- ✅ Layout 2 colunas + sidebar com dicas
- ✅ Mensagens de erro e sucesso

#### 3. **Visualizar Detalhes** (`/softwares/[id]`)
- ✅ **3 Abas:**
  - **Detalhes:** Informações gerais + licenciamento + datas
  - **Equipamentos:** Lista de equipamentos que têm o software instalado
  - **Laboratórios:** Lista de laboratórios que usam o software
- ✅ **Alertas Visuais:**
  - Licença expirada (card vermelho)
  - Licença expirando em 30 dias (card amarelo)
- ✅ Botões: Editar e Excluir
- ✅ Modal de confirmação para exclusão
- ✅ Links clicáveis para equipamentos e laboratórios

#### 4. **Editar Software** (`/softwares/[id]/editar`)
- ✅ Formulário pré-preenchido
- ✅ Validações
- ✅ Layout idêntico ao criar

---

## 🧪 Roteiro de Testes Detalhado

### Pré-requisitos
1. Sistema rodando no Docker
2. Acesso: `http://localhost:3000`
3. Login: `admin@ifg.edu.br` / `password`

---

### 📋 Teste 1: Listar Softwares

**Passos:**
1. Acesse `http://localhost:3000/softwares`
2. Observe o grid de cards
3. Use o campo de busca para filtrar

**Resultado Esperado:**
- ✅ Cards organizados em grid (3 colunas em desktop)
- ✅ Cada card mostra: nome, versão, tipo de licença, licenças, expiração
- ✅ Busca funciona em tempo real
- ✅ Badges coloridos:
  - Livre: azul
  - Educacional: cinza
  - Proprietário: outline

**Screenshot Conceitual:**
```
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ Office 365     │  │ Photoshop CC   │  │ AutoCAD 2024   │
│ 📦 2024        │  │ 📦 2023        │  │ 📦 2024        │
│ [Educacional]  │  │ [Proprietário] │  │ [Proprietário] │
│ Licenças: 50   │  │ Licenças: 10   │  │ Licenças: 5    │
│ Expira: 15/12  │  │ Expira: 20/11  │  │ Expira: -      │
│ [Ver Detalhes] │  │ [Ver Detalhes] │  │ [Ver Detalhes] │
└────────────────┘  └────────────────┘  └────────────────┘
```

---

### 📋 Teste 2: Criar Novo Software

**Passos:**
1. Clique em "Novo Software"
2. Preencha o formulário:
   ```
   Nome: Adobe Photoshop
   Versão: 2024
   Fabricante: Adobe
   Tipo de Licença: Proprietário
   Quantidade de Licenças: 10
   Data de Expiração: (30 dias a partir de hoje)
   Descrição: Software de edição de imagens profissional
   ```
3. Clique em "Criar Software"

**Resultado Esperado:**
- ✅ Toast de sucesso
- ✅ Redirecionamento para `/softwares`
- ✅ Novo software aparece na listagem

---

### 📋 Teste 3: Visualizar Detalhes (com Abas)

**Passos:**
1. Na listagem, clique em "Ver Detalhes" de qualquer software
2. **Aba Detalhes:**
   - Veja informações gerais
   - Observe o card de licenciamento (lado direito)
   - Veja as datas de criação/atualização
3. **Aba Equipamentos:**
   - Veja lista de equipamentos
   - Clique em um link de equipamento (deve navegar)
4. **Aba Laboratórios:**
   - Veja lista de laboratórios
   - Clique em um link de laboratório (deve navegar)

**Resultado Esperado:**
- ✅ Todas as 3 abas funcionam
- ✅ Informações corretas em cada aba
- ✅ Links clicáveis funcionam
- ✅ Layout responsivo

---

### 📋 Teste 4: Alertas de Expiração ⚠️

**Teste 4.1: Licença Expirando (Alerta Amarelo)**

**Passos:**
1. Crie um software com data de expiração em 15 dias
2. Vá para a página de detalhes

**Resultado Esperado:**
- ✅ Card amarelo no topo da página
- ✅ Ícone de alerta
- ✅ Mensagem: "A licença deste software expira em DD/MM/AAAA"

**Screenshot Conceitual:**
```
┌─────────────────────────────────────────────────┐
│ ⚠️  LICENÇA EXPIRANDO EM 15 DIAS! ⚠️           │
│                                                 │
│ A licença deste software expira em 08/11/2024. │
│ Providencie a renovação com antecedência.      │
└─────────────────────────────────────────────────┘
```

**Teste 4.2: Licença Expirada (Alerta Vermelho)**

**Passos:**
1. Edite um software existente
2. Coloque data de expiração no passado (ex: 01/01/2024)
3. Salve e vá para detalhes

**Resultado Esperado:**
- ✅ Card vermelho no topo da página
- ✅ Ícone de alerta
- ✅ Mensagem: "A licença deste software expirou em DD/MM/AAAA"

---

### 📋 Teste 5: Editar Software

**Passos:**
1. Na página de detalhes, clique em "Editar"
2. Altere alguns campos:
   - Mude a versão para "2025"
   - Aumente a quantidade de licenças
   - Altere a descrição
3. Clique em "Salvar Alterações"

**Resultado Esperado:**
- ✅ Toast de sucesso
- ✅ Redirecionamento para página de detalhes
- ✅ Alterações refletidas corretamente

---

### 📋 Teste 6: Excluir Software

**Passos:**
1. Na página de detalhes, clique em "Excluir"
2. Leia o modal de confirmação
3. Confirme a exclusão

**Resultado Esperado:**
- ✅ Modal aparece com mensagem de confirmação
- ✅ Toast de sucesso após confirmar
- ✅ Redirecionamento para `/softwares`
- ✅ Software não aparece mais na lista

---

### 📋 Teste 7: Busca em Tempo Real

**Passos:**
1. Na listagem, comece a digitar no campo de busca
2. Digite "Office"
3. Digite "Adobe"
4. Digite "Microsoft"

**Resultado Esperado:**
- ✅ Resultados filtram em tempo real
- ✅ Busca funciona para nome e fabricante
- ✅ Nenhum reload de página

---

### 📋 Teste 8: Licenciamento Flexível

**Teste 8.1: Licenças Limitadas**
```
Quantidade: 50
Resultado: Mostra "50" no card de licenciamento
```

**Teste 8.2: Licenças Ilimitadas**
```
Quantidade: (deixar em branco)
Resultado: Mostra "Ilimitadas" no card de licenciamento
```

---

## 🔐 Testes de Permissão

### Como Admin (`admin@ifg.edu.br`)
- ✅ Pode criar softwares
- ✅ Pode editar softwares
- ✅ Pode excluir softwares
- ✅ Pode visualizar tudo

### Como Técnico (`tecnico@ifg.edu.br`)
- ✅ Pode criar softwares
- ✅ Pode editar softwares
- ✅ Pode excluir softwares
- ✅ Pode visualizar tudo

### Como Visualizador (`visualizador@ifg.edu.br`)
- ✅ Pode visualizar softwares
- ❌ Não pode criar (botão não aparece)
- ❌ Não pode editar (botão não aparece)
- ❌ Não pode excluir (botão não aparece)

---

## 🎨 Teste de Responsividade

### Desktop (> 1024px)
```
✅ Grid com 3 colunas
✅ Sidebar visível
✅ Layout 2 colunas + sidebar nos formulários
```

### Tablet (768px - 1024px)
```
✅ Grid com 2 colunas
✅ Formulário em 2 colunas
```

### Mobile (< 768px)
```
✅ Grid com 1 coluna
✅ Formulário em 1 coluna
✅ Sidebar abaixo do conteúdo principal
```

---

## 🐛 Troubleshooting

### Erro: "XSRF token não encontrado"
**Solução:** Limpe os cookies e faça logout/login novamente

### Erro: "Failed to load resource: 500"
**Solução:** Verifique logs do Laravel:
```bash
docker-compose logs backend
```

### Grid não aparece corretamente
**Solução:** Limpe o cache do navegador (Ctrl + Shift + R)

### Alertas não aparecem
**Solução:** Verifique se a data de expiração está correta e no formato correto

### Frontend não carrega mudanças
**Solução:** Reinicie o container:
```bash
docker-compose restart frontend
```

---

## 📊 Checklist de Testes

### Funcionalidades Básicas
- [ ] Listar softwares
- [ ] Buscar softwares
- [ ] Criar novo software
- [ ] Visualizar detalhes
- [ ] Navegar entre abas
- [ ] Editar software
- [ ] Excluir software

### Recursos Especiais
- [ ] Alerta amarelo (expirando)
- [ ] Alerta vermelho (expirado)
- [ ] Links para equipamentos
- [ ] Links para laboratórios
- [ ] Licenças ilimitadas
- [ ] Licenças limitadas

### UX/UI
- [ ] Grid responsivo
- [ ] Cards com hover
- [ ] Busca em tempo real
- [ ] Validações funcionam
- [ ] Mensagens de erro/sucesso
- [ ] Loading states
- [ ] Modal de confirmação
- [ ] Badges coloridos
- [ ] Toasts aparecem

### Navegação
- [ ] Botão voltar funciona
- [ ] Links clicáveis funcionam
- [ ] Redirecionamentos corretos
- [ ] Breadcrumb implícito

---

## 🎯 Casos de Teste Específicos

### Caso 1: Software Livre sem Expiração
```
Nome: LibreOffice
Tipo: Livre
Quantidade: (vazio = ilimitado)
Expiração: (vazio)

Resultado Esperado:
✅ Badge azul "Livre"
✅ "Ilimitadas" no card de licenças
✅ Sem alertas
✅ Data de expiração: "-"
```

### Caso 2: Software Educacional Expirando
```
Nome: MATLAB
Tipo: Educacional
Quantidade: 100
Expiração: (15 dias a partir de hoje)

Resultado Esperado:
✅ Badge cinza "Educacional"
✅ "100" no card de licenças
✅ Alerta amarelo na página de detalhes
✅ Data destacada
```

### Caso 3: Software Proprietário Expirado
```
Nome: Windows Server
Tipo: Proprietário
Quantidade: 1
Expiração: 01/01/2024 (passado)

Resultado Esperado:
✅ Badge outline "Proprietário"
✅ "1" no card de licenças
✅ Alerta vermelho na página de detalhes
✅ Data em vermelho e negrito
```

---

## 📈 Métricas de Sucesso

Considere o teste bem-sucedido se:

1. ✅ **CRUD Completo:** Criar, ler, atualizar e deletar funcionam
2. ✅ **Alertas:** Expiração detectada e exibida corretamente
3. ✅ **Busca:** Filtragem em tempo real funciona
4. ✅ **Relações:** Links para equipamentos/labs funcionam
5. ✅ **Validações:** Campos obrigatórios são validados
6. ✅ **UI/UX:** Interface responsiva e moderna
7. ✅ **Permissões:** Roles funcionam corretamente
8. ✅ **Performance:** Páginas carregam rapidamente

---

## 📝 Relatório de Teste (Template)

```
DATA DO TESTE: ___/___/_____
TESTADOR: _________________
NAVEGADOR: ________________
RESOLUÇÃO: ________________

RESULTADOS:
[ ] Teste 1: Listar Softwares - OK / FALHOU
[ ] Teste 2: Criar Software - OK / FALHOU
[ ] Teste 3: Visualizar Detalhes - OK / FALHOU
[ ] Teste 4: Alertas de Expiração - OK / FALHOU
[ ] Teste 5: Editar Software - OK / FALHOU
[ ] Teste 6: Excluir Software - OK / FALHOU
[ ] Teste 7: Busca em Tempo Real - OK / FALHOU
[ ] Teste 8: Licenciamento - OK / FALHOU

BUGS ENCONTRADOS:
_________________________________
_________________________________
_________________________________

OBSERVAÇÕES:
_________________________________
_________________________________
_________________________________

APROVADO: [ ] SIM  [ ] NÃO
```

---

## 🎓 Dicas para Testar

1. **Use diferentes navegadores:** Chrome, Firefox, Edge
2. **Teste em diferentes resoluções:** Desktop, tablet, mobile
3. **Teste com diferentes usuários:** Admin, técnico, visualizador
4. **Teste cenários extremos:** 
   - Nome muito longo
   - Quantidade de licenças = 0
   - Data de expiração muito no futuro
5. **Abra o DevTools (F12):** Verifique se não há erros no console

---

**Data:** 24/10/2025  
**Desenvolvido para:** IFG Câmpus Jataí  
**Status:** ✅ Pronto para Testes

---

## 🎊 Conclusão

Se todos os testes passarem, o módulo de Softwares está **100% funcional** e pronto para uso em produção! 🚀

