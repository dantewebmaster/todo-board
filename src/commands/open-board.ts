import * as vscode from "vscode";

import { filterState } from "@/services/filter-state";
import { loadPersistedTodos } from "@/services/persist";
import { renderBoard } from "@/ui/board";
import {
  buildBoardItems,
  groupItems,
} from "@/ui/board/services/board-transformer";

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
    if (message?.type === "open" && typeof message.file === "string") {
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
    } else if (
      message?.type === "setFilter" &&
      typeof message.label === "string"
    ) {
      // Toggle label in filter state (supports multiple labels)
      filterState.toggleLabel(message.label);
    } else if (
      message?.type === "removeLabel" &&
      typeof message.label === "string"
    ) {
      // Remove a specific label from filter
      filterState.removeLabel(message.label);
    } else if (message?.type === "clearLabels") {
      // Clear all label filters
      filterState.clearLabels();
    } else if (
      message?.type === "setAgeFilter" &&
      typeof message.ageFilter === "string"
    ) {
      // Update age filter
      filterState.setAgeFilter(message.ageFilter);
    } else if (
      message?.type === "toggleSort" &&
      typeof message.direction === "string"
    ) {
      // Update sort direction
      filterState.toggleSortDirection();
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
      "activity-bar-icon.svg",
    );
    const darkIconPath = vscode.Uri.joinPath(
      context.extensionUri,
      "resources",
      "activity-bar-icon.svg",
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
