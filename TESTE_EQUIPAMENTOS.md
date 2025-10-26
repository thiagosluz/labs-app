# 🧪 Guia de Teste - Módulo de Equipamentos

## ✅ Implementação Completa

### 📦 Funcionalidades Implementadas

#### 1. **Listar Equipamentos** (`/equipamentos`)
- ✅ Tabela com paginação
- ✅ Busca em tempo real (nome, patrimônio, número de série)
- ✅ Badges coloridos para status
- ✅ Ações: Visualizar e Editar
- ✅ Botão "Novo Equipamento"

#### 2. **Criar Equipamento** (`/equipamentos/novo`)
- ✅ Formulário completo com validações
- ✅ Upload de foto com preview
- ✅ Seleção de laboratório
- ✅ Todos os campos do modelo
- ✅ Mensagens de erro e sucesso

#### 3. **Visualizar Detalhes** (`/equipamentos/[id]`)
- ✅ 4 Abas de informações:
  - **Detalhes:** Informações gerais + foto + localização
  - **Softwares:** Lista de softwares instalados
  - **Manutenções:** Histórico de manutenções
  - **Histórico:** Movimentações entre laboratórios
- ✅ Botões de ação: Editar e Excluir
- ✅ Modal de confirmação para exclusão

#### 4. **Editar Equipamento** (`/equipamentos/[id]/editar`)
- ✅ Formulário pré-preenchido
- ✅ Atualização de foto (mantém a antiga se não trocar)
- ✅ Registro automático de movimentação ao trocar de lab
- ✅ Validações

#### 5. **Excluir Equipamento**
- ✅ Modal de confirmação
- ✅ Exclusão da foto do storage
- ✅ Redirecionamento automático

---

## 🧪 Roteiro de Testes

### Pré-requisitos
1. Sistema rodando no Docker
2. Acesso: `http://localhost:3000`
3. Login: `admin@ifg.edu.br` / `password`

---

### Teste 1: Listar Equipamentos

**Passos:**
1. Acesse `http://localhost:3000/equipamentos`
2. Verifique se a tabela carrega com os equipamentos do seed
3. Use o campo de busca para filtrar

**Resultado Esperado:**
- ✅ Tabela com equipamentos
- ✅ Busca funciona em tempo real
- ✅ Badges de status coloridos
- ✅ Botões de ação funcionam

---

### Teste 2: Criar Novo Equipamento

**Passos:**
1. Clique em "Novo Equipamento"
2. Preencha o formulário:
   ```
   Nome: Notebook Dell Inspiron 15
   Tipo: Computador
   Fabricante: Dell
   Modelo: Inspiron 15 3000
   Número de Série: SN2024TEST001
   Patrimônio: PAT2024TEST001
   Data de Aquisição: 24/10/2024
   Estado: Em Uso
   Laboratório: Selecione um
   Especificações: Intel i5-12450H, 8GB RAM, SSD 256GB
   ```
3. Faça upload de uma foto (opcional)
4. Clique em "Criar Equipamento"

**Resultado Esperado:**
- ✅ Toast de sucesso
- ✅ Redirecionamento para `/equipamentos`
- ✅ Equipamento aparece na listagem

---

### Teste 3: Visualizar Detalhes

**Passos:**
1. Na listagem, clique no ícone de "olho" de qualquer equipamento
2. Navegue pelas 4 abas:
   - **Detalhes:** Veja todas as informações
   - **Softwares:** Liste softwares instalados
   - **Manutenções:** Veja manutenções registradas
   - **Histórico:** Veja movimentações

**Resultado Esperado:**
- ✅ Todas as informações são exibidas corretamente
- ✅ Foto aparece (se houver)
- ✅ Abas carregam os dados corretos
- ✅ Datas formatadas em pt-BR

---

### Teste 4: Editar Equipamento

**Passos:**
1. Na página de detalhes, clique em "Editar"
2. Altere alguns campos:
   - Mude o estado para "Manutenção"
   - Troque o laboratório
   - Atualize as especificações
3. Troque a foto (opcional)
4. Clique em "Salvar Alterações"

**Resultado Esperado:**
- ✅ Toast de sucesso
- ✅ Redirecionamento para página de detalhes
- ✅ Alterações refletidas
- ✅ Se trocou de laboratório, um registro aparece no histórico

---

### Teste 5: Excluir Equipamento

**Passos:**
1. Na página de detalhes, clique em "Excluir"
2. Confirme no modal
3. Verifique o redirecionamento

**Resultado Esperado:**
- ✅ Modal de confirmação aparece
- ✅ Toast de sucesso
- ✅ Redirecionamento para `/equipamentos`
- ✅ Equipamento não aparece mais na lista
- ✅ Foto foi removida do storage

---

### Teste 6: Upload de Foto

**Passos:**
1. Criar/editar equipamento
2. Fazer upload de uma foto > 2MB
3. Fazer upload de uma foto válida
4. Visualizar preview
5. Remover foto (clique no X)
6. Salvar

