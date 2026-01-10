/**
 * Utility to build dynamic regex patterns for TODO search
 */

/**
 * Escapes special regex characters in a string
 */
function escapeRegexCharacters(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Builds a regex pattern from search patterns
 * Example: ["@TODO", "FIXME"] => /@TODO(?:\([^)]*\))?|FIXME(?:\([^)]*\))?/
 *
 * The pattern allows optional priority in parentheses: @TODO(high), FIXME(low), etc.
 */
export function buildTodoPattern(searchPatterns: string[]): RegExp {
  if (searchPatterns.length === 0) {
    // Fallback to @TODO if no patterns provided
    return /@TODO(?:\([^)]*\))?/;
  }

  const escapedPatterns = searchPatterns.map(escapeRegexCharacters);
  const patternString = escapedPatterns
    .map((pattern) => `${pattern}(?:\\([^)]*\\))?`)
    .join("|");

  return new RegExp(patternString);
}

/**
 * Builds a regex pattern for priority extraction
 * Example: ["@TODO", "FIXME"] => /^(@TODO|FIXME)(?:\(([^)]+)\))?/i
 */
export function buildPriorityPattern(searchPatterns: string[]): RegExp {
  if (searchPatterns.length === 0) {
    return /^(@TODO)(?:\(([^)]+)\))?/i;
  }

  const escapedPatterns = searchPatterns.map(escapeRegexCharacters);
  const patternString = escapedPatterns.join("|");

  return new RegExp(`^(${patternString})(?:\\(([^)]+)\\))?`, "i");
}

/**
 * Validates search patterns
 * Returns array of valid patterns (non-empty strings)
 */
export function validateSearchPatterns(patterns: string[]): string[] {
  return patterns.filter((pattern): pattern is string => {
    return typeof pattern === "string" && pattern.trim().length > 0;
  });
}

/**
 * Extracts the first matched pattern from a line of text
 * Returns the pattern position or -1 if not found
 */
export function findFirstPatternIndex(
  text: string,
  searchPatterns: string[],
): number {
  // Use first pattern as fallback if array is empty
  const patterns = searchPatterns.length > 0 ? searchPatterns : ["TODO"];

  let minIndex = text.length;
  for (const pattern of patterns) {
    const index = text.indexOf(pattern);
    if (index !== -1 && index < minIndex) {
      minIndex = index;
    }
  }

  return minIndex === text.length ? -1 : minIndex;
}

/**
 * Checks if any search pattern appears at the start of a comment
 * Removes common comment markers before checking
 */
export function hasPatternAtCommentStart(
  text: string,
  searchPatterns: string[],
): boolean {
  // Remove common comment markers to get clean content
  let cleaned = text.trim();

  // Remove line comment markers: //, #
  cleaned = cleaned.replace(/^\s*(?:\/\/|#)\s*/, "");

  // Remove block comment markers: /*, /***, <!--
  cleaned = cleaned.replace(/^\s*(?:\/\*+|<!--)\s*/, "");

  // Remove leading asterisks from block comments: *
  cleaned = cleaned.replace(/^\s*\*+\s*/, "");

  cleaned = cleaned.trim();

  // Check if any pattern appears at the START of the cleaned content
  return searchPatterns.some((pattern) => cleaned.startsWith(pattern));
}
