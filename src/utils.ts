import type { TextDocument } from "vscode";
export const LINE_BREAK_TOKEN = "\n";

export function sanitizeTodoExtract(raw: string): string {
  return raw
    .trim()
    .replace(/\\"/g, '"')
    .replace(/\\n/g, " ")
    .replace(/\*\/\s*$/, "")
    .replace(/-->\s*$/, "")
    .replace(/""$/, '"');
}

export function isLineComment(text: string): boolean {
  return /^\s*(?:\/\/|#)/.test(text);
}

export function extractCommentContent(text: string): string {
  return text.replace(/^\s*(?:\/\/|#)\s?/, "").trim();
}

export function isTodoLine(text: string, matchPattern: RegExp): boolean {
  return text.includes("@TODO") && matchPattern.test(text);
}

export function isBlockStartWithoutEnd(text: string): boolean {
  return text.includes("/*") && !text.includes("*/");
}

export function isHtmlBlockStartWithoutEnd(text: string): boolean {
  return text.includes("<!--") && !text.includes("-->");
}

export function stripBlockLinePrefix(text: string): string {
  return text.replace(/^\s*\*?\s?/, "");
}

export function collectBlockContinuation(
  doc: TextDocument,
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

export function collectHtmlBlockContinuation(
  doc: TextDocument,
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

export function collectContinuation(
  doc: TextDocument,
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
