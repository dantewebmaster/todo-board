import * as vscode from "vscode";

import { filterState } from "@/services/filter-state";
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

    // Update filter state
    filterState.setActiveLabel(label);
  }
}
