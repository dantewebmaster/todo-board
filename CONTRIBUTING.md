# Contribuindo para TODO Board

Obrigado por considerar contribuir! 🎉

## 🛠️ Setup do Projeto

### Pré-requisitos

- Node.js >= 18
- VS Code >= 1.85.0

### Instalação

```bash
# Clonar repositório
git clone https://github.com/dantewebmaster/todo-board.git
cd todo-board

# Instalar dependências
npm install

# Compilar TypeScript
npm run compile
```

## 📜 Scripts Disponíveis

```bash
npm run compile      # Compilar TypeScript uma vez
npm run watch        # Watch mode (recompila automaticamente)
npm run lint         # Verificar código com ESLint
npm test            # Executar todos os testes (158 testes)
npm run pretest     # Compilar e lint antes dos testes
```

## 🧪 Debug e Testes

### Testar a extensão

1. Abra o projeto no VS Code
2. Pressione `F5` para abrir uma janela de desenvolvimento
3. Na janela de desenvolvimento, execute os comandos da extensão
4. Verifique o console de debug para logs

### Executar testes

```bash
npm test                         # Todos os testes
npm test -- --grep "scanner"     # Apenas testes do scanner
npm test -- --grep "config"      # Apenas testes de config
```

## 📁 Estrutura do Código

```
src/
├── __tests__/                    # 📝 Testes (158 testes ✅)
├── commands/                     # 🎮 Comandos da extensão
├── config/                       # ⚙️ Configurações
├── constants/                    # 📋 Constantes e regex
├── services/                     # 🔧 Serviços principais
│   ├── cache.ts                  # Sistema de cache
│   ├── filter-state.ts           # Estado de filtros
│   ├── persist.ts                # Persistência de dados
│   └── scanner.ts                # Scanner de TODOs
├── types/                        # 📐 TypeScript types
├── ui/                           # 🎨 Interface (webviews)
│   ├── board/                    # Quadro Kanban
│   ├── sidebar/                  # Sidebar
│   └── icons/                    # Ícones SVG
├── utils/                        # 🛠️ Utilitários
└── extension.ts                  # 🚀 Entry point
```

## 🎯 Guidelines de Código

### Princípios do Clean Code

- ✅ **Sempre tipar** variáveis, funções e propriedades
- ✅ **Nomes descritivos** - evite `data`, `info`, `item`, `x`, etc.
- ✅ **Código em inglês** (comentários em português apenas para documentação)
- ✅ **Código autoexplicativo** - minimize comentários desnecessários
- ✅ **Siga o ESLint/Prettier** - execute `npm run lint` antes de commitar

### Exemplo de bom código

```typescript
// ❌ Evite
const d = new Date();
const x = todos.filter(t => t.p === 'high');

// ✅ Prefira
const currentDate = new Date();
const highPriorityTodos = todos.filter(todo => todo.priority === 'high');
```

## 🔄 Workflow de Contribuição

1. **Fork** o repositório
2. **Crie uma branch** para sua feature
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Faça suas alterações** seguindo os guidelines
4. **Adicione testes** se aplicável
5. **Execute os testes**
   ```bash
   npm run lint
   npm test
   ```
6. **Commit** suas mudanças (seguir padrão commitlint)
   ```bash
   git commit -m 'feat(short-context): amazing feature'
   ```
7. **Push** para sua branch
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Abra um Pull Request**

## 📝 Convenções de Commit

Use mensagens claras e descritivas seguindo a convenção commitlint:

- `feat: nova funcionalidade`
- `fix: correção de bug`
- `refactor: refatoração de código`
- `docs: alteração em documentação`
- `test: adição/alteração de testes`

**Consulte o guia para todos os estilos e contexto.**

## 🤝 Maneiras de Contribuir

- 🐛 **Reportar bugs** - [Abra uma issue](https://github.com/dantewebmaster/todo-board/issues)
- 💡 **Sugerir features** - Compartilhe suas ideias
- 📝 **Melhorar docs** - Documentação nunca é demais
- 🔧 **Code** - Envie Pull Requests
- ⭐ **Star** - Dê uma estrela no repo!

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a licença MIT do projeto.

---

Dúvidas? Abra uma [issue](https://github.com/dantewebmaster/todo-board/issues) ou entre em contato!
