import * as vscode from "vscode";
import { readCache, writeCache } from "./cache";
import { getExcludeGlob, getIncludeGlob } from "./config";
import type { CacheData, ScanResult, TodoHit } from "./types";

function sanitizeTodoExtract(raw: string): string {
  // Basic cleanup: trim, unescape common sequences, and collapse double quotes at end
  return raw
    .trim()
    .replace(/\\"/g, '"')
    .replace(/\\n/g, " ")
    .replace(/\*\/\s*$/, "")
    .replace(/-->\s*$/, "")
    .replace(/""$/, '"');
}

export async function scanWorkspace(
  progress?: vscode.Progress<{ message?: string; increment?: number }>,
  token?: vscode.CancellationToken,
): Promise<ScanResult> {
  const hits: TodoHit[] = [];
  let reused = 0;
  let scanned = 0;
  let filesProcessed = 0;
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

  function isLineComment(text: string): boolean {
    // Suporta // e # no início da linha
    return /^\s*(?:\/\/|#)/.test(text);
  }

  function extractCommentContent(text: string): string {
    // Remove prefix de comentário '//' ou '#' e espaços iniciais
    return text.replace(/^\s*(?:\/\/|#)\s?/, "").trim();
  }

  function isTodoLine(text: string, matchPattern: RegExp): boolean {
    return text.includes("@TODO") && matchPattern.test(text);
  }

  const LINE_BREAK_TOKEN = "\n";

  function isBlockStartWithoutEnd(text: string): boolean {
    return text.includes("/*") && !text.includes("*/");
  }

  function isHtmlBlockStartWithoutEnd(text: string): boolean {
    return text.includes("<!--") && !text.includes("-->");
  }

  function stripBlockLinePrefix(text: string): string {
    // Remove prefixo comum de linhas em bloco: * ou /**
    return text.replace(/^\s*\*?\s?/, "");
  }

  function collectBlockContinuation(
    doc: vscode.TextDocument,
    startIndex: number,
    matchPattern: RegExp,
  ): { combinedSuffix: string; endIndex: number } {
    let j = startIndex;
    const parts: string[] = [];

    while (j < doc.lineCount) {
      const nextText = doc.lineAt(j).text;
      if (isTodoLine(nextText, matchPattern)) {
        break;
      }

      const trimmed = nextText.trim();
      if (trimmed.startsWith("*/")) {
        j++;
        break;
      }

      if (trimmed.includes("*/")) {
        const before = trimmed.split("*/")[0] ?? "";
        parts.push(sanitizeTodoExtract(stripBlockLinePrefix(before)));
        j++;
        break;
      }

      if (/^\s*\*/.test(nextText) || /^\s*\/\*/.test(nextText)) {
        const content = sanitizeTodoExtract(stripBlockLinePrefix(nextText));
        parts.push(content);
        j++;
        continue;
      }

      break;
    }

    return { combinedSuffix: parts.join(LINE_BREAK_TOKEN), endIndex: j };
  }

  function collectHtmlBlockContinuation(
    doc: vscode.TextDocument,
    startIndex: number,
    matchPattern: RegExp,
  ): { combinedSuffix: string; endIndex: number } {
    let j = startIndex;
    const parts: string[] = [];

    while (j < doc.lineCount) {
      const nextText = doc.lineAt(j).text;
      if (isTodoLine(nextText, matchPattern)) {
        break;
      }
      const trimmed = nextText.trim();
      if (trimmed.includes("-->")) {
        const before = trimmed.split("-->")[0] ?? "";
        parts.push(sanitizeTodoExtract(before));
        j++;
        break;
      }
      parts.push(sanitizeTodoExtract(nextText));
      j++;
    }

    return { combinedSuffix: parts.join(LINE_BREAK_TOKEN), endIndex: j };
  }

  function collectContinuation(
    doc: vscode.TextDocument,
    startIndex: number,
    matchPattern: RegExp,
  ): { combinedSuffix: string; endIndex: number } {
    let j = startIndex;
    const parts: string[] = [];

    while (j < doc.lineCount) {
      const nextText = doc.lineAt(j).text;
      if (isTodoLine(nextText, matchPattern)) {
        break;
      }
      if (!isLineComment(nextText)) {
        break;
      }

      const content = sanitizeTodoExtract(extractCommentContent(nextText));
      parts.push(content);
      j++;
    }

    const combinedSuffix = parts.join(LINE_BREAK_TOKEN);
    return { combinedSuffix, endIndex: j };
  }

  function scanDocumentForTasks(
    doc: vscode.TextDocument,
    matchPattern: RegExp,
  ): { localHits: { line: number; text: string }[] } {
    const localHits: { line: number; text: string }[] = [];
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
        localHits.push({ line: i, text });
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
          hits.push({ file: key, line: h.line, text: h.text });
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
        hits.push({ file: key, line: h.line, text: h.text });
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
