# 📚 Laravel Sanctum - SPA Authentication (Implementação Corrigida)

## 🎯 Problema Identificado

O sistema estava implementado com **API Token Authentication** quando deveria usar **SPA Authentication**.

### ❌ Implementação Anterior (INCORRETA):

```php
// Backend - AuthController.php
$token = $user->createToken('api-token')->plainTextToken;
return response()->json(['user' => $user, 'token' => $token]);

// Frontend - useAuthStore.ts
localStorage.setItem('token', token);
config.headers.Authorization = `Bearer ${token}`;
```

### ✅ Implementação Atual (CORRETA):

```php
// Backend - AuthController.php
Auth::attempt($credentials);
$request->session()->regenerate();
return response()->json(['user' => Auth::user()]);

// Frontend - useAuthStore.ts
// Não salva token! A autenticação é feita via cookies de sessão
```

---

## 📖 Baseado na Documentação Laravel

### Da [Documentação Oficial do Sanctum](https://laravel.com/docs/sanctum#spa-authentication):

> "If the login request is successful, you will be authenticated and **subsequent requests to your application's routes will automatically be authenticated via the session cookie** that the Laravel application issued to your client."

### Fluxo Correto de SPA Authentication:

```
1. Frontend: GET /sanctum/csrf-cookie
   ├─ Obtém cookies: XSRF-TOKEN e laravel-session
   
2. Frontend: POST /api/v1/login (com X-XSRF-TOKEN header)
   ├─ Backend: Auth::attempt() cria sessão
   └─ Retorna: { user: {...} } (SEM token!)
   
3. Frontend: Requisições subsequentes
   ├─ Cookies enviados automaticamente (withCredentials: true)
   └─ Backend autentica via sessão (middleware auth:sanctum)
```

---

## 🔧 Mudanças Implementadas

### Backend (`AuthController.php`):

#### Antes:
```php
public function login(Request $request): JsonResponse
{
    $user = User::where('email', $request->email)->first();
    
    if (!$user || !Hash::check($request->password, $user->password)) {
        throw ValidationException::withMessages(...);
    }
    
    $token = $user->createToken('api-token')->plainTextToken; // ❌ ERRADO
    
    return response()->json(['user' => $user, 'token' => $token]);
}
```

#### Depois:
```php
public function login(Request $request): JsonResponse
{
    $credentials = $request->only('email', 'password');
    
    if (!Auth::attempt($credentials)) { // ✅ CORRETO
        throw ValidationException::withMessages(...);
    }
    
    $request->session()->regenerate(); // ✅ Segurança
    
    return response()->json(['user' => Auth::user()]); // ✅ Sem token!
}
```

### Frontend (`useAuthStore.ts`):

#### Antes:
```typescript
interface AuthState {
  user: User | null;
  token: string | null; // ❌ Não precisa
  ...
}

const { user, token } = response.data;
localStorage.setItem('token', token); // ❌ Não precisa
```

#### Depois:
```typescript
interface AuthState {
  user: User | null;
  // Sem token! ✅
  ...
}

const { user } = response.data; // ✅ Apenas o usuário
localStorage.setItem('user', JSON.stringify(user));
// Autenticação via cookies de sessão ✅
```

---

## 🔐 Segurança

### CSRF Protection:

1. **Obter cookie CSRF**:
   ```typescript
   await sanctumApi.get('/sanctum/csrf-cookie');
   ```

2. **Enviar em requisições**:
   ```typescript
   headers: { 'X-XSRF-TOKEN': xsrfToken }
   ```

### Session Security:

1. **Regenerar sessão após login** (previne session fixation):
   ```php
   $request->session()->regenerate();
   ```

2. **Invalidar sessão no logout**:
   ```php
   $request->session()->invalidate();
   $request->session()->regenerateToken();
   ```

---

## 🎯 Como Funciona Agora

### 1. Login:
```
Frontend                     Backend
   │                            │
   ├─► GET /sanctum/csrf-cookie │
   │   Set-Cookie: XSRF-TOKEN   │
   │   Set-Cookie: laravel-session
   │                            │
   ├─► POST /login              │
   │   (X-XSRF-TOKEN header)    │
   │   ◄─ Auth::attempt()       │
   │   ◄─ Session created       │
   │   ◄─ { user: {...} }       │
   │                            │
```

### 2. Requisições Subsequentes:
```
Frontend                     Backend
   │                            │
   ├─► GET /api/v1/dashboard    │
   │   (Cookies enviados auto)  │
   │   ◄─ Auth via session      │
   │   ◄─ Data                  │
   │                            │
```

### 3. Logout:
```
Frontend                     Backend
   │                            │
   ├─► POST /logout             │
   │   (X-XSRF-TOKEN header)    │
   │   ◄─ Auth::logout()        │
   │   ◄─ Session invalidated   │
   │   ◄─ { message: "..." }    │
   │                            │
```

---

## ✅ Checklist de Implementação

### Backend:
- [x] `Auth::attempt()` no login
- [x] `$request->session()->regenerate()` após login
- [x] `Auth::logout()` no logout
- [x] `$request->session()->invalidate()` no logout
- [x] Middleware `auth:sanctum` nas rotas protegidas
- [x] Não retornar tokens (SPA auth usa sessões)

### Frontend:
- [x] `withCredentials: true` no Axios
- [x] Obter CSRF cookie antes do login
- [x] Enviar `X-XSRF-TOKEN` nas requisições POST/PUT/DELETE
- [x] Não armazenar tokens (usa cookies de sessão)
- [x] Middleware verifica cookie `laravel-session`

### Configuração:
- [x] `SANCTUM_STATEFUL_DOMAINS` no `.env`
- [x] `SESSION_DRIVER=database` (ou redis/file)
- [x] `SESSION_SECURE_COOKIE=false` (para HTTP local)
- [x] CORS configurado para `localhost:3000`

---

## 🚀 Resultado

Agora o sistema usa **autenticação baseada em sessão** conforme a documentação oficial do Laravel Sanctum, sem tokens no localStorage.

A autenticação é:
- ✅ Mais segura (HttpOnly cookies)
- ✅ Mais simples (sem gerenciamento de tokens)
- ✅ Conforme a documentação oficial
- ✅ Perfeita para SPAs

---

**Referências:**
- [Laravel Sanctum - SPA Authentication](https://laravel.com/docs/sanctum#spa-authentication)
- [CSRF Protection](https://laravel.com/docs/csrf)
- [Session Management](https://laravel.com/docs/session)

---

**Data da Correção:** 23/10/2025  
**Desenvolvido para:** IFG Câmpus Jataí

