# TODO Board

Extensão do VS Code para localizar comentários `@TODO` no workspace e organizá-los em um quadro Kanban visual, com prioridades, labels e busca.

O diretório `.todo-board` é salvo no projeto para permitir versionamento e compartilhamento com o time de desenvolvimento, evitando a necessidade de reescanear toda vez que baixar o projeto.

## ✨ Funcionalidades

### 📊 Board Interativo
- Quadro Kanban visual com colunas Low/Medium/High
- Cards clicáveis que abrem o arquivo na linha correta
- Atualização automática ao escanear novos TODOs

### 🏷️ Sistema de Prioridades e Labels
- **Prioridades**: `low`, `medium`, `high` para Low, Medium, High
- **Labels**: Tags customizadas com cores
  - Exemplo: `@TODO(medium): [refactor, cleanup] Corrigir validação`
- Cores automáticas para labels comuns: bug, refactor, etc.

### 🔍 Busca Avançada
- Filtro instantâneo enquanto digita
- Busca em descrições, localizações e labels
- Atalho ESC para limpar
- Botão de limpar integrado

### 📁 Sidebar Integrada
- Visualização rápida de estatísticas
- Contagem total de TODOs
- Breakdown por labels
- Botões de ação rápida
- Ícone customizado na Activity Bar

## 🚀 Como usar

1. **Escanear TODOs**
   - Command Palette: `TODO Board: Scan @TODO`
   - Botão "Scan TODOs" na sidebar
   - Atalho: Configure nas preferências

2. **Visualizar Board**
   - Command Palette: `TODO Board: Open Board`
   - Botão "Open TODO Board" na sidebar
   - Clique no ícone da sidebar

3. **Inserir TODOs**
   - Command Palette: `TODO Board: Insert TODO Comment`
   - Atalho: `Cmd+Shift+T` (Mac) / `Ctrl+Shift+T` (Win/Linux)
   - Formatos suportados:
     ```javascript
     // @TODO: Descrição simples
     // @TODO(low): Prioridade baixa
     // @TODO(medium): Prioridade média
     // @TODO(high): Prioridade alta
     // @TODO(medium): [refactor, exemplo] Exemplo com labels e prioridade
     ```

## ⚙️ Configurações

```json
{
  "todo-board.fileExtensions": [
    "html", "css", "scss", "ts", "tsx", "js", "jsx",
    "vue", "md", "json", "yaml", "java", "py", "go", "rb"
  ]
}
```

## ✅ Checklist de Funcionalidades

### Concluído
- [x] Comando para escanear `@TODO` no workspace
- [x] Persistência em `.todo-board/todos.json`
- [x] Exclusões inteligentes (node_modules, .git, dist, etc)
- [x] Otimizações de performance (concorrência, cache)
- [x] Filtro por extensões configuráveis
- [x] Cache por mtime para arquivos inalterados
- [x] Barra de progresso com cancelamento
- [x] Refatoração modular com separação de responsabilidades
- [x] Interface Webview estilo board (Low/Medium/High)
- [x] Sistema de prioridades (low, medium, high)
- [x] Sistema de labels com cores customizadas
- [x] Sidebar com estatísticas e ações
- [x] Atualização automática do board ao escanear
- [x] Ícones customizados (Activity Bar, Sidebar, Webview)
- [x] Componentes modulares e organizados

### Planejado
- [ ] Limpeza automática do cache
- [ ] Watcher para atualizações incrementais
- [ ] Remover comentário ao marcar como concluído
- [ ] Filtros avançados (por arquivo, data, autor)
- [ ] Exportação de relatórios
- [ ] Temas customizados para o board

## 📂 Estrutura do Código

