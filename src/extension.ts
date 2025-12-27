import * as vscode from "vscode";

import { clearAgeCache } from "@/commands/clear-cache";
import { filterByLabel } from "@/commands/filter-by-label";
import { insertTodoComment } from "@/commands/insert-todo";
import { openTodoBoard } from "@/commands/open-board";
import { scanTodos } from "@/commands/scan-todos";
import { initializeAuth, setAuthToken } from "@/services/auth";
import { initializeStorage } from "@/services/storage";
import { initializeTodoDecorator } from "@/services/todo-decorator";
import { registerTodoSidebar } from "@/ui/sidebar";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "todo-board" is now active!');

  // Initialize storage service
  initializeStorage(context);

  // Initialize secret-backed auth storage
  initializeAuth(context);

  // Initialize TODO comment highlighting
  initializeTodoDecorator(context);

  const scanCmd = vscode.commands.registerCommand(
    "todo-board.scanTodos",
    scanTodos,
  );

  const openBoardCmd = vscode.commands.registerCommand(
    "todo-board.showBoard",
    () => openTodoBoard(context),
  );

  const insertTodoCmd = vscode.commands.registerCommand(
    "todo-board.insertTodo",
    insertTodoComment,
  );

  const filterByLabelCmd = vscode.commands.registerCommand(
    "todo-board.filterByLabel",
    filterByLabel,
  );

  const clearAgeCacheCmd = vscode.commands.registerCommand(
    "todo-board.clearAgeCache",
    clearAgeCache,
  );

  const authenticateCmd = vscode.commands.registerCommand(
    "todo-board.authenticate",
    async () => {
      // Open external OAuth start URL
      const url = vscode.Uri.parse(
        "https://todo-board.dantewebmaster.com.br/oauth/start",
      );
      await vscode.env.openExternal(url);
    },
  );

  // Register URI handler to receive token via vscode:// callback
  const uriHandlerDisposable = vscode.window.registerUriHandler({
    handleUri: async (uri: vscode.Uri) => {
      try {
        const expectedScheme = "vscode";
        const isExpectedAuthority = uri.authority.endsWith(".todo-board");
        const expectedPath = "/auth";

        const isExpectedScheme = uri.scheme === expectedScheme;
        const isExpectedPath = uri.path === expectedPath;

        if (!isExpectedScheme || !isExpectedAuthority || !isExpectedPath) {
          void vscode.window.showErrorMessage(
            `TODO Board: Received unexpected authentication callback URI.\n` +
              `scheme: ${uri.scheme}, authority: ${uri.authority}, path: ${uri.path}`,
          );
          return;
        }

        // Expect token in query param 'token'
        const params: URLSearchParams = new URLSearchParams(uri.query);
        const token: string | null = params.get("token");
        if (token) {
          await setAuthToken(token);
          void vscode.window.showInformationMessage(
            "TODO Board: Jira authentication successful.",
          );
        } else {
          void vscode.window.showErrorMessage(
            "TODO Board: Authentication callback did not contain a token.",
          );
        }
      } catch {
        void vscode.window.showErrorMessage(
          "TODO Board: Error processing authentication callback.",
        );
      }
    },
  });

  const { disposable: sidebarView, provider: sidebarProvider } =
    registerTodoSidebar(context);

  // Refresh button calls scanTodos (full scan)
  const refreshSidebarCmd = vscode.commands.registerCommand(
    "todo-board.refreshSidebar",
    scanTodos,
  );

  // Update sidebar after scan (just updates the webview)
  const updateSidebarCmd = vscode.commands.registerCommand(
    "todo-board.updateSidebar",
    () => {
      sidebarProvider.refresh();
    },
  );

  context.subscriptions.push(
    scanCmd,
    openBoardCmd,
    insertTodoCmd,
    filterByLabelCmd,
    clearAgeCacheCmd,
    refreshSidebarCmd,
    updateSidebarCmd,
    sidebarView,
    authenticateCmd,
    uriHandlerDisposable,
  );
}

// This method is called when your extension is deactivated
export function deactivate(): void {
  // Nenhuma limpeza necessária no momento.
}
