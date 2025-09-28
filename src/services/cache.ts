import * as vscode from "vscode";

import { generateTodoId } from "@/utils/generators";
import type { CacheData } from "@/types/cache";

export async function readCache(root: vscode.Uri): Promise<CacheData> {
  const cacheFile = vscode.Uri.joinPath(root, ".todo-board", "cache.json");

  try {
    const data = await vscode.workspace.fs.readFile(cacheFile);
    const parsed = JSON.parse(new TextDecoder().decode(data));
    const maybeNormalized = normalizeParsedCache(parsed);
    if (maybeNormalized) {
      return maybeNormalized;
    }
  } catch {
    // ignore
  }

  return { version: 2, files: {} };
}

export async function writeCache(
  root: vscode.Uri,
  cache: CacheData,
): Promise<void> {
  const dir = vscode.Uri.joinPath(root, ".todo-board");

  await vscode.workspace.fs.createDirectory(dir);

  const cacheFile = vscode.Uri.joinPath(dir, "cache.json");

  await vscode.workspace.fs.writeFile(
    cacheFile,
    new TextEncoder().encode(
      JSON.stringify(
        cache.version === 2 ? cache : { version: 2, files: cache.files },
        null,
        2,
      ),
    ),
  );
}

function normalizeParsedCache(parsed: unknown): CacheData | null {
  if (!parsed || typeof parsed !== "object" || !("files" in parsed)) {
    return null;
  }

  const filesValue = (parsed as Record<string, unknown>).files;

  if (!filesValue || typeof filesValue !== "object") {
    return null;
  }

  const normalized: CacheData = { version: 2, files: {} };

  for (const [file, entryValue] of Object.entries(
    filesValue as Record<string, unknown>,
  )) {
    if (!entryValue || typeof entryValue !== "object") {
      continue;
    }

    const entryObj = entryValue as Record<string, unknown>;
    const mtimeRaw = entryObj.mtime;
    const mtime: number = typeof mtimeRaw === "number" ? mtimeRaw : 0;
    const hitsRaw = entryObj.hits;
    const hitsArray = Array.isArray(hitsRaw) ? hitsRaw : [];

    const hits = hitsArray.map((hValue) => {
      if (!hValue || typeof hValue !== "object") {
        return { id: generateTodoId(file, 0, ""), line: 0, text: "" };
      }

      const hObj = hValue as Record<string, unknown>;
      const line = typeof hObj.line === "number" ? hObj.line : 0;
      const text = typeof hObj.text === "string" ? hObj.text : "";
      const existingId = hObj.id;
      const id =
        typeof existingId === "string" && existingId.length > 0
          ? existingId
          : generateTodoId(file, line, text);

      return { id, line, text };
    });

    normalized.files[file] = { mtime, hits };
  }

  return normalized;
}
