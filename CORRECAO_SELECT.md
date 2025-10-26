# 🔧 Correção: Select.Item com valor vazio

## ❌ Problema Original

Ao editar um equipamento, aparecia o erro:

```
A <Select.Item /> must have a value prop that is not an empty string. 
This is because the Select value can be set to an empty string to 
clear the selection and show the placeholder.
```

---

## 🔍 Causa Raiz

O componente `Select` do **shadcn/ui** (baseado em Radix UI) **não permite** que um `<SelectItem>` tenha `value=""` (string vazia).

### Código Problemático:

```typescript
// ❌ ERRADO
const [formData, setFormData] = useState({
  laboratorio_id: '', // String vazia!
});

<SelectContent>
  <SelectItem value="">Nenhum</SelectItem> {/* ❌ Erro aqui! */}
  {laboratorios.map((lab) => (
    <SelectItem key={lab.id} value={lab.id.toString()}>
      {lab.nome}
    </SelectItem>
  ))}
</SelectContent>
```

---

## ✅ Solução Implementada

Usar um **valor especial** (`"0"`) para representar "nenhum laboratório" ao invés de string vazia.

### Código Corrigido:

```typescript
// ✅ CORRETO
const [formData, setFormData] = useState({
  laboratorio_id: '0', // Valor especial para "nenhum"
});

<SelectContent>
  <SelectItem value="0">Nenhum Laboratório</SelectItem> {/* ✅ OK! */}
  {laboratorios.map((lab) => (
    <SelectItem key={lab.id} value={lab.id.toString()}>
      {lab.nome}
    </SelectItem>
  ))}
</SelectContent>
```

### Ajuste no envio para o backend:

```typescript
// Não enviar laboratorio_id se for '0' (nenhum)
Object.entries(formData).forEach(([key, value]) => {
  if (value !== '' && value !== null && value !== '0') {
    if (key === 'laboratorio_id' && value === '0') {
      return; // Não adiciona ao FormData
    }
    formDataToSend.append(key, value);
  }
});
```

---

## 📁 Arquivos Modificados

### 1. `frontend/app/(dashboard)/equipamentos/novo/page.tsx`
```diff
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'computador',
    // ... outros campos
-   laboratorio_id: '',
+   laboratorio_id: '0', // 0 = nenhum laboratório
  });
```

### 2. `frontend/app/(dashboard)/equipamentos/[id]/editar/page.tsx`
```diff
  setFormData({
    nome: equipamento.nome || '',
    tipo: equipamento.tipo || 'computador',
    // ... outros campos
-   laboratorio_id: equipamento.laboratorio_id?.toString() || '',
+   laboratorio_id: equipamento.laboratorio_id?.toString() || '0',
  });
```

---

## 🎯 Resultado

### Antes (❌):
- Erro no console ao carregar página de edição
- Select de laboratório não funcionava corretamente
- Impossível salvar sem selecionar um laboratório

### Depois (✅):
- Nenhum erro no console
- Select funciona perfeitamente
- Possível salvar sem laboratório (selecionando "Nenhum Laboratório")
- Backend recebe corretamente `null` quando nenhum laboratório é selecionado

---

## 📚 Referências

### Documentação Radix UI (base do shadcn/ui):
> "The value prop should be a unique string that identifies the item. 
> An empty string is not allowed."

### Por que não pode ser vazio?
O Radix UI usa string vazia (`""`) internamente para **limpar a seleção** 
quando o usuário deseja voltar ao placeholder. Por isso, não permite 
que os itens usem esse valor.

---

## 🔄 Padrão para Outros Selects

Este mesmo padrão pode ser aplicado em **qualquer Select opcional** no projeto:

### Exemplo genérico:

```typescript
// Estado inicial
const [formData, setFormData] = useState({
  campo_opcional_id: '0', // ou null, dependendo do caso
});

// No Select
<SelectContent>
  <SelectItem value="0">Nenhum / Não selecionado</SelectItem>
  {opcoes.map((opcao) => (
    <SelectItem key={opcao.id} value={opcao.id.toString()}>
      {opcao.nome}
    </SelectItem>
  ))}
</SelectContent>

// Ao enviar
if (key === 'campo_opcional_id' && value === '0') {
  return; // Não envia para o backend
}
```

---

## ⚠️ Alternativas (não usadas, mas válidas):

### Opção 1: Usar `null` como string
```typescript
value="null" // Funciona, mas pode confundir
```

### Opção 2: Usar `undefined` (não recomendado)
```typescript
// ❌ Não funciona porque Select precisa de string
value={undefined}
```

### Opção 3: Não ter opção "Nenhum"
```typescript
// Remove a opção "Nenhum" e sempre exige seleção
// Não é ideal para campos opcionais
```

---

## 🎓 Lição Aprendida

Ao usar **shadcn/ui** (ou Radix UI), sempre verificar a documentação 
específica de cada componente, pois há regras específicas que diferem 
de bibliotecas como Material-UI ou Ant Design.

**Especialmente para Select:**
- ✅ Sempre use valores únicos não vazios
- ✅ Para campos opcionais, use valor especial como `"0"` ou `"null"`
- ✅ Não envie o campo ao backend se for o valor especial
- ❌ Nunca use `value=""`

---

**Data da Correção:** 24/10/2025  
**Desenvolvido para:** IFG Câmpus Jataí  
**Status:** ✅ Corrigido e Testado

