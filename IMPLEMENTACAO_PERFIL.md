# 👤 Implementação da Página de Perfil

## 📋 Visão Geral

Página completa de gerenciamento de perfil do usuário, permitindo edição de informações pessoais e alteração de senha com validações e feedback visual profissional.

---

## 🎯 Funcionalidades

### **1. Edição de Informações Pessoais** ✏️

```tsx
<form onSubmit={handleUpdateProfile}>
  <Input id="name" value={profileForm.name} />
  <Input id="email" type="email" value={profileForm.email} />
  <Button type="submit">Salvar Alterações</Button>
</form>
```

**Características:**
- ✅ Nome completo editável
- ✅ Email editável (com validação de unicidade)
- ✅ Loading spinner durante atualização
- ✅ Toast de feedback
- ✅ Atualiza estado global (Zustand store)

---

### **2. Alteração de Senha** 🔐

```tsx
<form onSubmit={handleUpdatePassword}>
  <Input id="password" type="password" placeholder="Mínimo 8 caracteres" />
  <Input id="password_confirmation" type="password" />
  <Button type="submit">Atualizar Senha</Button>
</form>
```

**Validações:**
- ✅ Senha mínima de 8 caracteres
- ✅ Confirmação de senha deve coincidir
- ✅ Campo opcional (só atualiza se preenchido)
- ✅ Limpa formulário após sucesso

**Mensagens de erro:**
```tsx
if (password.length < 8) {
  toast.error('A senha deve ter no mínimo 8 caracteres');
}

if (password !== password_confirmation) {
  toast.error('As senhas não coincidem');
}
```

---

### **3. Sidebar Informativa** 📊

**Informações Exibidas:**
- 👤 **Nome** - Nome completo do usuário
- 📧 **Email** - Email cadastrado
- 🏷️ **Tipo de Conta** - Badge colorido (Admin/Técnico/Visualizador)
- 🟢 **Status** - Badge (Ativa/Inativa)
- 💡 **Dicas de Segurança** - Card informativo

**Badges por Tipo:**
```tsx
const roles = {
  admin: { variant: 'default', label: 'Administrador' },
  tecnico: { variant: 'secondary', label: 'Técnico' },
  visualizador: { variant: 'destructive', label: 'Visualizador' },
};
```

---

## 🎨 Interface Visual

### **Layout Responsivo**

#### **Desktop (lg: 3 colunas)**
```
┌────────────────────────────┬──────────────┐
│  Informações Pessoais      │   Sidebar    │
│  [Nome]                    │   Conta      │
│  [Email]                   │   - Nome     │
│  [Salvar]                  │   - Email    │
├────────────────────────────┤   - Tipo     │
│  Segurança                 │   - Status   │
│  [Nova Senha]              │              │
│  [Confirmar]               │   Dicas      │
│  [Atualizar]               │   - Senha    │
└────────────────────────────┴──────────────┘
```

#### **Mobile (Empilhado)**
```
┌──────────────────────┐
│ Informações Pessoais │
│ [Nome]               │
│ [Email]              │
│ [Salvar]             │
├──────────────────────┤
│ Segurança            │
│ [Nova Senha]         │
│ [Confirmar]          │
│ [Atualizar]          │
├──────────────────────┤
│ Conta                │
│ - Nome               │
│ - Email              │
│ - Tipo               │
│ - Status             │
├──────────────────────┤
│ Dicas                │
└──────────────────────┘
```

---

### **Cards e Seções**

#### **Card de Informações Pessoais**
```tsx
<Card>
  <CardHeader>
    <CardTitle>
      <User className="h-5 w-5" />
      Informações Pessoais
    </CardTitle>
    <CardDescription>Atualize seu nome e email</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Formulário */}
  </CardContent>
</Card>
```

#### **Card de Segurança**
```tsx
<Card>
  <CardHeader>
    <CardTitle>
      <Lock className="h-5 w-5" />
      Segurança
    </CardTitle>
    <CardDescription>Altere sua senha de acesso</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Formulário de senha */}
  </CardContent>
</Card>
```

