import * as vscode from "vscode";

import { filterState } from "@/services/filter-state";
import { loadPersistedTodos } from "@/services/persist";
import { generateNonce } from "@/utils/generators";
import { countLabels } from "@/utils/label";
import { sidebarIcons } from "./icons";
import { getSidebarScripts } from "./scripts";
import { getSidebarStyles } from "./styles";

export class TodoSidebarProvider implements vscode.WebviewViewProvider {
  private webviewView?: vscode.WebviewView;

  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.webviewView = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    this.updateWebviewContent(webviewView.webview);

    // Listen for filter changes
    filterState.onFilterChange((activeLabel) => {
      if (this.webviewView) {
        this.webviewView.webview.postMessage({
          type: "setActiveFilter",
          label: activeLabel,
        });
      }
    });

    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.type) {
        case "openBoard":
          void vscode.commands.executeCommand("todo-board.showBoard");
          break;
        case "scanTodos":
          void vscode.commands.executeCommand("todo-board.scanTodos");
          break;
        case "filterByLabel":
          void vscode.commands.executeCommand(
            "todo-board.filterByLabel",
            message.label,
          );
          break;
      }
    });
  }

  async updateWebviewContent(webview: vscode.Webview): Promise<void> {
    const hits = await loadPersistedTodos();
    const todoCount = hits.length;
    const labelCounts = countLabels(hits);
    const nonce = generateNonce();

    const labelsHtml =
      labelCounts.size > 0
        ? Array.from(labelCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(
              ([label, count]) => `
          <div class="label-item" data-label="${label}" title="Click to filter by '${label}'">
            <div class="label-item__info">
              <div class="label-item__icon">${this.getLabelIconSvg(label)}</div>
              <span class="label-item__name">${label}</span>
            </div>
            <span class="label-item__count">${count}</span>
          </div>
        `,
            )
            .join("")
        : `<div class="empty-state">
            ${sidebarIcons.sparkle}
            <p>No labels found yet.<br>Start adding labels to your TODOs!</p>
          </div>`;

    webview.html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TODO Board</title>
    <style>${getSidebarStyles()}</style>
  </head>
  <body>
    <div class="actions">
      <button class="btn btn--primary" data-action="openBoard">
        ${sidebarIcons.board}
        <span>Open Board</span>
      </button>
      <button class="btn btn--secondary" data-action="scanTodos">
        ${sidebarIcons.search}
        <span>Scan Workspace</span>
      </button>
    </div>

    <div class="divider"></div>

    <div class="section">
      <div class="totals-overview">
        <div class="stats-card">
          <div class="stats-card__value">${todoCount}</div>
          <div class="stats-card__label">Total TODOs</div>
        </div>
        <div class="stats-card">
          <div class="stats-card__value text-orange">${labelCounts.size}</div>
          <div class="stats-card__label">Total Labels</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section__header">
        <span class="section__title">
          ${sidebarIcons.tag}
          Labels
        </span>
        <span class="section__badge">${labelCounts.size}</span>
      </div>
      <div class="label-list">
        ${labelsHtml}
      </div>
    </div>

    <script nonce="${nonce}">
      ${getSidebarScripts()}
    </script>
  </body>
</html>`;
  }

  private getLabelIconSvg(label: string): string {
    // Map common label types to icons
    const iconMap: Record<string, string> = {
      bug: sidebarIcons.bug,
      feature: sidebarIcons.sparkle,
      refactor: sidebarIcons.code,
      cleanup: sidebarIcons.tools,
      docs: sidebarIcons.board,
      ui: sidebarIcons.paintBrush,
      ux: sidebarIcons.paintBrush,
      database: sidebarIcons.database,
      api: sidebarIcons.code,
    };

    return iconMap[label.toLowerCase()] || sidebarIcons.tag;
  }

  refresh(): void {
    if (this.webviewView) {
      this.updateWebviewContent(this.webviewView.webview);
    }
  }
}

export function registerTodoSidebar(context: vscode.ExtensionContext): {
  disposable: vscode.Disposable;
  provider: TodoSidebarProvider;
} {
  const provider = new TodoSidebarProvider(context.extensionUri);

  const webviewView = vscode.window.registerWebviewViewProvider(
    "todoBoard",
    provider,
    {
      webviewOptions: {
        retainContextWhenHidden: true,
      },
    },
  );

  context.subscriptions.push(webviewView);

  return { disposable: webviewView, provider };
}
