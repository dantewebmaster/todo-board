import * as vscode from "vscode";

import { REGEX } from "@/constants/regex";
import { generateNonce } from "@/utils/generators";
import { parseTodoPriority } from "@/utils/priority";
import { escapeAttribute, escapeHtml } from "@/utils/sanitize";
import type {
  BoardItem,
  TodoGroups,
  TodoHit,
  TodoPriority,
} from "@/types/todo";

const PRIORITY_LEVELS: TodoPriority[] = ["low", "medium", "high"];

const PRIORITY_LABELS: Record<TodoPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function renderBoard(
  webview: vscode.Webview,
  groups: TodoGroups,
): string {
  const nonce = generateNonce();
  const columns = PRIORITY_LEVELS.map((status) =>
    renderColumn(status, groups[status]),
  ).join("");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TODO Board</title>
    <style>
      :root {
        color-scheme: var(--vscode-color-scheme);
        font-family: var(--vscode-font-family);
        font-size: var(--vscode-font-size);
      }

      body {
        margin: 0;
        padding: 16px;
        background-color: var(--vscode-editor-background);
        color: var(--vscode-foreground);
      }

      h1 {
        font-size: 18px;
        margin: 0 0 16px;
      }

      .board {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 16px;
      }

      .column {
        background-color: var(--vscode-sideBar-background);
        border: 1px solid var(--vscode-widget-border);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .column__header {
        padding: 12px 16px;
        border-bottom: 1px solid var(--vscode-widget-border);
        font-weight: 600;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 0;
        background-color: var(--vscode-sideBar-background);
        z-index: 1;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .column__content {
        flex: 1;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .card {
        border-radius: 6px;
        border: 1px solid transparent;
        padding: 12px;
        background: var(--vscode-editorWidget-background);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        transition: border-color 120ms ease, transform 120ms ease;
      }

      .card:hover {
        border-color: var(--vscode-focusBorder);
        transform: translateY(-1px);
      }

      .card__description {
        font-size: 16px;
        margin: 0 0 8px;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .card__meta {
        font-size: 12px;
        color: var(--vscode-descriptionForeground);
      }

      .card__labels {
        margin-top: 8px;
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .card__labels .badge {
        margin-top: 4px;
        padding: 2px 4px;
        background-color: var(--vscode-badge-background);
        color: var(--vscode-badge-foreground);
        border-radius: 4px;
        font-size: 12px;
      }

      .badge {
        background-color: var(--vscode-button-secondaryBackground);
        color: var(--vscode-button-secondaryForeground);
        border-radius: 999px;
        padding: 2px 8px;
        font-size: 12px;
      }

      .empty {
        font-size: 13px;
        color: var(--vscode-descriptionForeground);
      }
    </style>
  </head>
  <body>
    <h1>TODO Board</h1>
    <div class="board">
      ${columns}
    </div>
    <script nonce="${nonce}">
      const vscode = acquireVsCodeApi();
      document.querySelectorAll('[data-card="true"]').forEach((element) => {
        element.addEventListener('click', () => {
          const file = element.getAttribute('data-file');
          const line = Number(element.getAttribute('data-line') ?? '0');
          vscode.postMessage({ type: 'open', file, line });
        });
      });
    </script>
  </body>
</html>`;
}

function renderColumn(priority: TodoPriority, items: BoardItem[]): string {
  const title = PRIORITY_LABELS[priority];
  const count = items.length;
  const cards =
    count === 0 ? renderEmptyColumn() : items.map(renderCard).join("");

  return `<section class="column">
    <header class="column__header">
      <span>${escapeHtml(title)}</span>
      <span class="badge">${count}</span>
    </header>
    <div class="column__content">
      ${cards}
    </div>
  </section>`;
}

function renderCard(item: BoardItem): string {
  const description = item.description;
  const formattedDescription = escapeHtml(description).replace(/\n/g, "<br />");
  const location = `${escapeHtml(item.relativePath)}:${item.line + 1}`;

  const labelsHtml =
    item.labels && item.labels.length > 0
      ? `<div class="card__labels">
      ${item.labels.map((label) => `<span class="badge">${escapeHtml(label)}</span>`).join("")}
    </div>`
      : "";

  return `<article class="card" data-card="true" data-file="${escapeAttribute(item.filePath)}" data-line="${item.line}">
    <h2 class="card__description">${formattedDescription}</h2>
    <p class="card__meta">${location}</p>
    ${labelsHtml}
  </article>`;
}

function renderEmptyColumn(): string {
  return `<p class="empty">No tasks found.</p>`;
}

export function buildBoardItems(hits: TodoHit[]): BoardItem[] {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  const relativePathResolver = workspaceFolders?.length
    ? (uri: string) => vscode.workspace.asRelativePath(uri)
    : (uri: string) => uri;

  return hits.map((hit) => toBoardItem(hit, relativePathResolver(hit.file)));
}

function toBoardItem(hit: TodoHit, relativePath: string): BoardItem {
  const { priority, description, labels } = parseTodoPriority(hit.text);
  const normalizedDescription = description.replace(
    REGEX.LINE_BREAK_REGEX,
    REGEX.LINE_BREAK_TOKEN,
  );

  return {
    id: hit.id,
    priority,
    description: normalizedDescription,
    filePath: hit.file,
    relativePath,
    line: hit.line,
    labels,
  };
}

function compareBoardItems(left: BoardItem, right: BoardItem): number {
  if (left.relativePath !== right.relativePath) {
    return left.relativePath.localeCompare(right.relativePath);
  }

  if (left.line !== right.line) {
    return left.line - right.line;
  }

  return left.description.localeCompare(right.description);
}

export function groupItems(items: BoardItem[]): TodoGroups {
  const groups: TodoGroups = {
    low: [],
    medium: [],
    high: [],
  };

  for (const item of items) {
    groups[item.priority ?? "low"].push(item);
  }

  for (const priority of PRIORITY_LEVELS) {
    groups[priority].sort(compareBoardItems);
  }

  return groups;
}