#### **Card de Conta**
```tsx
<Card>
  <CardHeader>
    <CardTitle>
      <Shield className="h-5 w-5" />
      Conta
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div>Nome: {user.name}</div>
    <Separator />
    <div>Email: {user.email}</div>
    <Separator />
    <div>Tipo: {getRoleBadge(user.role)}</div>
    <Separator />
    <div>Status: <Badge>{user.active ? 'Ativa' : 'Inativa'}</Badge></div>
  </CardContent>
</Card>
```

#### **Card de Dicas**
```tsx
<Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
  <CardHeader>
    <CardTitle>
      <Mail className="h-4 w-4" />
      Dica de Segurança
    </CardTitle>
  </CardHeader>
  <CardContent>
    <ul>
      <li>Use uma senha forte e única</li>
      <li>Não compartilhe suas credenciais</li>
      <li>Altere sua senha regularmente</li>
    </ul>
  </CardContent>
</Card>
```

---

## 🔄 Fluxo de Atualização

### **Atualizar Perfil**

| Etapa | Ação | Feedback Visual |
|-------|------|-----------------|
| 1 | Usuário altera nome/email | - |
| 2 | Clica em "Salvar Alterações" | Botão: Spinner + "Salvando..." |
| 3 | `setIsLoadingProfile(true)` | Botão disabled |
| 4 | Toast loading aparece | "⏳ Atualizando perfil..." |
| 5 | `api.put('/profile', data)` | Requisição ao backend |
| 6 | Backend valida e atualiza | - |
| 7 | `setUser(response.data)` | Atualiza Zustand store |
| 8 | Toast de sucesso | "✅ Perfil atualizado!" |
| 9 | `setIsLoadingProfile(false)` | Botão volta ao normal |

**Tempo total:** ~1-2 segundos

---

### **Atualizar Senha**

| Etapa | Ação | Feedback Visual |
|-------|------|-----------------|
| 1 | Usuário digita nova senha | - |
| 2 | Usuário confirma senha | - |
| 3 | Clica em "Atualizar Senha" | Validações frontend |
| 4 | ✅ Senha >= 8 caracteres | - |
| 5 | ✅ Senhas coincidem | - |
| 6 | `setIsLoadingPassword(true)` | Botão: Spinner + "Atualizando..." |
| 7 | Toast loading | "⏳ Atualizando senha..." |
| 8 | `api.put('/profile', { password })` | Requisição ao backend |
| 9 | Backend hasheia e salva | `Hash::make($password)` |
| 10 | Limpa formulário | Campos de senha vazios |
| 11 | Toast de sucesso | "✅ Senha atualizada!" |
| 12 | `setIsLoadingPassword(false)` | Botão volta ao normal |

**Tempo total:** ~1-2 segundos

---

## 🛡️ Segurança

### **1. CSRF Protection**
```tsx
const xsrfToken = getXsrfToken();

await api.put('/profile', data, {
  headers: {
    ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
  },
});
```

### **2. Validação Backend**
```php
$request->validate([
    'name' => 'sometimes|string|max:255',
    'email' => 'sometimes|email|unique:users,email,' . $request->user()->id,
    'password' => 'sometimes|min:8|confirmed',
]);
```

**Regras:**
- ✅ `sometimes` - Campo opcional, só valida se presente
- ✅ `unique:users,email,{id}` - Email único, exceto o do próprio usuário
- ✅ `confirmed` - Verifica se `password_confirmation` existe e coincide
- ✅ Senha é hasheada com `Hash::make()`

### **3. Validação Frontend**
```tsx
// Senha mínima
if (passwordForm.password.length < 8) {
  toast.error('A senha deve ter no mínimo 8 caracteres');
  return;
}

// Senhas coincidem
if (passwordForm.password !== passwordForm.password_confirmation) {
  toast.error('As senhas não coincidem');
  return;
}
```

---

## 📊 Estados de Loading