**Resultado Esperado:**
- ✅ Fotos > 2MB são rejeitadas com mensagem de erro
- ✅ Preview aparece corretamente
- ✅ Botão X remove a foto
- ✅ Foto é salva e aparece nos detalhes
- ✅ URL: `http://localhost:8000/storage/equipamentos/...`

---

### Teste 7: Validações

**Passos:**
1. Tente criar equipamento sem preencher campos obrigatórios
2. Tente usar número de série duplicado
3. Tente usar patrimônio duplicado

**Resultado Esperado:**
- ✅ Campos obrigatórios são validados
- ✅ Mensagens de erro do Laravel aparecem
- ✅ Formulário não é enviado se inválido

---

### Teste 8: Registro de Movimentação

**Passos:**
1. Edite um equipamento que está em um laboratório
2. Mude para outro laboratório
3. Salve
4. Vá para a aba "Histórico"

**Resultado Esperado:**
- ✅ Nova movimentação aparece no histórico
- ✅ Mostra origem e destino
- ✅ Mostra usuário que fez a movimentação
- ✅ Data e hora corretas

---

## 🔐 Testes de Permissão

### Como Tecnico (`tecnico@ifg.edu.br` / `password`)
- ✅ Pode criar equipamentos
- ✅ Pode editar equipamentos
- ✅ Pode excluir equipamentos
- ✅ Pode visualizar tudo

### Como Visualizador (`visualizador@ifg.edu.br` / `password`)
- ✅ Pode visualizar equipamentos
- ❌ Não pode criar (botão não aparece)
- ❌ Não pode editar (botão não aparece)
- ❌ Não pode excluir (botão não aparece)

---

## 🐛 Troubleshooting

### Erro: "XSRF token não encontrado"
**Solução:** Limpe os cookies e faça logout/login novamente

### Erro: "Failed to load resource: 500"
**Solução:** Verifique logs do Laravel:
```bash
docker-compose logs backend
```

### Foto não aparece
**Solução:** Verifique se o storage link foi criado:
```bash
docker-compose exec backend php artisan storage:link
```

### Erro: "Select.Item must have a value prop that is not an empty string"
**Solução:** Já corrigido! O Select de laboratório agora usa `value="0"` para "Nenhum Laboratório" ao invés de string vazia.

### Frontend não carrega mudanças
**Solução:** Reinicie o container:
```bash
docker-compose restart frontend
```

---

## 📊 Checklist de Testes

### Funcionalidades
- [ ] Listar equipamentos
- [ ] Buscar equipamentos
- [ ] Criar novo equipamento
- [ ] Upload de foto
- [ ] Visualizar detalhes
- [ ] Editar equipamento
- [ ] Excluir equipamento
- [ ] Histórico de movimentações

### UX/UI
- [ ] Formulários responsivos
- [ ] Validações funcionam
- [ ] Mensagens de erro/sucesso
- [ ] Loading states
- [ ] Botões desabilitados quando loading
- [ ] Modal de confirmação
- [ ] Preview de imagem
- [ ] Badges coloridos
- [ ] Abas funcionam

### Backend
- [ ] API retorna dados corretos
- [ ] Validações funcionam
- [ ] Upload de arquivo funciona
- [ ] Storage link configurado
- [ ] Movimentações são registradas
- [ ] Policies funcionam

---

## 🎯 Resultado Esperado

Ao final dos testes, você deve conseguir:

1. ✅ Criar equipamentos com todos os campos
2. ✅ Fazer upload de fotos
3. ✅ Visualizar detalhes completos com abas
4. ✅ Editar qualquer campo
5. ✅ Excluir equipamentos
6. ✅ Ver histórico de movimentações
7. ✅ Ver softwares e manutenções relacionados

---

## 📝 Notas Técnicas

### Tecnologias Usadas

**Frontend:**
- Next.js 15 (App Router)
- React Server Components
- TailwindCSS + shadcn/ui
- Zustand (estado)
- Axios (HTTP)
- date-fns (datas)

**Backend:**
- Laravel 12
- PostgreSQL
- Sanctum (autenticação)
- Policies (autorização)
- Storage (arquivos)

### Arquivos Criados

```
frontend/app/(dashboard)/equipamentos/
├── page.tsx                    # Listagem
├── novo/
│   └── page.tsx               # Criar
└── [id]/
    ├── page.tsx               # Visualizar
    └── editar/
        └── page.tsx           # Editar
```

### Integração Backend

Todas as rotas usam a API REST:

```
GET    /api/v1/equipamentos          # Listar
POST   /api/v1/equipamentos          # Criar
GET    /api/v1/equipamentos/{id}     # Visualizar
PUT    /api/v1/equipamentos/{id}     # Editar
DELETE /api/v1/equipamentos/{id}     # Excluir
```

---

**Data:** 24/10/2025  
**Desenvolvido para:** IFG Câmpus Jataí  
**Status:** ✅ Pronto para Produção

