# Testes - TODO Board Extension

Esta pasta contém todos os testes automatizados da extensão TODO Board, organizados de acordo com a estrutura do projeto.

## Estrutura de Testes

```
__tests__/
├── commands/           # Testes dos comandos da extensão
│   ├── filter-by-label.test.ts
│   ├── insert-todo.test.ts
│   └── scan-todos.test.ts
├── config/             # Testes de configuração
│   └── index.test.ts
├── constants/          # Testes de constantes
│   └── regex.test.ts
├── helpers/            # Utilitários para testes
│   └── test-helpers.ts
├── services/           # Testes de serviços
│   ├── cache.test.ts
│   ├── persist.test.ts
│   └── scanner.test.ts
├── utils/              # Testes de utilitários
│   ├── generators.test.ts
│   ├── label.test.ts
│   ├── priority.test.ts
│   └── sanitize.test.ts
└── extension.test.ts   # Testes principais da extensão
```

## Executando os Testes

### Todos os testes
```bash
npm test
```

### Compilar sem rodar testes
```bash
npm run compile
```

### Apenas lint
```bash
npm run lint
```

## Cobertura de Testes

### ✅ Testes Funcionais (117 testes passando)

#### Utils (31 testes)
- **generators.test.ts**: Testes de geração de IDs e nonces
- **label.test.ts**: Testes de extração, contagem e formatação de labels
- **priority.test.ts**: Testes de parsing de prioridades
- **sanitize.test.ts**: Testes de sanitização de HTML e atributos

#### Services (15 testes)
- **cache.test.ts**: Testes de leitura/escrita de cache
- **persist.test.ts**: Testes de persistência de TODOs
- **scanner.test.ts**: Testes de escaneamento de arquivos

#### Config (4 testes)
- **index.test.ts**: Testes de configurações da extensão

#### Constants (12 testes)
- **regex.test.ts**: Testes de expressões regulares e padrões

#### Commands (5 testes)
- **filter-by-label.test.ts**: Testes de filtragem por label
- **insert-todo.test.ts**: Testes de inserção de comentários TODO
- **scan-todos.test.ts**: Testes de comando de scan

#### Extension (9 testes)
- **extension.test.ts**: Testes de ativação e registro de comandos

### ⚠️ Testes com Limitações

Alguns testes que dependem de manipulação de workspace podem falhar no ambiente de teste do VSCode devido a limitações da API. Estes testes estão presentes mas podem ser melhorados em versões futuras.

## Helpers de Teste

### `createTempWorkspace()`
Cria um diretório temporário dentro do workspace atual para testes de integração.

**Uso:**
```typescript
const tmp = await createTempWorkspace();
try {
  await tmp.writeFile("test.ts", "// @TODO test");
  // ... seu teste
} finally {
  await tmp.dispose();
}
```

## Boas Práticas

1. **Nomenclatura**: Use nomes descritivos que expliquem o que está sendo testado
2. **Organização**: Siga a estrutura de pastas do código fonte
3. **Isolamento**: Cada teste deve ser independente e não afetar outros
4. **Limpeza**: Sempre limpe recursos criados (use `finally` ou `dispose()`)
5. **Asserções claras**: Use mensagens descritivas nas asserções

## Notas de Desenvolvimento

- Os testes usam o Mocha como framework de testes
- As asserções usam o módulo `assert` do Node.js
- Testes de integração com VSCode usam `@vscode/test-electron`
- A compilação TypeScript é necessária antes de rodar os testes
