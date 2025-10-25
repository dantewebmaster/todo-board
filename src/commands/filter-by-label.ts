import * as vscode from "vscode";

import { getCurrentPanel, openTodoBoard } from "./open-board";

export async function filterByLabel(label: string): Promise<void> {
  let panel = getCurrentPanel();

  if (!panel) {
    await openTodoBoard();
    panel = getCurrentPanel();
  }

  if (panel) {
    panel.reveal(vscode.ViewColumn.Active);
    panel.webview.postMessage({
      type: "filterByLabel",
      label,
    });
  }
}
