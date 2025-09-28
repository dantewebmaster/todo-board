import * as vscode from "vscode";
import type { TodoHit } from "./types";

export type TodoStatus = "todo" | "doing" | "done";

interface BoardItem {
  id: string;
  status: TodoStatus;
  summary: string;
  description: string;
  filePath: string;
  relativePath: string;
  line: number;
}

interface TodoGroups {
  todo: BoardItem[];
  doing: BoardItem[];
  done: BoardItem[];
}

const STATUS_LABELS: Record<TodoStatus, string> = {
  todo: "Todo",
  doing: "Doing",
  done: "Done",
};

const STATUS_ORDER: TodoStatus[] = ["todo", "doing", "done"];

const STATUS_REGEX = /^@TODO(?:\(([^)]+)\))?/i;

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

async function loadPersistedTodos(): Promise<TodoHit[]> {
  const folders = vscode.workspace.workspaceFolders;

  if (!folders || folders.length === 0) {
    return [];
  }

  const storageFile = vscode.Uri.joinPath(
    folders[0].uri,
    ".todo-board",
    "todos.json",
  );

  try {
    const raw = await vscode.workspace.fs.readFile(storageFile);
    const decoded = new TextDecoder().decode(raw);
    const parsed = JSON.parse(decoded);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isValidTodoHit);
  } catch {
    return [];
  }
}

function isValidTodoHit(value: unknown): value is TodoHit {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.file === "string" &&
    typeof candidate.line === "number" &&
    typeof candidate.text === "string"
  );
}

function buildBoardItems(hits: TodoHit[]): BoardItem[] {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  const relativePathResolver = workspaceFolders?.length
    ? (uri: string) => vscode.workspace.asRelativePath(uri)
    : (uri: string) => uri;

  return hits.map((hit) => toBoardItem(hit, relativePathResolver(hit.file)));
}

function groupItems(items: BoardItem[]): TodoGroups {
  const groups: TodoGroups = {
    todo: [],
    doing: [],
    done: [],
  };

  for (const item of items) {
    groups[item.status].push(item);
  }

  for (const status of STATUS_ORDER) {
    groups[status].sort(compareBoardItems);
  }

  return groups;
}

function compareBoardItems(left: BoardItem, right: BoardItem): number {
  if (left.relativePath !== right.relativePath) {
    return left.relativePath.localeCompare(right.relativePath);
  }

  if (left.line !== right.line) {
    return left.line - right.line;
  }

  return left.summary.localeCompare(right.summary);
}

function toBoardItem(hit: TodoHit, relativePath: string): BoardItem {
  const { status, description } = parseTodoStatus(hit.text);
  const normalizedDescription = description.replace(/\r\n/g, "\n");
  const descriptionLines = normalizedDescription.split("\n");
  const summaryCandidate = descriptionLines[0]?.trim() ?? "";
  const summary =
    summaryCandidate.length > 0 ? summaryCandidate : "No description provided.";

  return {
    id: hit.id,
    status,
    summary,
    description: normalizedDescription,
    filePath: hit.file,
    relativePath,
    line: hit.line,
  };
}

export function parseTodoStatus(text: string): {
  status: TodoStatus;
  description: string;
} {
  const match = STATUS_REGEX.exec(text);

  if (!match) {
    return { status: "todo", description: text.trim() };
  }

  const metadata = match[1] ?? "";
  const token = extractStatusToken(metadata);
  const status: TodoStatus = normalizeStatus(token);
  const description = text.slice(match[0].length).trimStart();

  return {
    status,
    description: description.length > 0 ? description : "",
  };
}

function extractStatusToken(metadata: string): string {
  const firstSection = metadata.split(",")[0] ?? metadata;
  const token = firstSection.split(":")[0] ?? firstSection;

  return token.trim().toLowerCase();
}

function normalizeStatus(token: string): TodoStatus {
  if (token === "doing") {
    return "doing";
  }

  if (token === "done") {
    return "done";
  }

  return "todo";
}

function renderBoard(webview: vscode.Webview, groups: TodoGroups): string {
  const nonce = generateNonce();
  const columns = STATUS_ORDER.map((status) =>
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

      .card__summary {
        font-weight: 600;
        margin: 0 0 8px;
        font-size: 14px;
      }

      .card__description {
        font-size: 13px;
        margin: 0 0 8px;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .card__meta {
        font-size: 12px;
        color: var(--vscode-descriptionForeground);
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

function renderColumn(status: TodoStatus, items: BoardItem[]): string {
  const title = STATUS_LABELS[status];
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

function renderEmptyColumn(): string {
  return `<p class="empty">No tasks found.</p>`;
}

function renderCard(item: BoardItem): string {
  const description =
    item.description.length > 0 ? item.description : item.summary;
  const summary = escapeHtml(item.summary);
  const formattedDescription = escapeHtml(description).replace(/\n/g, "<br />");
  const location = `${escapeHtml(item.relativePath)}:${item.line + 1}`;

  return `<article class="card" data-card="true" data-file="${escapeAttribute(item.filePath)}" data-line="${item.line}">
    <h2 class="card__summary">${summary}</h2>
    <p class="card__description">${formattedDescription}</p>
    <p class="card__meta">${location}</p>
  </article>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function generateNonce(): string {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * alphabet.length),
  );

  return randomValues.map((index) => alphabet[index] ?? "").join("");
}
