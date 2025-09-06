import * as vscode from "vscode";
import { readCache, writeCache } from "./cache";
import { getExcludeGlob, getIncludeGlob } from "./config";
import type { CacheData, ScanResult, TodoHit } from "./types";

export async function scanWorkspace(
  progress?: vscode.Progress<{ message?: string; increment?: number }>,
  token?: vscode.CancellationToken,
): Promise<ScanResult> {
  const hits: TodoHit[] = [];
  let reused = 0;
  let scanned = 0;
  const pattern = /@TODO(?:\([^)]*\))?/;

  const include = getIncludeGlob();
  const exclude = getExcludeGlob();
  const uris = await vscode.workspace.findFiles(include, exclude, 12000);

  const root = vscode.workspace.workspaceFolders?.[0]?.uri;
  const cache: CacheData = root
    ? await readCache(root)
    : ({ version: 1, files: {} } as const satisfies CacheData);

  const updated: string[] = [];

  const concurrency = 25;
  let cursor = 0;

  async function processFile(uri: vscode.Uri) {
    try {
      const stat = await vscode.workspace.fs.stat(uri);
      const key = uri.fsPath;
      const prev = cache.files[key];

      if (prev && prev.mtime === stat.mtime) {
        for (const h of prev.hits) {
          hits.push({ file: key, line: h.line, text: h.text });
        }

        reused += prev.hits.length;
        return;
      }

      const doc = await vscode.workspace.openTextDocument(uri);

      if (doc.lineCount > 6000) {
        return;
      }

      const localHits: { line: number; text: string }[] = [];

      for (let i = 0; i < doc.lineCount; i++) {
        const text = doc.lineAt(i).text;

        if (text.includes("@TODO") && pattern.test(text)) {
          const idx = text.indexOf("@TODO");
          const extract = text.substring(idx).trim();
          localHits.push({ line: i, text: extract });
          hits.push({ file: key, line: i, text: extract });
        }
      }

      scanned += localHits.length;

      cache.files[key] = { mtime: stat.mtime, hits: localHits };
      updated.push(key);
    } catch {
      // ignore
    }
  }

  async function worker() {
    while (true) {
      const i = cursor++;

      if (i >= uris.length) {
        break;
      }

      if (token?.isCancellationRequested) {
        return;
      }

      await processFile(uris[i]);

      if (progress) {
        const pct = ((i + 1) / uris.length) * 100;

        progress.report({
          increment: 0,
          message: `${pct.toFixed(1)}% (${i + 1}/${uris.length})`,
        });
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));

  if (token?.isCancellationRequested) {
    return { hits, reused, scanned };
  }

  if (root && updated.length) {
    writeCache(root, cache).catch(() => undefined);
  }

  return { hits, reused, scanned };
}
