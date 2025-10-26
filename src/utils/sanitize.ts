import { REGEX } from "@/constants/regex";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

export function sanitizeTodoExtract(raw: string): string {
  return raw
    .trim()
    .replace(REGEX.ESCAPED_QUOTE_REGEX, '"')
    .replace(REGEX.ESCAPED_NEWLINE_REGEX, " ")
    .replace(REGEX.TRAILING_BLOCK_END_REGEX, "")
    .replace(REGEX.TRAILING_HTML_END_REGEX, "")
    .replace(REGEX.DOUBLE_QUOTE_AT_END_REGEX, '"')
    .trim();
}
