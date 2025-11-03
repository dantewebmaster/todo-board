import { createHash } from "node:crypto";

/**
 * Generate a unique identifier for a TODO item
 * Uses SHA-1 hash of file path, line number, and text content
 * @param file - Absolute file path
 * @param line - Line number where the TODO is located
 * @param text - TODO text content
 * @returns Unique 16-character hex identifier
 */
export function generateTodoId(
  file: string,
  line: number,
  text: string,
): string {
  const hash = createHash("sha1")
    .update(file)
    .update(":")
    .update(String(line))
    .update(":")
    .update(text.trim());

  return hash.digest("hex").substring(0, 16);
}

/**
 * Generate a cryptographically secure random nonce
 * Used for Content Security Policy (CSP) in webviews
 * @returns 32-character random alphanumeric string
 */
export function generateNonce(): string {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * alphabet.length),
  );

  return randomValues.map((index) => alphabet[index] ?? "").join("");
}

/**
 * Generate a simple hash of string content
 * Used for detecting content changes in cached data
 * @param content - String content to hash
 * @returns Hash string in base36 format
 */
export function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}