```
src/
├── __tests__/                    # Testes automatizados (129 testes ✅)
│   ├── commands/
│   │   ├── filter-by-label.test.ts
│   │   ├── insert-todo.test.ts
│   │   └── scan-todos.test.ts
│   ├── config/
│   │   └── index.test.ts
│   ├── constants/
│   │   └── regex.test.ts
│   ├── helpers/
│   │   └── test-helpers.ts
│   ├── services/
│   │   ├── cache.test.ts
│   │   ├── persist.test.ts
│   │   └── scanner.test.ts
│   ├── utils/
│   │   ├── generators.test.ts
│   │   ├── label.test.ts
│   │   ├── priority.test.ts
│   │   └── sanitize.test.ts
│   ├── extension.test.ts
│   └── README.md                 # Documentação dos testes
├── commands/                     # Comandos da extensão
│   ├── filter-by-label.ts        # Filtrar TODOs por label
│   ├── insert-todo.ts            # Inserir comentário TODO
│   ├── open-board.ts             # Abrir quadro Kanban
│   └── scan-todos.ts             # Escanear workspace
├── config/                       # Configurações
│   └── index.ts                  # Getters de configuração
├── constants/                    # Constantes e regex
│   └── regex.ts                  # Padrões regex
├── services/                     # Serviços core
│   ├── cache.ts                  # Cache de arquivos (mtime)
│   ├── filter-state.ts           # Estado de filtros
│   ├── persist.ts                # Persistência de TODOs
│   └── scanner.ts                # Scanner de comentários
├── types/                        # TypeScript types
│   ├── cache.ts                  # Tipos de cache
│   └── todo.ts                   # Tipos de TODO
├── ui/                           # Interface do usuário
│   ├── board/
│   │   ├── index.ts              # Renderização do board
│   │   ├── scripts.ts            # JavaScript da webview
│   │   ├── styles.ts             # CSS do board
│   │   └── components/
│   │       ├── board-card.ts      # Componente card
│   │       ├── board-column.ts    # Componente coluna
│   │       └── header.ts          # Componente header
│   │   └── services/
│   │       └── board-transformer.ts  # Transformação de dados
│   ├── icons/
│   │   └── index.ts              # Ícones SVG
│   └── sidebar/
│       ├── index.ts              # Renderização sidebar
│       ├── scripts.ts            # JavaScript sidebar
│       ├── styles.ts             # CSS sidebar
│       ├── components/
│       │   └── labels-list.ts    # Componente lista de labels
│       └── providers/
│           └── render-sidebar.ts # Provider da sidebar
├── utils/                        # Utilitários
│   ├── generators.ts             # Geração de IDs e nonces
│   ├── label.ts                  # Processamento de labels
│   ├── priority.ts               # Parsing de prioridades
│   └── sanitize.ts               # Sanitização de HTML
└── extension.ts                  # Entry point da extensão
```

## 🎨 Sistema de Labels

Labels suportadas com cores automáticas:
- 🔵 **refactor** - Azul
- 🔴 **bug** / **cleanup** - Vermelho
- 🟢 **feature** - Verde
- 🟡 **docs** - Âmbar
- 🔵 **test** - Ciano
- 🩷 **security** - Rosa
- 🟣 **optimization** / **performance** - Roxo
- 🔵 **ui** / **ux** - Teal
- 🟠 **api** - Laranja

Customize as cores em `src/utils/label.ts`
```

## Checklist do que já foi feito

- [x] Comando para escanear `@TODO` e exibir no log do Output Channel.
- [x] Persistência dos resultados em `.todo-board/todos.json` (apenas `file` e `line`).
- [x] Exclusões abrangentes (pastas ocultas e pesadas): `node_modules`, `.git`, `dist/out/build`, `coverage`, `tmp`, `.cache`, `.angular`, `assets`, etc.
- [x] Otimizações de performance (concorrência, limite de arquivos, pulo de arquivos muito grandes).
- [x] Filtro por extensões configuráveis via setting.
- [x] Cache por mtime para reaproveitar resultados de arquivos inalterados.
- [x] Barra de progresso com suporte a cancelamento.
- [x] Refatoração em módulos com separação de responsabilidades (`types`, `config`, `cache`, `persist`, `scanner`, `extension`).
- [ ] Limpeza do cache para arquivos deletados e ajustes de robustez.
- [ ] Watcher para atualizações incrementais.
- [x] Interface Webview estilo board (Low/Medium/High) com ação para abrir o arquivo na linha correspondente.
- [ ] Atualizar comentário e item na base ao mover o card entre colunas.
- [ ] Configurações adicionais (excludes customizados, limites por tamanho).
- [ ] Configuração para definir o estilo do comentario a buscar (@TODO, FIXME...).

## ⚡ Performance

- **Varredura paralela** com workers e progresso incremental
- **Cache inteligente** por mtime evita reprocessar arquivos inalterados
- **Exclusões automáticas** reduzem I/O (node_modules, .git, dist, etc)
- **Filtros configuráveis** por extensão de arquivo
- **Atualização em tempo real** do board ao escanear

## 🛠️ Desenvolvimento

### Compilar e assistir

```bash
npm run compile  # Compilar uma vez
npm run watch    # Assistir mudanças
```

### Testes e qualidade

```bash
npm run lint     # Verificar código
npm test         # Executar testes
```

### Estrutura de pastas

- `src/` - Código fonte TypeScript
- `out/` - Código compilado JavaScript
- `resources/` - Ícones e assets

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests
- Melhorar a documentação

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ para melhorar a gestão de TODOs no VS Code**
