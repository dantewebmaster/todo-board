import { readCache, writeCache } from "@services/cache.service";
import { generateTodoId } from "@utils/generators.util";
import * as vscode from "vscode";
import { getExcludeGlob, getIncludeGlob } from "../config";
import { LINE_BREAK_TOKEN, REGEX } from "../regex";
import type { CacheData } from "../types/cache.interface";
import type { ScanResult, TodoHit } from "../types/todo.interface";
import {
  collectBlockContinuation,
  collectContinuation,
  collectHtmlBlockContinuation,
  isBlockStartWithoutEnd,
  isHtmlBlockStartWithoutEnd,
  isTodoLine,
  sanitizeTodoExtract,
} from "../utils";

export async function scanWorkspace(
  progress?: vscode.Progress<{ message?: string; increment?: number }>,
  token?: vscode.CancellationToken,
): Promise<ScanResult> {
  const hits: TodoHit[] = [];
  let reused = 0;
  let scanned = 0;
  let filesProcessed = 0;
  const pattern = REGEX.TODO_PATTERN;

  const include = getIncludeGlob();
  const exclude = getExcludeGlob();
  const uris = await vscode.workspace.findFiles(include, exclude, 12000);

  const root = vscode.workspace.workspaceFolders?.[0]?.uri;
  const cache: CacheData = root
    ? await readCache(root)
    : ({ version: 2, files: {} } as CacheData);

  const updated: string[] = [];

  const concurrency = 25;
  let cursor = 0;

  function scanDocumentForTasks(
    doc: vscode.TextDocument,
    matchPattern: RegExp,
  ): { localHits: { id: string; line: number; text: string }[] } {
    const localHits: { id: string; line: number; text: string }[] = [];
    let i = 0;

    function buildCombinedFromLine(index: number): {
      text: string;
      endIndex: number;
    } {
      const lineText = doc.lineAt(index).text;
      const idx = lineText.indexOf("@TODO");
      const raw = lineText.substring(idx).trim();
      let combined = sanitizeTodoExtract(raw);

      if (isHtmlBlockStartWithoutEnd(lineText)) {
        const { combinedSuffix, endIndex } = collectHtmlBlockContinuation(
          doc,
          index + 1,
          matchPattern,
        );

        if (combinedSuffix.length > 0) {
          combined = `${combined}${LINE_BREAK_TOKEN}${combinedSuffix}`;
        }

        return { text: combined, endIndex };
      }

      if (isBlockStartWithoutEnd(lineText)) {
        const { combinedSuffix, endIndex } = collectBlockContinuation(
          doc,
          index + 1,
          matchPattern,
        );

        if (combinedSuffix.length > 0) {
          combined = `${combined}${LINE_BREAK_TOKEN}${combinedSuffix}`;
        }

        return { text: combined, endIndex };
      }

      const { combinedSuffix, endIndex } = collectContinuation(
        doc,
        index + 1,
        matchPattern,
      );

      if (combinedSuffix.length > 0) {
        combined = `${combined}${LINE_BREAK_TOKEN}${combinedSuffix}`;
      }

      return { text: combined, endIndex };
    }

    while (i < doc.lineCount) {
      const lineText: string = doc.lineAt(i).text;

      if (isTodoLine(lineText, matchPattern)) {
        const { text, endIndex } = buildCombinedFromLine(i);
        const id = generateTodoId(doc.uri.fsPath, i, text);
        localHits.push({ id, line: i, text });
        i = endIndex; // pular linhas agregadas
        continue;
      }

      i++;
    }

    return { localHits };
  }

  async function processFile(uri: vscode.Uri) {
    try {
      const stat = await vscode.workspace.fs.stat(uri);
      const key = uri.fsPath;
      const prev = cache.files[key];

      if (prev && prev.mtime === stat.mtime) {
        for (const h of prev.hits) {
          hits.push({ id: h.id, file: key, line: h.line, text: h.text });
        }
        reused += prev.hits.length;
        return;
      }

      const doc = await vscode.workspace.openTextDocument(uri);

      if (doc.lineCount > 6000) {
        return;
      }

      const { localHits } = scanDocumentForTasks(doc, pattern);
      for (const h of localHits) {
        hits.push({ id: h.id, file: key, line: h.line, text: h.text });
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
      const uriIndex: number = cursor++;

      if (uriIndex >= uris.length) {
        break;
      }

      if (token?.isCancellationRequested) {
        return;
      }

      await processFile(uris[uriIndex]);
      filesProcessed += 1;

      if (progress) {
        const progressPercentage: number = ((uriIndex + 1) / uris.length) * 100;
        const percentageMessage = `${progressPercentage.toFixed(1)}%`;
        const fileProgressMessage = `(${uriIndex + 1}/${uris.length})`;

        progress.report({
          increment: 0,
          message: `${percentageMessage} ${fileProgressMessage}`,
        });
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));

  if (token?.isCancellationRequested) {
    return { hits, reused, scanned, filesProcessed };
  }

  if (root && updated.length) {
    writeCache(root, cache).catch(() => undefined);
  }

  return { hits, reused, scanned, filesProcessed };
}
