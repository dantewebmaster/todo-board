import * as vscode from "vscode";

import { REGEX } from "@/constants/regex";
import { generateNonce } from "@/utils/generators";
import { getLabelColor } from "@/utils/label";
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

      body * {
        box-sizing: border-box;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        gap: 16px;
        position: sticky;
        top: 0;
        background-color: var(--vscode-editor-background);
        z-index: 2;
        padding-top: 8px;
        padding-bottom: 8px;
      }

      h1 {
        font-size: 18px;
        margin: 0;
      }

      .search-container {
        display: flex;
        align-items: center;
        flex: 1;
        max-width: 344px;
        height: 40px;
        padding: 4px;

        background-color: var(--vscode-input-background);
        border: 1px solid var(--vscode-input-border);
        border-radius: 4px;
        overflow: hidden;
      }

      .search-icon {
        height: 32px;
        width: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        opacity: 0.6;
      }

      .search-icon svg {
        width: 16px;
        height: 16px;
        fill: currentColor;
      }

      .search-input {
        background: transparent;
        color: var(--vscode-input-foreground);
        flex: 1;
        padding: 8px 4px;
        font-size: 14px;
        outline: none;
        height: 40px;
        border: none;
        transition: border-color 120ms ease;
      }

      .search-input:focus {
        border-color: var(--vscode-focusBorder);
      }

      .search-input::placeholder {
        color: var(--vscode-input-placeholderForeground);
      }

      .search-clear {
        height: 32px;
        width: 32px;
        background-color: transparent;
        color: var(--vscode-input-foreground);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .search-clear svg {
        width: 16px;
        height: 16px;
        fill: currentColor;
      }

      .search-clear:hover:not(:disabled) {
        background-color: var(--vscode-toolbar-hoverBackground);
      }

      .search-clear:disabled {
        display: none;
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
        border-radius: 8px 8px 0 0;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 54px;
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
        display: flex;
        flex-direction: column;
        word-break: break-word;
        overflow-wrap: break-word;
      }

      .card:hover {
        border-color: var(--vscode-focusBorder);
        transform: translateY(-1px);
      }

      .card.hidden {
        display: none;
      }

      .card__description {
        font-size: 14px;
        font-weight: 500;
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
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.3px;
        text-transform: uppercase;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
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
    <div class="header">
      <h1>TODO Board</h1>
      <div class="search-container">
        <span class="search-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path d="M15.7 13.3l-3.81-3.83A5.93 5.93 0 0 0 13 6c0-3.31-2.69-6-6-6S1 2.69 1 6s2.69 6 6 6c1.3 0 2.48-.41 3.47-1.11l3.83 3.81c.19.2.45.3.7.3.25 0 .52-.09.7-.3a.996.996 0 0 0 0-1.41v.01zM7 10.7c-2.59 0-4.7-2.11-4.7-4.7 0-2.59 2.11-4.7 4.7-4.7 2.59 0 4.7 2.11 4.7 4.7 0 2.59-2.11 4.7-4.7 4.7z"/>
          </svg>
        </span>
        <input
          type="text"
          class="search-input"
          id="searchInput"
          placeholder="Search TODOs..."
          autocomplete="off"
        />
        <button class="search-clear" id="clearButton" disabled title="Clear search">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.707.708L7.293 8l-3.646 3.646.707.708L8 8.707z"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="board">
      ${columns}
    </div>
    <script nonce="${nonce}">
      const vscode = acquireVsCodeApi();
      const searchInput = document.getElementById('searchInput');
      const clearButton = document.getElementById('clearButton');
      const cards = document.querySelectorAll('[data-card="true"]');

      // Handle card clicks
      cards.forEach((element) => {
        element.addEventListener('click', () => {
          const file = element.getAttribute('data-file');
          const line = Number(element.getAttribute('data-line') ?? '0');
          vscode.postMessage({ type: 'open', file, line });
        });
      });

      // Filter cards based on search input
      function filterCards(searchText) {
        const query = searchText.toLowerCase().trim();

        cards.forEach((card) => {
          if (!query) {
            card.classList.remove('hidden');
            return;
          }

          const description = card.querySelector('.card__description')?.textContent?.toLowerCase() || '';
          const location = card.querySelector('.card__meta')?.textContent?.toLowerCase() || '';
          const labels = Array.from(card.querySelectorAll('.card__labels .badge'))
            .map(badge => badge.textContent?.toLowerCase() || '')
            .join(' ');

          const searchableText = \`\${description} \${location} \${labels}\`;

          if (searchableText.includes(query)) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });

        // Update clear button state
        clearButton.disabled = !query;
      }

      // Search input event
      searchInput.addEventListener('input', (e) => {
        filterCards(e.target.value);
      });

      // Clear button event
      clearButton.addEventListener('click', () => {
        searchInput.value = '';
        filterCards('');
        searchInput.focus();
      });

      // Allow clearing with Escape key
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          searchInput.value = '';
          filterCards('');
        }
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
