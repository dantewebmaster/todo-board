import * as vscode from "vscode";
import { scanTodos } from "./commands";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "todo-board" is now active!');

  const scanCmd = vscode.commands.registerCommand(
    "todo-board.scanTodos",
    scanTodos,
  );

  context.subscriptions.push(scanCmd);
}

// This method is called when your extension is deactivated
export function deactivate(): void {
  // Nenhuma limpeza necessária no momento.
}
