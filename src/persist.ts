import * as vscode from "vscode";
import type { TodoHit } from "./types";

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
