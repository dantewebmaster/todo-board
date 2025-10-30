import * as vscode from "vscode";

import { clearCache } from "@/commands/clear-cache";
import { filterByLabel } from "@/commands/filter-by-label";
import { insertTodoComment } from "@/commands/insert-todo";
import { openTodoBoard } from "@/commands/open-board";
import { scanTodos } from "@/commands/scan-todos";
import { registerTodoSidebar } from "@/ui/sidebar";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "todo-board" is now active!');

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

  const clearCacheCmd = vscode.commands.registerCommand(
    "todo-board.clearCache",
    clearCache,
  );

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
    clearCacheCmd,
    refreshSidebarCmd,
    updateSidebarCmd,
    sidebarView,
  );
}

// This method is called when your extension is deactivated
export function deactivate(): void {
  // Nenhuma limpeza necessária no momento.
}
