import * as vscode from "vscode";

import type { TodoHit } from "@/types/todo";

export async function persistResults(results: TodoHit[]): Promise<void> {
  if (!vscode.workspace.workspaceFolders?.length) {
    return;
  }

  const folder = vscode.workspace.workspaceFolders[0].uri;
  const dir = vscode.Uri.joinPath(folder, ".todo-board");
  const file = vscode.Uri.joinPath(dir, "todos.json");
  const encoder = new TextEncoder();

  try {
    await vscode.workspace.fs.createDirectory(dir);

    await vscode.workspace.fs.writeFile(
      file,
      encoder.encode(JSON.stringify(results, null, 2)),
    );
  } catch {
    // ignore
  }
}

export async function loadPersistedTodos(): Promise<TodoHit[]> {
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

    return parsed.filter(isValidTodoHit).map((todo) => {
      // Convert lastModified string back to Date object if present
      if (todo.lastModified && typeof todo.lastModified === "string") {
        return {
          ...todo,
          lastModified: new Date(todo.lastModified),
        };
      }

      return todo;
    });
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
