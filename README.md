# TODO Board

Extensão do VS Code para localizar comentários `@TODO` no workspace e salvar os resultados em `.todo-board/todos.json`, com foco em performance, organização e base para uma futura interface tipo “quadro Kanban/Trello”.

O diretório `.todo-board` é salvo no projeto para permitir versionamento e compartilhamento com o time de desenvolvimento, evitando a necessidade de reescanear toda vez que baixar o projeto.

## Como usar

- Use o comando “TODO Board: Scan @TODO” (Command Palette: Cmd+Shift+P) para escanear o workspace.
- Use o comando “TODO Board: Open Board” para abrir o quadro Kanban com as colunas Todo/Doing/Done agrupando os itens encontrados.
- O progresso aparece como notificação; é possível cancelar.
- Resultados ficam disponíveis no quadro Kanban.
- Um arquivo `.todo-board/todos.json` é gerado com informações `{ id, file, line, text }` e abastece o quadro Kanban.

## Configurações

- `todo-board.fileExtensions`: lista de extensões consideradas no scan (sem ponto). Padrão: `ts, tsx, js, jsx, mjs, cjs, md, json`.

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
- [x] Interface Webview estilo board (Todo/Doing/Done) com ação para abrir o arquivo na linha correspondente.
- [ ] Remover comentário da base ao mover para “done/cancel”.
- [ ] Configurações adicionais (excludes customizados, limites por tamanho).

## Estrutura do código

- `src/extension.ts`: registra comandos e orquestra o fluxo (progresso, logs, persistência).
- `src/scanner.ts`: motor de varredura com cache mtime e concorrência.
- `src/persist.ts`: grava resultados mínimos em `.todo-board/todos.json`.
- `src/board.ts`: gera a Webview do quadro e trata interações com os cartões.
- `src/cache.ts`: leitura/gravação do cache `.todo-board/cache.json`.
- `src/config.ts`: glob de include/exclude e extensões alvo.
- `src/types.ts`: tipos compartilhados.

## Notas de performance

- Varredura paralela com workers e atualização de progresso incremental.
- Cache por mtime evita reprocessar arquivos inalterados.
- Exclusões e filtros reduzem I/O e aceleram buscas.

## Desenvolvimento

Para compilar, assistir e rodar lint/testes:

```bash
npm run compile
npm run watch
npm run lint
npm test
```

Publicação/empacotamento da extensão não está coberto aqui.
