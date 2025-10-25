// Centralized regex and markers for scanners
const TODO_PATTERN: RegExp = /@TODO(?:\([^)]*\))?/;
const LABEL_PATTERN: RegExp = /\[(.*?)\]/;
const PRIORITY_REGEX: RegExp = /^@TODO(?:\(([^)]+)\))?/i;

const LINE_BREAK_REGEX: RegExp = /\r\n|\n/g;

const LINE_COMMENT_REGEX: RegExp = /^\s*(?:\/\/|#)/;
const LINE_COMMENT_PREFIX_REGEX: RegExp = /^\s*(?:\/\/|#)\s?/;

const BLOCK_COMMENT_START = "/*" as const;
const BLOCK_COMMENT_END = "*/" as const;
const BLOCK_CONTENT_LINE_REGEX: RegExp = /^\s*(?:\*|\/\*)/;
const BLOCK_PREFIX_STRIP_REGEX: RegExp = /^\s*\*?\s?/;

const HTML_COMMENT_START = "<!--" as const;
const HTML_COMMENT_END = "-->" as const;

const ESCAPED_QUOTE_REGEX: RegExp = /\\"/g;
const ESCAPED_NEWLINE_REGEX: RegExp = /\\n/g;
const TRAILING_BLOCK_END_REGEX: RegExp = /\*\/\s*$/;
const TRAILING_HTML_END_REGEX: RegExp = /-->\s*$/;
const DOUBLE_QUOTE_AT_END_REGEX: RegExp = /""$/;

const LINE_BREAK_TOKEN = "\n";

// Barrel-style grouped export for convenience
export const REGEX = {
  TODO_PATTERN,
  LABEL_PATTERN,
  LINE_COMMENT_REGEX,
  LINE_COMMENT_PREFIX_REGEX,
  LINE_BREAK_REGEX,
  LINE_BREAK_TOKEN,
  BLOCK_COMMENT_START,
  BLOCK_COMMENT_END,
  BLOCK_CONTENT_LINE_REGEX,
  BLOCK_PREFIX_STRIP_REGEX,
  HTML_COMMENT_START,
  HTML_COMMENT_END,
  ESCAPED_QUOTE_REGEX,
  ESCAPED_NEWLINE_REGEX,
  TRAILING_BLOCK_END_REGEX,
  TRAILING_HTML_END_REGEX,
  DOUBLE_QUOTE_AT_END_REGEX,
  PRIORITY_REGEX,
} as const;
