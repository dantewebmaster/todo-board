/**
 * Age category for filtering TODOs by how old they are
 */
export type AgeFilter = "all" | "fresh" | "recent" | "old" | "abandoned";

/**
 * Sort direction for ordering TODOs
 */
export type SortDirection = "asc" | "desc";

/**
 * Sort options for ordering TODOs by date
 */
export interface SortOptions {
  direction: SortDirection;
}

/**
 * Filter options for filtering TODOs
 */
export interface FilterOptions {
  labels: string[]; // Multiple labels (OR logic)
  age: AgeFilter; // Age category filter
  searchTerm?: string; // Text search (already exists)
}

/**
 * Complete filter and sort state
 */
export interface FilterState {
  filters: FilterOptions;
  sort: SortOptions;
}
