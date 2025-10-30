import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export interface GitLineInfo {
  date: Date;
  daysOld: number;
}

// Cache to store first detection time of uncommitted lines
// Key format: "filePath:lineNumber"
const uncommittedLineCache = new Map<string, Date>();

/**
 * Get the last modification date of a specific line in a file using git blame
 * @param filePath - Absolute path to the file
 * @param lineNumber - Line number (1-based)
 * @returns Git line information or undefined if not available
 */
export async function getLineInfo(
  filePath: string,
  lineNumber: number,
): Promise<GitLineInfo | undefined> {
  try {
    // Extract directory from file path to run git blame in the correct repo
    const fileDir = filePath.substring(0, filePath.lastIndexOf("/"));

    const { stdout } = await execAsync(
      `git blame -L ${lineNumber},${lineNumber} --porcelain "${filePath}"`,
      {
        timeout: 5000, // 5 second timeout to prevent hanging
        cwd: fileDir, // Run git in the file's directory
      },
    );

    // Extract timestamp from porcelain format
    // Example line: "author-time 1698364800"
    const timeMatch = stdout.match(/^author-time (\d+)$/m);

    if (!timeMatch) {
      return undefined;
    }

    const timestamp = Number.parseInt(timeMatch[1], 10);
    let date = new Date(timestamp * 1000);

    // Check if line is not committed yet (hash starts with 0000000000)
    const hashMatch = stdout.match(/^([0-9a-f]{40})/m);
    const isUncommitted = hashMatch?.[1].startsWith("0000000000");

    // For uncommitted changes, use current date on first detection
    if (isUncommitted) {
      const cacheKey = `${filePath}:${lineNumber}`;
      const cachedDate = uncommittedLineCache.get(cacheKey);

      if (cachedDate) {
        // Use cached date from first detection
        date = cachedDate;
      } else {
        // First time detecting this uncommitted line, use current date
        date = new Date();
        uncommittedLineCache.set(cacheKey, date);
      }
    } else {
      // Line is committed, remove from cache if it exists
      const cacheKey = `${filePath}:${lineNumber}`;
      uncommittedLineCache.delete(cacheKey);
    }

    const now = new Date();

    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysOld = Math.floor(
      (nowOnly.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24),
    );

    return { date, daysOld };
  } catch {
    return undefined;
  }
}

/**
 * Clear cache entry for a specific line when it gets committed
 * @param filePath - Absolute path to the file
 * @param lineNumber - Line number (1-based)
 */
export function clearLineCache(filePath: string, lineNumber: number): void {
  const cacheKey = `${filePath}:${lineNumber}`;
  uncommittedLineCache.delete(cacheKey);
}

/**
 * Clear all uncommitted line cache
 * Useful when rescanning or when commits are made
 */
export function clearAllLineCache(): void {
  uncommittedLineCache.clear();
}

/**
 * Get age category for a TODO based on days old
 * @param daysOld - Number of days since last modification
 * @returns Age category string
 */
export function getAgeCategory(
  daysOld: number,
): "fresh" | "recent" | "old" | "abandoned" {
  if (daysOld <= 7) {
    return "fresh";
  }
  if (daysOld <= 30) {
    return "recent";
  }
  if (daysOld <= 90) {
    return "old";
  }
  return "abandoned";
}

/**
 * Get color class for age badge based on days old
 * @param daysOld - Number of days since last modification
 * @returns CSS class name for age badge
 */
export function getAgeBadgeClass(daysOld: number): string {
  const category = getAgeCategory(daysOld);
  return `age-${category}`;
}

/**
 * Format days old into human-readable string
 * @param daysOld - Number of days since last modification
 * @returns Formatted string (e.g., "45 days", "1 day", "Today")
 */
export function formatDaysOld(daysOld: number): string {
  if (daysOld === 0) {
    return "Today";
  }
  if (daysOld === 1) {
    return "1 day";
  }
  return `${daysOld} days`;
}

/**
 * Format date to locale string
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
