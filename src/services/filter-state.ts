class FilterState {
  private activeLabel: string | null = null;
  private listeners: Array<(label: string | null) => void> = [];

  setActiveLabel(label: string | null): void {
    this.activeLabel = label;
    this.notifyListeners();
  }

  getActiveLabel(): string | null {
    return this.activeLabel;
  }

  onFilterChange(callback: (label: string | null) => void): () => void {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.activeLabel);
    }
  }
}

export const filterState = new FilterState();