### **Estado Global**
```tsx
const [isLoadingProfile, setIsLoadingProfile] = useState(false);
const [isLoadingPassword, setIsLoadingPassword] = useState(false);
```

**Por que separado?**
- Permite atualizar perfil e senha independentemente
- Botões têm spinners independentes
- UX mais clara (usuário sabe o que está processando)

---

## 🎯 Tratamento de Erros

### **Erros de Validação Backend**
```tsx
catch (error: any) {
  toast.error('Erro ao atualizar perfil', {
    id: toastId,
    description: error.response?.data?.message || 'Tente novamente mais tarde',
  });
}
```

**Exemplos de erros:**
- ❌ Email já cadastrado
- ❌ Senha muito curta
- ❌ Senha e confirmação não coincidem (backend)

### **Erros de Rede**
- Toast mostra mensagem genérica
- Loading é removido (graças ao `finally`)
- Usuário pode tentar novamente

---

## 🎨 Ícones Utilizados

| Ícone | Uso | Contexto |
|-------|-----|----------|
| `User` | Informações Pessoais | Card header |
| `Lock` | Segurança / Senha | Card header + botão |
| `Shield` | Conta | Card header |
| `Mail` | Dicas | Card de dicas |
| `Save` | Salvar | Botão de salvar perfil |
| `Loader2` | Loading | Spinner animado |

**Todos do Lucide React**

---

## 🔧 Componentes Utilizados

### **shadcn/ui**
- ✅ `Button` - Botões com variantes
- ✅ `Input` - Campos de texto/email/senha
- ✅ `Label` - Labels dos campos
- ✅ `Card` / `CardHeader` / `CardContent` / `CardTitle` / `CardDescription`
- ✅ `Badge` - Badges de tipo e status
- ✅ `Separator` - Separadores visuais

### **Biblioteca de Toast**
- ✅ `toast.loading()` - Toast com loading
- ✅ `toast.success()` - Toast de sucesso
- ✅ `toast.error()` - Toast de erro
- ✅ Usa `id` para substituir toasts (não duplica)

### **State Management**
- ✅ `useAuthStore` - Zustand store para usuário autenticado
- ✅ `setUser()` - Atualiza usuário após edição

---

## 🧪 Casos de Teste

### **Teste 1: Atualizar Nome**
1. Acessar `/perfil`
2. Alterar campo "Nome Completo"
3. Clicar em "Salvar Alterações"
4. ✅ Toast "Atualizando perfil..."
5. ✅ Toast "Perfil atualizado com sucesso!"
6. ✅ Nome atualizado na sidebar
7. ✅ Nome atualizado no header (se exibir)

### **Teste 2: Atualizar Email**
1. Alterar campo "Email"
2. Clicar em "Salvar Alterações"
3. ✅ Email atualizado
4. ✅ Validação de email único (se já existir, erro)

### **Teste 3: Atualizar Senha - Sucesso**
1. Digitar nova senha (mín. 8 caracteres)
2. Confirmar senha (idêntica)
3. Clicar em "Atualizar Senha"
4. ✅ Toast "Atualizando senha..."
5. ✅ Toast "Senha atualizada com sucesso!"
6. ✅ Campos de senha limpos

### **Teste 4: Atualizar Senha - Erro (senha curta)**
1. Digitar senha com menos de 8 caracteres
2. Clicar em "Atualizar Senha"
3. ✅ Toast de erro: "A senha deve ter no mínimo 8 caracteres"
4. ❌ Não envia requisição ao backend

### **Teste 5: Atualizar Senha - Erro (senhas não coincidem)**
1. Digitar senha: "senha12345"
2. Confirmar senha: "senha54321"
3. Clicar em "Atualizar Senha"
4. ✅ Toast de erro: "As senhas não coincidem"
5. ❌ Não envia requisição ao backend

### **Teste 6: Responsividade**
1. Desktop (>1024px): Layout 3 colunas
2. Tablet (768-1024px): Layout 2 colunas
3. Mobile (<768px): Layout empilhado
4. ✅ Tudo visível e acessível

---

