import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export interface GitLineInfo {
  date: Date;
  daysOld: number;
}

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
    const { stdout } = await execAsync(
      `git blame -L ${lineNumber},${lineNumber} --porcelain "${filePath}"`,
      { timeout: 5000 }, // 5 second timeout to prevent hanging
    );

    // Extract timestamp from porcelain format
    // Example line: "author-time 1698364800"
    const timeMatch = stdout.match(/^author-time (\d+)$/m);

    if (!timeMatch) {
      return undefined;
    }

    const timestamp = Number.parseInt(timeMatch[1], 10);
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const daysOld = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    return { date, daysOld };
  } catch {
    // File not in git, git not available, or other error
    return undefined;
  }
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
