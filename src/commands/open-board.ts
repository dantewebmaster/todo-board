import * as vscode from "vscode";

import { buildBoardItems, groupItems, renderBoard } from "@/resources/board";
import { loadPersistedTodos } from "@/services/persist";

let currentPanel: vscode.WebviewPanel | undefined;

export async function updateBoardContent(
  webview: vscode.Webview,
): Promise<void> {
  const hits = await loadPersistedTodos();
  const boardItems = buildBoardItems(hits);
  const grouped = groupItems(boardItems);

  webview.html = renderBoard(webview, grouped);
}

export function getCurrentPanel(): vscode.WebviewPanel | undefined {
  return currentPanel;
}

function setupWebviewMessageHandler(panel: vscode.WebviewPanel): void {
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

export async function openTodoBoard(
  context?: vscode.ExtensionContext,
): Promise<void> {
  if (currentPanel) {
    currentPanel.reveal(vscode.ViewColumn.Active);
    await updateBoardContent(currentPanel.webview);
    return;
  }

  const panel = vscode.window.createWebviewPanel(
    "todoBoard",
    "TODO Board",
    vscode.ViewColumn.Active,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    },
  );

  if (context) {
    const lightIconPath = vscode.Uri.joinPath(
      context.extensionUri,
      "resources",
      "list-checks-light.svg",
    );
    const darkIconPath = vscode.Uri.joinPath(
      context.extensionUri,
      "resources",
      "list-checks-dark.svg",
    );
    panel.iconPath = {
      light: lightIconPath,
      dark: darkIconPath,
    };
  }

  currentPanel = panel;

  panel.onDidDispose(() => {
    currentPanel = undefined;
  });

  await updateBoardContent(panel.webview);
  setupWebviewMessageHandler(panel);
}
