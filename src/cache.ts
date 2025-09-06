import * as vscode from "vscode";
import type { CacheData } from "./types";

export async function readCache(root: vscode.Uri): Promise<CacheData> {
  const cacheFile = vscode.Uri.joinPath(root, ".todo-board", "cache.json");

  try {
    const data = await vscode.workspace.fs.readFile(cacheFile);
    const parsed = JSON.parse(new TextDecoder().decode(data));

    if (parsed && parsed.version === 1 && parsed.files) {
      return parsed as CacheData;
    }
  } catch {
    // ignore
  }

  return { version: 1, files: {} };
}

export async function writeCache(root: vscode.Uri, cache: CacheData): Promise<void> {
  const dir = vscode.Uri.joinPath(root, ".todo-board");

  await vscode.workspace.fs.createDirectory(dir);

  const cacheFile = vscode.Uri.joinPath(dir, "cache.json");

  await vscode.workspace.fs.writeFile(
    cacheFile,
    new TextEncoder().encode(JSON.stringify(cache, null, 2)),
  );
}
