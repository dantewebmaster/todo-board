import { openTodoBoard } from "@commands/open-board";
import { scanTodos } from "@commands/scan-todos";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "todo-board" is now active!');

  const scanCmd = vscode.commands.registerCommand(
    "todo-board.scanTodos",
    scanTodos,
  );

  const boardCmd = vscode.commands.registerCommand(
    "todo-board.showBoard",
    openTodoBoard,
  );

  context.subscriptions.push(scanCmd, boardCmd);
}

// This method is called when your extension is deactivated
export function deactivate(): void {
  // Nenhuma limpeza necessária no momento.
}
