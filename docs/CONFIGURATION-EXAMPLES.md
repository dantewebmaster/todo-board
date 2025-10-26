# Exemplos de Configurações - TODO Board

## 1️⃣ Configuração Padrão (Recomendada para Iniciantes)

```json
{
  "todo-board.searchPatterns": ["@TODO"],
  "todo-board.fileExtensions": ["ts", "tsx", "js", "jsx", "html", "css"],
  "todo-board.maxTodoLines": 4
}
```

**Encontra:** `@TODO`, `@TODO(high)`, etc.

**Exemplo:**
```typescript
// @TODO: Implementar feature X
function foo() {
  // @TODO(high): Corrigir bug crítico
  return null;
}
```

---

## 2️⃣ Equipe com Múltiplas Marcações

```json
{
  "todo-board.searchPatterns": ["@TODO", "@FIXME", "@OPTIMIZE"],
  "todo-board.fileExtensions": ["ts", "tsx", "js", "jsx"],
  "todo-board.maxTodoLines": 5
}
```

**Encontra:** `@TODO`, `@FIXME`, `@OPTIMIZE`

**Exemplo:**
```typescript
// @TODO: Implementar autenticação
// @FIXME: Bug em produção
// @OPTIMIZE: Performance da query
```

---

## 3️⃣ Desenvolvimento Ágil (Scrum/Kanban)

```json
{
  "todo-board.searchPatterns": ["@TODO", "@BLOCKED", "@REVIEW"],
  "todo-board.fileExtensions": ["ts", "tsx", "js", "jsx", "md"],
  "todo-board.maxTodoLines": 6
}
```

**Encontra:** `@TODO`, `@BLOCKED`, `@REVIEW`

**Exemplo:**
```typescript
// @TODO: Sprint 1 tasks
// @BLOCKED: Aguardando aprovação
// @REVIEW: Pronto para code review
```

---

## 4️⃣ Padrão Genérico (Sem Símbolo @)

```json
{
  "todo-board.searchPatterns": ["TODO", "FIXME", "HACK", "XXX"],
  "todo-board.fileExtensions": ["js", "jsx", "ts", "tsx", "py", "go"],
  "todo-board.maxTodoLines": 4
}
```

**Encontra:** `TODO`, `FIXME`, `HACK`, `XXX`

**Exemplo:**
```javascript
// TODO: finish this
// FIXME: temporary solution
// HACK: quick fix for now
// XXX: needs refactoring
```

---

## 5️⃣ Código Legado (Múltiplos Padrões Antigos)

```json
{
  "todo-board.searchPatterns": ["TODO", "FIXME", "BUG", "KLUDGE", "REFACTOR"],
  "todo-board.fileExtensions": ["java", "cs", "cpp", "js"],
  "todo-board.maxTodoLines": 3
}
```

**Encontra:** Todos os padrões comuns em código legado

---

## 6️⃣ Prioridades Explícitas

```json
{
  "todo-board.searchPatterns": ["@CRITICAL", "@HIGH", "@MEDIUM", "@LOW"],
  "todo-board.fileExtensions": ["ts", "tsx", "js", "jsx"],
  "todo-board.maxTodoLines": 4
}
```

**Encontra:** Marcações de prioridade explícitas

**Exemplo:**
```typescript
// @CRITICAL: Production down
// @HIGH: Security issue
// @MEDIUM: Performance
// @LOW: Polish UI
```

---

## 7️⃣ Padrões com Símbolos Especiais

```json
{
  "todo-board.searchPatterns": ["@TODO", "[BUG]", "[FEATURE]", "! NOTE"],
  "todo-board.fileExtensions": ["md", "mdx", "ts", "tsx"],
  "todo-board.maxTodoLines": 5
}
```

**Encontra:** Diversos formatos com símbolos

**Exemplo:**
```markdown
# @TODO: Update documentation
[BUG]: Fix typo in README
[FEATURE]: Add dark mode
! NOTE: Breaking change
```

---

## 8️⃣ Code Review & QA

```json
{
  "todo-board.searchPatterns": ["@REVIEW", "@QA", "@TESTING", "@BUG"],
  "todo-board.fileExtensions": ["ts", "tsx", "js", "jsx"],
  "todo-board.maxTodoLines": 4
}
```

**Encontra:** Tags relacionadas a revisão de código

**Exemplo:**
```typescript
// @REVIEW: Precisa de aprovação do lead
// @QA: Necessário teste manual
// @TESTING: Adicionar unit tests
// @BUG: Falha em edge case
```

---

## 9️⃣ Desenvolvimento Full Stack

```json
{
  "todo-board.searchPatterns": ["@TODO", "@FIXME", "@API", "@DB", "@UI", "@TEST"],
  "todo-board.fileExtensions": ["ts", "tsx", "js", "jsx", "py", "sql"],
  "todo-board.maxTodoLines": 5
}
```

**Encontra:** Tags específicas para diferentes partes da stack

**Exemplo:**
```typescript
// Frontend
// @UI: Design approval needed
// @TEST: Unit tests for component

// Backend
// @API: Implement endpoint
// @DB: Migration pending
// @FIXME: SQL optimization
```

---

## 🔟 Minimalista (Apenas o Essencial)

```json
{
  "todo-board.searchPatterns": ["TODO"],
  "todo-board.fileExtensions": ["ts", "js"],
  "todo-board.maxTodoLines": 2
}
```

**Encontra:** Apenas "TODO"

**Uso:** Mais simples, menos distrações

---

## 🎯 Dicas de Uso

### ✅ Boas Práticas

1. **Use padrões específicos**: `@TODO` é melhor que `TODO`
2. **Padronize seu time**: Todo mundo usa os mesmos padrões
3. **Documente nos padrões**: Deixe claro o que cada um significa
4. **Revise regularmente**: Mantenha o board atualizado

### 📋 Mantendo a Qualidade

```json
{
  "todo-board.searchPatterns": ["@TODO", "@FIXME"],
  "todo-board.fileExtensions": ["ts", "tsx", "js", "jsx"],
  "todo-board.maxTodoLines": 4
}
```

Recomendação: 2-5 padrões é o ideal para evitar poluição.

### 🚀 Performance

- Menos padrões = mais rápido
- Menos extensões de arquivo = mais rápido
- `maxTodoLines` menor = menos memória

```json
{
  "todo-board.searchPatterns": ["@TODO"],
  "todo-board.fileExtensions": ["ts", "js"],
  "todo-board.maxTodoLines": 3
}
```

---

## 📚 Migrando Suas Configurações

### De um arquivo `.todor` antigo:

```
❌ Antes: Suportava apenas "TODO"
✅ Agora: Configure o que quiser!
```

```json
{
  "todo-board.searchPatterns": ["TODO", "FIXME", "BUG"]
}
```

### Ative gradualmente:

1. Comece com `["@TODO"]`
2. Adicione `"@FIXME"` quando achar necessário
3. Expanda conforme a necessidade

---

## 🔗 Recursos Adicionais

- Veja `docs/SEARCH-PATTERNS.md` para detalhes técnicos
- Veja `docs/IMPLEMENTATION-SUMMARY.md` para como funciona

---

## ❓ Precisa de Ajuda?

**Pergunta**: Como usar em um projeto Python?

**Resposta:**
```json
{
  "todo-board.searchPatterns": ["TODO", "FIXME"],
  "todo-board.fileExtensions": ["py"],
  "todo-board.maxTodoLines": 4
}
```

Código Python:
```python
# TODO: Implement feature
# FIXME: Fix bug in production
def my_function():
    pass
```

---

**Última atualização:** Outubro 2025
**Versão:** TODO Board 0.1.4+
