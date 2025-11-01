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
