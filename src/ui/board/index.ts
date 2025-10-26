import type * as vscode from "vscode";

import { generateNonce } from "@/utils/generators";
import { renderColumn } from "./components/board-column";
import { getHeaderComponent } from "./components/header";
import { getBoardScripts } from "./scripts";
import { getBoardStyles } from "./styles";
import type { TodoGroups, TodoPriority } from "@/types/todo";

const PRIORITY_LEVELS: TodoPriority[] = ["low", "medium", "high"];

export function renderBoard(
  webview: vscode.Webview,
  groups: TodoGroups,
): string {
  const nonce = generateNonce();
  const columns = PRIORITY_LEVELS.map((status) =>
    renderColumn(status, groups[status]),
  ).join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>TODO Board</title>
        <style>
          ${getBoardStyles()}
        </style>
      </head>
      <body>
        ${getHeaderComponent()}
        <div class="board">
          ${columns}
        </div>
        <script nonce="${nonce}">
          ${getBoardScripts()}
        </script>
      </body>
    </html>
  `;
}
