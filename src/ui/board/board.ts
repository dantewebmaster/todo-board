import * as vscode from "vscode";

import { REGEX } from "@/constants/regex";
import { generateNonce } from "@/utils/generators";
import { getLabelColor } from "@/utils/label";
import { parseTodoPriority } from "@/utils/priority";
import { escapeAttribute, escapeHtml } from "@/utils/sanitize";
import { getHeaderComponent } from "./header";
import { getBoardScripts } from "./scripts";
import { getBoardStyles } from "./styles";
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
      ${item.labels
        .map((label) => {
          const colors = getLabelColor(label);
          return `<span class="badge" style="background-color: ${colors.background}; color: ${colors.text};">${escapeHtml(label)}</span>`;
        })
        .join("")}
    </div>`
      : "";

  return `<article class="card" data-card="true" data-file="${escapeAttribute(item.filePath)}" data-line="${item.line}">
    <h2 class="card__description">${formattedDescription}</h2>
    <p class="card__meta">${location}</p>
    ${labelsHtml}
  </article>`;
}

function renderEmptyColumn(): string {
  return `<p class="empty">No TODOs found.</p>`;
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
