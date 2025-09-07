import type { TextDocument } from "vscode";

import { LINE_BREAK_TOKEN, REGEX } from "./regex";

export function sanitizeTodoExtract(raw: string): string {
  return raw
    .trim()
    .replace(REGEX.ESCAPED_QUOTE_REGEX, '"')
    .replace(REGEX.ESCAPED_NEWLINE_REGEX, " ")
    .replace(REGEX.TRAILING_BLOCK_END_REGEX, "")
    .replace(REGEX.TRAILING_HTML_END_REGEX, "")
    .replace(REGEX.DOUBLE_QUOTE_AT_END_REGEX, '"');
}

export function isLineComment(text: string): boolean {
  return REGEX.LINE_COMMENT_REGEX.test(text);
}

export function extractCommentContent(text: string): string {
  return text.replace(REGEX.LINE_COMMENT_PREFIX_REGEX, "").trim();
}

export function isTodoLine(text: string, matchPattern: RegExp): boolean {
  return text.includes("@TODO") && matchPattern.test(text);
}

export function isBlockStartWithoutEnd(text: string): boolean {
  return (
    text.includes(REGEX.BLOCK_COMMENT_START) &&
    !text.includes(REGEX.BLOCK_COMMENT_END)
  );
}

export function isHtmlBlockStartWithoutEnd(text: string): boolean {
  return (
    text.includes(REGEX.HTML_COMMENT_START) &&
    !text.includes(REGEX.HTML_COMMENT_END)
  );
}

export function stripBlockLinePrefix(text: string): string {
  return text.replace(REGEX.BLOCK_PREFIX_STRIP_REGEX, "");
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
    if (trimmed.includes(REGEX.HTML_COMMENT_END)) {
      const before = trimmed.split(REGEX.HTML_COMMENT_END)[0] ?? "";
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
