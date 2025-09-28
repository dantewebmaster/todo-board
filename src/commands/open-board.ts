import { buildBoardItems, groupItems, renderBoard } from "@resources/board";
import { loadPersistedTodos } from "@services/persist.service";
import * as vscode from "vscode";

export async function openTodoBoard(): Promise<void> {
  const panel = vscode.window.createWebviewPanel(
    "todoBoard",
    "TODO Board",
    vscode.ViewColumn.Active,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    },
  );

  const hits = await loadPersistedTodos();
  const boardItems = buildBoardItems(hits);
  const grouped = groupItems(boardItems);

  panel.webview.html = renderBoard(panel.webview, grouped);

  panel.webview.onDidReceiveMessage(async (message) => {
    if (message?.type !== "open" || typeof message.file !== "string") {
      return;
    }

    const line = typeof message.line === "number" ? message.line : 0;

    try {
      const resourceUri = vscode.Uri.file(message.file);
      const document = await vscode.workspace.openTextDocument(resourceUri);
      const position = new vscode.Position(line, 0);
      const selection = new vscode.Selection(position, position);

      await vscode.window.showTextDocument(document, {
        selection,
        preview: false,
      });
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : String(error);
      void vscode.window.showErrorMessage(
        `Unable to open TODO location: ${messageText}`,
      );
    }
  });
}
