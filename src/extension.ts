import * as vscode from "vscode";

import { insertTodoComment } from "@/commands/insert-todo";
import { openTodoBoard } from "@/commands/open-board";
import { scanTodos } from "@/commands/scan-todos";
import { registerTodoSidebar } from "@/views/todo-sidebar";

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

  const sidebarView = registerTodoSidebar(context);

  context.subscriptions.push(scanCmd, openBoardCmd, insertTodoCmd, sidebarView);
}

// This method is called when your extension is deactivated
export function deactivate(): void {
  // Nenhuma limpeza necessária no momento.
}
