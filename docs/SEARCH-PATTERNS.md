# Padrões de Busca Customizáveis - Documentação

## Visão Geral

A partir dessa versão, o TODO Board permite configurar padrões customizáveis para buscar diferentes tipos de comentários. Você não está mais limitado apenas a `@TODO` - pode usar `FIXME`, `BUG`, `HACK` ou qualquer outro padrão que preferir.

## Configuração

Para customizar os padrões de busca, edite o `settings.json` do VS Code:

### Padrão Padrão
```json
{
  "todo-board.searchPatterns": ["TODO", "@TODO"]
}
```

### Exemplos Práticos

#### 1. Buscar múltiplos padrões
```json
{
  "todo-board.searchPatterns": ["TODO", "@TODO", "@FIXME", "BUG"]
}
```

Isso encontrará:
- `// @TODO: implement feature`
- `// @FIXME: fix bug`
- `// BUG: known issue`

#### 2. Padrões sem símbolo @
```json
{
  "todo-board.searchPatterns": ["TODO", "FIXME", "HACK"]
}
```

Compatível com diferentes estilos de comentários:
- `// TODO: description`
- `// FIXME: fix this`
- `// HACK: temporary solution`

#### 3. Combinação de estilos
```json
{
  "todo-board.searchPatterns": ["TODO", "@TODO", "FIXME", "URGENT", "BLOCKED"]
}
```

#### 4. Apenas FIXME (sem @TODO)
```json
{
  "todo-board.searchPatterns": ["FIXME"]
}
```

## Como Funciona

### Busca por Padrão
O scanner procura por cada padrão em cada linha de comentário. Quando encontra um, extrai o texto do TODO e o adiciona ao board.

### Prioridades
Os padrões suportam prioridades entre parênteses:
```javascript
// @TODO(high): Critical fix needed
// FIXME(medium): Nice to have
// BUG(low): Minor issue
```

### Ordem de Precedência
Se uma linha contiver múltiplos padrões, o primeiro encontrado será usado:
```javascript
// @TODO and FIXME should be fixed  // Usa @TODO
// FIXME and BUG here               // Usa FIXME
```

## Limitações e Boas Práticas

### ✅ Permitido
- Texto simples: `@TODO`, `FIXME`, `BUG`, `HACK`
- Símbolos especiais simples: `@`, `[`, `]` (como parte do texto)
- Qualquer combinação: `URGENT`, `@FIXME`, `TODO+`

### ❌ Não Permitido
- Caracteres regex especiais usados como regex: `*`, `+`, `?`, `|`, `(`, `)`
- **Motivo**: O sistema escapa automaticamente esses caracteres como texto literal

Se você tentar usar:
```json
{
  "todo-board.searchPatterns": ["@TODO*"]  // ❌ Errado
}
```

Será interpretado como um asterisco literal, não como um quantificador regex.

### Case-Sensitive
Os padrões respeitam maiúsculas/minúsculas:
```json
{
  "todo-board.searchPatterns": ["TODO"]  // Encontra "TODO"
                                        // NÃO encontra "todo" ou "Todo"
}
```

## Exemplos de Uso Recomendado

### Para Projetos Solo
```json
{
  "todo-board.searchPatterns": ["@TODO"]
}
```

### Para Equipes
```json
{
  "todo-board.searchPatterns": ["TODO", "@TODO", "@FIXME", "@REVIEW", "@OPTIMIZE"]
}
```

### Para Legado com Diferentes Padrões
```json
{
  "todo-board.searchPatterns": ["TODO", "FIXME", "BUG", "HACK", "XXX"]
}
```

### Controle Rígido de Padrões
```json
{
  "todo-board.searchPatterns": ["@TODO", "@FIXME"]  // Apenas com @
}
```

## Testabilidade

Todos os padrões são testados em `src/__tests__/utils/regex-builder.test.ts`:

- ✅ 8 testes para `buildTodoPattern`
- ✅ 5 testes para `buildPriorityPattern`
- ✅ 4 testes para `validateSearchPatterns`
- ✅ 8 testes para `findFirstPatternIndex`

Total: **25 testes** garantindo confiabilidade dos padrões customizáveis.

## Migração de Projetos Existentes

Se você tinha código usando outros padrões, basta configurar:

```json
{
  "todo-board.searchPatterns": ["@TODO", "FIXME", "BUG"]  // Seus padrões antigos
}
```

E executar `TODO Board: Scan @TODO` novamente para reindexar.

## Perguntas Frequentes

**P: Posso usar regex real?**
R: Não, o sistema escapa caracteres especiais. Use apenas texto simples.

**P: Qual é o limite de padrões?**
R: Sem limite técnico, mas recomenda-se 5-10 para melhor performance.

**P: Os padrões afetam a performance?**
R: Mínimamente. Cada padrão adiciona ~1-2ms por arquivo scaneado.

**P: Como remover um padrão?**
R: Delete-o da array `searchPatterns` e rescanee o workspace.

**P: Os padrões são sincronizados entre dispositivos?**
R: Sim, se você usar VS Code Settings Sync.
