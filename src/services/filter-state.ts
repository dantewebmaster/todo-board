import type { AgeFilter, FilterOptions, SortOptions } from "@/types/filter";

class FilterStateManager {
  private filters: FilterOptions = {
    labels: [],
    age: "all",
  };

  private sort: SortOptions = {
    direction: "desc", // Most recent first by default
  };

  private listeners: Array<() => void> = [];

  // === Filter Methods ===

  /**
   * Set active labels (replaces all)
   */
  setLabels(labels: string[]): void {
    this.filters.labels = labels;
    this.notifyListeners();
  }

  /**
   * Add a label to the active filters
   */
  addLabel(label: string): void {
    if (!this.filters.labels.includes(label)) {
      this.filters.labels.push(label);
      this.notifyListeners();
    }
  }

  /**
   * Remove a label from the active filters
   */
  removeLabel(label: string): void {
    this.filters.labels = this.filters.labels.filter((l) => l !== label);
    this.notifyListeners();
  }

  /**
   * Toggle a label (add if not present, remove if present)
   */
  toggleLabel(label: string): void {
    if (this.filters.labels.includes(label)) {
      this.removeLabel(label);
    } else {
      this.addLabel(label);
    }
  }

  /**
   * Clear all label filters
   */
  clearLabels(): void {
    this.filters.labels = [];
    this.notifyListeners();
  }

  /**
   * Set age filter
   */
  setAgeFilter(age: AgeFilter): void {
    this.filters.age = age;
    this.notifyListeners();
  }

  /**
   * Get current filters
   */
  getFilters(): FilterOptions {
    return { ...this.filters };
  }

  // === Sort Methods ===

  /**
   * Set sort options
   */
  setSort(sort: SortOptions): void {
    this.sort = { ...sort };
    this.notifyListeners();
  }

  /**
   * Toggle sort direction
   */
  toggleSortDirection(): void {
    this.sort.direction = this.sort.direction === "asc" ? "desc" : "asc";
    this.notifyListeners();
  }

  /**
   * Get current sort options
   */
  getSort(): SortOptions {
    return { ...this.sort };
  }

  // === Backward Compatibility ===

  /**
   * @deprecated Use setLabels([label]) or addLabel(label) instead
   */
  setActiveLabel(label: string | null): void {
    if (label === null) {
      this.clearLabels();
    } else {
      this.setLabels([label]);
    }
  }

  /**
   * @deprecated Use getFilters().labels instead
   */
  getActiveLabel(): string | null {
    return this.filters.labels.length > 0 ? this.filters.labels[0] : null;
  }

  // === Listeners ===

  /**
   * Subscribe to filter/sort changes
   */
  onChange(callback: () => void): () => void {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * @deprecated Use onChange instead
   */
  onFilterChange(callback: (label: string | null) => void): () => void {
    const wrappedCallback = () => {
      callback(this.getActiveLabel());
    };
    return this.onChange(wrappedCallback);
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  /**
   * Reset all filters and sort to default
   */
  reset(): void {
    this.filters = {
      labels: [],
      age: "all",
    };
    this.sort = {
      direction: "desc",
    };
    this.notifyListeners();
  }
}

export const filterState = new FilterStateManager();
