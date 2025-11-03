<div align="center">

# TODO Board

[![Version](https://img.shields.io/visual-studio-marketplace/v/dantewebmaster.todo-board?style=flat-square&logo=visual-studio-code&logoColor=white&color=blue)](https://marketplace.visualstudio.com/items?itemName=dantewebmaster.todo-board)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/dantewebmaster.todo-board?style=flat-square&logo=visual-studio-code&logoColor=white&color=success)](https://marketplace.visualstudio.com/items?itemName=dantewebmaster.todo-board)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/dantewebmaster.todo-board?style=flat-square&logo=visual-studio-code&logoColor=white&color=yellow)](https://marketplace.visualstudio.com/items?itemName=dantewebmaster.todo-board)
[![License](https://img.shields.io/github/license/dantewebmaster/todo-board?style=flat-square&color=green)](https://github.com/dantewebmaster/todo-board/blob/master/LICENSE)

**Organize seus TODOs em um quadro Kanban visual com prioridades, labels, filtros e rastreamento de idade**

[Instalação](#-instalação) • [Funcionalidades](#-funcionalidades) • [Uso Rápido](#-uso-rápido) • [Configuração](#️-configuração) • [Contribuir](./CONTRIBUTING.md)

</div>

---

## 🚀 Instalação

1. Abra o VS Code
2. Vá em Extensions (`Cmd+Shift+X` / `Ctrl+Shift+X`)
3. Busque por **"TODO Board"**
4. Clique em **Install**

Ou instale diretamente: [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=dantewebmaster.todo-board)

## ✨ Funcionalidades

### 📊 Quadro Kanban Visual

Organize TODOs em 3 colunas por prioridade. Cards clicáveis abrem o arquivo na linha exata.

![Board Kanban](./images/demo-all-features-and-settings.gif)

### 🕐 Rastreamento de Idade

Veja há quanto tempo cada TODO foi criado com o filtro por idade.

- 🟢 **Fresh** (≤7 dias)
- 🟡 **Recent** (≤30 dias)
- 🟠 **Old** (≤90 dias)
- 🔴 **Abandoned** (>90 dias)

### 🔍 Filtros Avançados

Filtre por múltiplas labels, idade e ordenação. Visual claro de filtros ativos com botão reset.

### 🏷️ Labels Customizadas

Labels com cores automáticas e ícones especiais:

| Label | Cor | Ícone | Label | Cor | Ícone |
|-------|-----|-------|-------|-----|-------|
| bug | 🔴 | 🐛 | feature | 🟢 | ✨ |
| refactor | 🔵 | 🔄 | docs | 🟡 | 📝 |
| test | 🔵 | 🧪 | security | 🩷 | 🔒 |
| performance | 🟣 | 🚀 | ui/ux | 🔵 | 🎨 |

### 📊 Sidebar Integrada

Estatísticas, filtro rápido por labels e sincronização visual


## 📖 Uso Rápido

### Escanear Workspace

`Cmd/Ctrl + Shift + P` → **"TODO Board: Scan @TODO"**

### Abrir Board

`Cmd/Ctrl + Shift + P` → **"TODO Board: Open Board"**

Ou clique no ícone na Activity Bar.

### Inserir TODO

`Cmd/Ctrl + Shift + T`

Insere comentário formatado automaticamente para cada linguagem.

## ⚙️ Configuração

```json
{
  // Extensões de arquivo para escanear
  "todo-board.fileExtensions": [
    "ts", "tsx", "js", "jsx", "vue", "py", "go", "rb"
  ],

  // Padrões de busca customizáveis
  "todo-board.searchPatterns": ["@TODO", "FIXME", "BUG"],

  // Máximo de linhas por TODO
  "todo-board.maxTodoLines": 4
}
```

## ⚡ Performance

- 🚀 Cache inteligente baseado em `mtime`
- 🔄 Processamento paralelo de arquivos
- 🚫 Exclusões automáticas: `node_modules`, `.git`, `dist`, etc
- 📊 **10.000 arquivos**: ~5-10s (primeiro scan), ~1-2s (com cache)

## 📋 Comandos

| Comando | Atalho | Descrição |
|---------|--------|-----------|
| `TODO Board: Scan @TODO` | - | Escaneia workspace |
| `TODO Board: Open Board` | - | Abre quadro Kanban |
| `TODO Board: Insert TODO Comment` | `Cmd/Ctrl+Shift+T` | Insere TODO formatado |
| `TODO Board: Clear Age Cache` | - | Limpa cache de idades |

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja o [guia de contribuição](./CONTRIBUTING.md).

- 🐛 [Reportar bugs](https://github.com/dantewebmaster/todo-board/issues)
- 💡 Sugerir features
- 📝 Melhorar documentação
- ⭐ Dar estrela no repositório

## 📄 Licença

MIT © [Dante Roberio](https://github.com/dantewebmaster)

---

<div align="center">

**[📋 Changelog](./CHANGELOG.md)** • **[🤝 Contribuir](./CONTRIBUTING.md)** • **[📝 Licença](./LICENSE)**

Desenvolvido com ❤️ para melhorar a gestão de TODOs no VS Code

</div>
