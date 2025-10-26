# 🔍 Guia de Debug - Relatórios PDF Vazios

## ⚠️ Problema Reportado

Os relatórios de **Equipamentos** e **Manutenções** estão gerando PDFs vazios (sem dados).

---

## ✅ Correções Aplicadas

### **1. Lógica de Filtros Corrigida**

**Antes:**
```php
if ($request->has('tipo') && $request->tipo !== 'todos')
```

**Depois:**
```php
if ($request->filled('tipo') && $request->tipo !== 'todos')
```

**Motivo:** `filled()` verifica se o parâmetro existe E não está vazio, evitando problemas com valores vazios.

### **2. Código Quebrado no softwaresPdf Corrigido**

**Antes:** (linha 124 estava incompleta)
```php
if ($request->has('status_expiracao')) {
    // Faltava a condição if aqui!
    $query->whereNotNull('data_expiracao')
```

**Depois:**
```php
if ($request->filled('status_expiracao') && $request->status_expiracao !== 'todos') {
    if ($request->status_expiracao === 'expirado') {
        $query->whereNotNull('data_expiracao')
```

### **3. Logs de Debug Adicionados**

Agora os métodos `equipamentosPdf` e `manutencoesPdf` logam:
- Total de registros encontrados
- Filtros aplicados

---

## 🧪 Como Testar

### **Passo 1: Gerar um Relatório**

1. Acesse: `http://localhost:3000/relatorios`
2. Login: `admin@ifg.edu.br` / `password`
3. Aba **"Equipamentos"**
4. **NÃO aplique nenhum filtro** (deixe tudo como "Todos")
5. Clique em **"Gerar PDF"**

**Esperado:** PDF com 12 equipamentos

### **Passo 2: Verificar os Logs**

Execute o comando:

```powershell
docker-compose exec backend tail -n 50 storage/logs/laravel.log
```

**Procure por:**
```
[TIMESTAMP] local.INFO: Relatório Equipamentos PDF
{
    "total_equipamentos": 12,
    "filtros": {...}
}
```

Se `total_equipamentos` for **0**, o problema está na query.  
Se `total_equipamentos` for **12**, o problema está na view Blade ou na geração do PDF.

---

## 🔍 Diagnóstico Possíveis Causas

### **Causa 1: Filtros Restritivos**

**Sintoma:** Logs mostram `total_equipamentos: 0`

**Solução:** 
- Não preencha campos de data (deixe vazios)
- Use "Todos" em todos os selects

### **Causa 2: Dados Não Carregados**

**Verificar:**
```powershell
docker-compose exec backend php artisan tinker --execute="echo 'Total: ' . \App\Models\Equipamento::count();"
```

**Esperado:** `Total: 12`

Se for 0, execute:
```powershell
docker-compose exec backend php artisan migrate:fresh --seed
```

### **Causa 3: View Blade com Erro**

**Sintoma:** Logs mostram `total_equipamentos: 12`, mas PDF vazio

**Teste direto:**
```powershell
docker-compose exec backend php artisan tinker --execute="
\$equipamentos = \App\Models\Equipamento::with(['laboratorio'])->get();
\$pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('relatorios.equipamentos', [
    'equipamentos' => \$equipamentos,
    'filtros' => [],
    'data' => now()->format('d/m/Y H:i')
]);
echo 'PDF gerado com sucesso!' . PHP_EOL;
"
```

Se der erro, a view Blade tem problemas.

### **Causa 4: Cache do Laravel**

**Limpar tudo:**
```powershell
docker-compose exec backend php artisan config:clear
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan view:clear
docker-compose exec backend php artisan route:clear
```

---

## 📋 Checklist de Verificação

Execute na ordem:

- [ ] **1. Confirmar dados existem**
  ```powershell
  docker-compose exec backend php artisan tinker --execute="echo 'Equipamentos: ' . \App\Models\Equipamento::count() . PHP_EOL; echo 'Manutenções: ' . \App\Models\Manutencao::count() . PHP_EOL;"
  ```
  **Esperado:** `Equipamentos: 12` e `Manutenções: 3`

- [ ] **2. Gerar relatório SEM filtros**
  - Ir em `/relatorios`
  - Não preencher datas
  - Deixar tudo como "Todos"
  - Gerar PDF

- [ ] **3. Verificar logs**
  ```powershell
  docker-compose exec backend tail -n 20 storage/logs/laravel.log
  ```
  **Procurar:** `"total_equipamentos": 12`

- [ ] **4. Se total = 0, verificar filtros do frontend**
  - Abrir DevTools (F12)
  - Aba Network
  - Gerar PDF novamente
  - Ver requisição GET `/api/v1/relatorios/equipamentos/pdf`
  - Ver parâmetros enviados (deve estar vazio ou "todos")

- [ ] **5. Limpar cache**
  ```powershell
  docker-compose exec backend php artisan optimize:clear
  ```

- [ ] **6. Reiniciar containers**
  ```powershell
  docker-compose restart backend frontend
  ```

---

## 🚨 Se Ainda Não Funcionar

### **Debug Avançado: Ver HTML Gerado**

Temporariamente, troque no `RelatorioController.php`:

```php
// De:
return $pdf->download($filename);

// Para:
return $pdf->stream(); // Abre no navegador em vez de baixar
```

Isso permite ver o HTML/PDF diretamente no navegador e identificar se:
- Os dados aparecem
- Há erros de CSS
- A tabela está vazia

---

## 📊 Dados de Teste Esperados

**Equipamentos (12 registros):**
- Tipos: computador, notebook, projetor, etc.
- Estados: em_uso, reserva, manutencao
- Alguns com laboratório, outros sem

**Manutenções (3 registros):**
- Tipos: corretiva, preventiva
- Status: pendente, em_andamento, concluida
- Relacionados com equipamentos

---

## 🎯 Resultado Esperado no PDF

### **Relatório de Equipamentos:**
```
┌──────────────────────────────────────────────┐
│ Relatório de Equipamentos                    │
│ IFG Câmpus Jataí                             │
├──────────────────────────────────────────────┤
│ Data de Geração: 24/10/2025 10:00           │
│ Total de Equipamentos: 12                   │
├──────────────────────────────────────────────┤
│ ID | Nome      | Tipo  | Patrimônio | ...   │
├──────────────────────────────────────────────┤
│ 1  | Dell PC   | Comp  | 12345      | ...   │
│ 2  | HP Laptop | Note  | 12346      | ...   │
│ ...                                          │
└──────────────────────────────────────────────┘
```

**Se aparecer apenas cabeçalho sem dados na tabela** = view Blade não está iterando a coleção.

---

## 📞 Próximos Passos

**Após executar os testes acima, me envie:**

1. **Resultado do Passo 1** (total de registros)
2. **Screenshot do PDF gerado** (mesmo que vazio)
3. **Últimas 20 linhas do log:**
   ```powershell
   docker-compose exec backend tail -n 20 storage/logs/laravel.log
   ```
4. **Parâmetros da requisição** (F12 > Network > ver query params)

Com essas informações, posso identificar exatamente onde está o problema!

---

**Desenvolvido para:** IFG Câmpus Jataí  
**Data:** 24/10/2025  
**Status:** 🔍 **DEBUG EM ANDAMENTO**

