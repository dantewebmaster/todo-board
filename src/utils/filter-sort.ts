import { getAgeCategory } from "@/utils/age-formatter";
import type { FilterOptions, SortOptions } from "@/types/filter";
import type { BoardItem } from "@/types/todo";

/**
 * Filter TODOs based on filter options
 * @param items - Array of board items to filter
 * @param filters - Filter options to apply
 * @returns Filtered array of board items
 */
export function filterTodos(
  items: BoardItem[],
  filters: FilterOptions,
): BoardItem[] {
  let filtered = items;

  // Filter by labels (OR logic - show if item has ANY of the selected labels)
  if (filters.labels.length > 0) {
    filtered = filtered.filter((item) => {
      if (!item.labels || item.labels.length === 0) {
        return false;
      }
      return filters.labels.some((filterLabel) =>
        (item.labels as string[])?.includes(filterLabel),
      );
    });
  }

  // Filter by age category
  if (filters.age !== "all") {
    filtered = filtered.filter((item) => {
      if (item.daysOld === undefined) {
        return false;
      }
      const category = getAgeCategory(item.daysOld);
      return category === filters.age;
    });
  }

  return filtered;
}

/**
 * Sort TODOs based on sort options
 * Sorts by modification date only (newest or oldest first)
 * @param items - Array of board items to sort
 * @param sort - Sort options to apply
 * @returns Sorted array of board items (new array, doesn't mutate original)
 */
export function sortTodos(items: BoardItem[], sort: SortOptions): BoardItem[] {
  const sorted = [...items];

  sorted.sort((a, b) => {
    // Sort by modification date
    const dateA = a.lastModified?.getTime() ?? 0;
    const dateB = b.lastModified?.getTime() ?? 0;
    const comparison = dateA - dateB;

    // Apply sort direction
    return sort.direction === "asc" ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Apply both filtering and sorting to TODOs
 * @param items - Array of board items
 * @param filters - Filter options
 * @param sort - Sort options
 * @returns Filtered and sorted array of board items
 */
export function filterAndSortTodos(
  items: BoardItem[],
  filters: FilterOptions,
  sort: SortOptions,
): BoardItem[] {
  const filtered = filterTodos(items, filters);
  const sorted = sortTodos(filtered, sort);
  return sorted;
}
