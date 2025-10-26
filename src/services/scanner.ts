import * as vscode from "vscode";

import {
  getExcludeGlob,
  getIncludeGlob,
  getMaxTodoLines,
  getSearchPatterns,
  getTodoPattern,
} from "@/config";
import { REGEX } from "@/constants/regex";
import { readCache, writeCache } from "@/services/cache";
import { generateTodoId } from "@/utils/generators";
import { findFirstPatternIndex } from "@/utils/regex-builder";
import { sanitizeTodoExtract } from "@/utils/sanitize";
import type { CacheData } from "@/types/cache";
import type { ScanResult, TodoHit } from "@/types/todo";

export async function scanWorkspace(
  progress?: vscode.Progress<{ message?: string; increment?: number }>,
  token?: vscode.CancellationToken,
): Promise<ScanResult> {
  const hits: TodoHit[] = [];
  let reused = 0;
  let scanned = 0;
  let filesProcessed = 0;
  const pattern = getTodoPattern();
  const searchPatterns = getSearchPatterns();
  const maxLines = getMaxTodoLines();

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
    patterns: string[],
  ): { localHits: { id: string; line: number; text: string }[] } {
    const localHits: { id: string; line: number; text: string }[] = [];
    let i = 0;

    function buildCombinedFromLine(index: number): {
      text: string;
      endIndex: number;
    } {
      const lineText = doc.lineAt(index).text;
      const idx = findFirstPatternIndex(lineText, patterns);
      const raw = lineText.substring(idx).trim();
      let combined = sanitizeTodoExtract(raw);

      if (isHtmlBlockStartWithoutEnd(lineText)) {
        const { combinedSuffix, endIndex } = collectHtmlBlockContinuation(
          doc,
          index + 1,
          matchPattern,
          patterns,
          maxLines,
        );

        if (combinedSuffix.length > 0) {
          combined = `${combined}${REGEX.LINE_BREAK_TOKEN}${combinedSuffix}`;
        }

        return { text: combined, endIndex };
      }

      if (isBlockStartWithoutEnd(lineText)) {
        const { combinedSuffix, endIndex } = collectBlockContinuation(
          doc,
          index + 1,
          matchPattern,
          patterns,
          maxLines,
        );

        if (combinedSuffix.length > 0) {
          combined = `${combined}${REGEX.LINE_BREAK_TOKEN}${combinedSuffix}`;
        }

        return { text: combined, endIndex };
      }

      const { combinedSuffix, endIndex } = collectContinuation(
        doc,
        index + 1,
        matchPattern,
        patterns,
        maxLines,
      );

      if (combinedSuffix.length > 0) {
        combined = `${combined}${REGEX.LINE_BREAK_TOKEN}${combinedSuffix}`;
      }

      return { text: combined, endIndex };
    }

    while (i < doc.lineCount) {
      const lineText: string = doc.lineAt(i).text;

      if (isTodoLine(lineText, matchPattern, patterns)) {
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

      const { localHits } = scanDocumentForTasks(doc, pattern, searchPatterns);
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

// @TODO: talvez separar esses metodos em outro arquivo utils/scanner.ts
// por enquanto são utilizados apenas aqui.
function collectBlockContinuation(
  doc: vscode.TextDocument,
  startIndex: number,
  matchPattern: RegExp,
  patterns: string[],
  maxLines = 4,
): { combinedSuffix: string; endIndex: number } {
  let j = startIndex;
  const parts: string[] = [];
  const maxEndIndex = startIndex + maxLines;

  while (j < doc.lineCount && j < maxEndIndex) {
    const nextText = doc.lineAt(j).text;
    if (isTodoLine(nextText, matchPattern, patterns)) {
      break;
    }

    const trimmed = nextText.trim();
    if (trimmed.startsWith(REGEX.BLOCK_COMMENT_END)) {
      j++;
      break;
    }

    if (trimmed.includes(REGEX.BLOCK_COMMENT_END)) {
      const before = trimmed.split(REGEX.BLOCK_COMMENT_END)[0] ?? "";
      parts.push(sanitizeTodoExtract(stripBlockLinePrefix(before)));
      j++;
      break;
    }

    if (REGEX.BLOCK_CONTENT_LINE_REGEX.test(nextText)) {
      const content = sanitizeTodoExtract(stripBlockLinePrefix(nextText));
      parts.push(content);
      j++;
      continue;
    }

    break;
  }

  return { combinedSuffix: parts.join(REGEX.LINE_BREAK_TOKEN), endIndex: j };
}

function collectHtmlBlockContinuation(
  doc: vscode.TextDocument,
  startIndex: number,
  matchPattern: RegExp,
  patterns: string[],
  maxLines = 4,
): { combinedSuffix: string; endIndex: number } {
  let j = startIndex;
  const parts: string[] = [];
  const maxEndIndex = startIndex + maxLines;

  while (j < doc.lineCount && j < maxEndIndex) {
    const nextText = doc.lineAt(j).text;
    if (isTodoLine(nextText, matchPattern, patterns)) {
      break;
    }

    const trimmed = nextText.trim();
    if (trimmed.includes(REGEX.HTML_COMMENT_END)) {
      const before = trimmed.split(REGEX.HTML_COMMENT_END)[0] ?? "";
      parts.push(sanitizeTodoExtract(before));
      j++;
      break;
    }

    parts.push(sanitizeTodoExtract(nextText));
    j++;
  }

  return { combinedSuffix: parts.join(REGEX.LINE_BREAK_TOKEN), endIndex: j };
}

function collectContinuation(
  doc: vscode.TextDocument,
  startIndex: number,
  matchPattern: RegExp,
  patterns: string[],
  maxLines = 4,
): { combinedSuffix: string; endIndex: number } {
  let j = startIndex;
  const parts: string[] = [];
  const maxEndIndex = startIndex + maxLines;

  while (j < doc.lineCount && j < maxEndIndex) {
    const nextText = doc.lineAt(j).text;
    if (isTodoLine(nextText, matchPattern, patterns)) {
      break;
    }
    if (!isLineComment(nextText)) {
      break;
    }

    const content = sanitizeTodoExtract(extractCommentContent(nextText));
    parts.push(content);
    j++;
  }

  const combinedSuffix = parts.join(REGEX.LINE_BREAK_TOKEN);
  return { combinedSuffix, endIndex: j };
}

function stripBlockLinePrefix(text: string): string {
  // Remove '/**', '/*' or leading '*' with one optional following space
  // Prefer explicit pattern to handle both cases consistently
  return text.replace(/^\s*(?:\/\*\*?|\*)\s?/, "");
}

function isHtmlBlockStartWithoutEnd(text: string): boolean {
  return (
    text.includes(REGEX.HTML_COMMENT_START) &&
    !text.includes(REGEX.HTML_COMMENT_END)
  );
}

function isBlockStartWithoutEnd(text: string): boolean {
  return (
    text.includes(REGEX.BLOCK_COMMENT_START) &&
    !text.includes(REGEX.BLOCK_COMMENT_END)
  );
}

function isTodoLine(
  text: string,
  matchPattern: RegExp,
  patterns: string[],
): boolean {
  // Check if any of the search patterns exist in the text
  const hasPattern = patterns.some((pattern) => text.includes(pattern));
  return hasPattern && matchPattern.test(text);
}

function extractCommentContent(text: string): string {
  return text.replace(REGEX.LINE_COMMENT_PREFIX_REGEX, "").trim();
}

function isLineComment(text: string): boolean {
  return REGEX.LINE_COMMENT_REGEX.test(text);
}