## 🆚 Comparação com Outras Páginas

| Aspecto | Outras Páginas | Página de Perfil |
|---------|----------------|-------------------|
| **Layout** | Lista/Grid | Cards em colunas |
| **Formulários** | Formulário único | 2 formulários separados |
| **Sidebar** | Não | Sim (informações da conta) |
| **Validações** | Backend | Frontend + Backend |
| **Loading States** | 1 estado | 2 estados independentes |
| **Ícones** | Poucos | Muitos (cada seção) |
| **Cards Informativos** | Não | Sim (dicas de segurança) |

---

## 📱 Responsividade Detalhada

### **Desktop (>= 1024px)**
```css
grid-cols-3
```
- 2 colunas para formulários (lg:col-span-2)
- 1 coluna para sidebar

### **Tablet (768px - 1024px)**
```css
grid-cols-1
```
- Tudo empilhado
- Sidebar abaixo dos formulários

### **Mobile (< 768px)**
```css
grid-cols-1
```
- Inputs com largura total
- Botões com largura total (`w-full`)
- Cards empilhados

---

## 🏆 Melhores Práticas Implementadas

✅ **Separação de Concerns** - Perfil e senha em formulários separados  
✅ **Loading States** - Estados independentes para cada ação  
✅ **Error Handling** - Validações frontend antes de enviar  
✅ **User Feedback** - Toasts em todas as ações  
✅ **Accessibility** - Labels, placeholders, disabled states  
✅ **Security** - CSRF token, senha hasheada, validações  
✅ **Responsive Design** - Layout adaptativo  
✅ **Clean Code** - Componentes reutilizáveis, código organizado  

---

## 📊 Resumo Técnico

### **Endpoint Backend**
```
PUT /api/v1/profile
```

**Parâmetros aceitos:**
```json
{
  "name": "string|max:255",
  "email": "email|unique",
  "password": "min:8|confirmed",
  "password_confirmation": "string"
}
```

**Resposta de Sucesso:**
```json
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@ifg.edu.br",
  "role": "admin",
  "active": true
}
```

---

### **Rota Frontend**
```
/perfil → frontend/app/(dashboard)/perfil/page.tsx
```

**Dependências:**
- `@/lib/api` - Axios configurado
- `@/lib/csrf` - Token CSRF
- `@/store/useAuthStore` - Estado global do usuário
- `@/components/ui/*` - Componentes shadcn/ui
- `sonner` - Toasts

---

## 🎓 Aprendizados

### **1. Formulários Independentes**
```tsx
// ❌ Evite formulário único para tudo
<form onSubmit={handleSubmitAll}>
  <Input name />
  <Input email />
  <Input password />
</form>

// ✅ Separe por contexto
<form onSubmit={handleUpdateProfile}>
  <Input name />
  <Input email />
</form>

<form onSubmit={handleUpdatePassword}>
  <Input password />
  <Input password_confirmation />
</form>
```

**Benefícios:**
- Loading states independentes
- UX mais clara
- Validações específicas
- Usuário pode atualizar só o que deseja

### **2. Validações em Camadas**
```
Frontend → Backend → Database
   ↓          ↓          ↓
  UX      Segurança   Integridade
```

### **3. Feedback Visual Progressivo**
```
Ação → Loading → Processamento → Resultado
  ↓        ↓            ↓           ↓
Clique  Spinner      Backend    Success/Error
```

---

## 🚀 Resultado Final

**Página de perfil completa e profissional com:**
- ✅ Edição de informações pessoais
- ✅ Alteração de senha segura
- ✅ Validações robustas
- ✅ Feedback visual completo
- ✅ Layout responsivo
- ✅ Cards informativos
- ✅ Dicas de segurança
- ✅ Dark mode suportado

**Sistema pronto para produção!** 🎉

---

**Desenvolvido para:** IFG Câmpus Jataí  
**Data:** 24/10/2025  
**Rota:** `/perfil`  
**Status:** ✅ **IMPLEMENTADO E FUNCIONANDO**

