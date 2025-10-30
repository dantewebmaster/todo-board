# Change Log

Todas as mudanças notáveis do "TODO Board" serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](http://keepachangelog.com/).

## [1.0.1] - 2025-10-30

### 🎨 Melhorias Visuais

- Ícones e logo da extensão aprimorados

## [1.0.0] - 2025-10-26

### 🎉 Lançamento Inicial

#### ✨ Funcionalidades

- **Quadro Kanban Visual** - Organize TODOs em colunas Low/Medium/High
- **Sistema de Prioridades** - Suporte para `low`, `medium`, `high` em formato `@TODO(priority)`
- **Sistema de Labels** - Tags customizadas com cores automáticas: `[refactor, bug, feature]`
- **Padrões de Busca Customizáveis** - Configure múltiplos padrões de busca (@TODO, TODO, FIXME, etc)
- **Sidebar Integrada** - Visualização rápida com estatísticas e contagem de labels
- **Inserção Rápida** - Comando com atalho `Cmd/Ctrl+Shift+T` para inserir TODOs
- **Cache Inteligente** - Reaproveitamento de resultados por mtime para performance
- **Filtro por Label** - Clique em labels para filtrar TODOs específicos

#### 🎨 Interface

- Ícones customizados para diferentes tipos de labels (bug, feature, refactor, etc)
- Cores automáticas para labels conhecidas
- Cards clicáveis que abrem o arquivo na linha correta
- Header com campo de busca e botão de limpar
- Design responsivo e moderno

#### ⚙️ Configurações

- `todo-board.searchPatterns` - Array de padrões customizáveis (padrão: `["@TODO"]`)
- `todo-board.fileExtensions` - Lista de extensões de arquivo para escanear
- `todo-board.maxTodoLines` - Número máximo de linhas por TODO (padrão: 4)

#### 🔧 Comandos

- `TODO Board: Scan @TODO` - Escaneia workspace por TODOs
- `TODO Board: Open Board` - Abre o quadro Kanban
- `TODO Board: Insert TODO Comment` - Insere snippet de TODO
- `TODO Board: Scan Workspace` - Rescaneia via sidebar

#### 📦 Otimizações

- Exclusões automáticas (node_modules, .git, dist, etc)
- Limite de 6000 linhas por arquivo
- Concorrência de 25 arquivos simultâneos
- Cache persistente em `.todo-board/`

#### 🧪 Qualidade

- 158 testes automatizados
- Cobertura completa de utilitários e serviços
- Validação de regex patterns
- Testes de configuração e transformação

#### 📚 Documentação

- README completo com exemplos
- Guia de padrões de busca customizáveis
- 10+ exemplos de configuração
- Documentação técnica de implementação

## [Unreleased]

- Watcher para atualizações incrementais
- Filtros avançados por arquivo e data
- Exportação de relatórios
