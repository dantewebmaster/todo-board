import { iconsSvg } from "@/ui/icons";

export function getHeaderComponent(): string {
  return `
    <div class="header">
      <h1>
        ${iconsSvg.activityBar}
        TODO Board
      </h1>
      <div class="search-container">
        <div class="filter-indicator" id="filterIndicator" style="display: none;">
          <span class="filter-label" id="filterLabel"></span>
          <button
            class="filter-clear button-clear"
            id="clearFilterButton"
            title="Clear filter"
          >
            ${iconsSvg.close}
          </button>
        </div>
        <div class="custom-search-input">
          <span class="search-icon" aria-hidden="true">
            ${iconsSvg.search}
          </span>
          <input
            type="text"
            class="search-input"
            id="searchInput"
            placeholder="Search TODOs..."
            autocomplete="off"
          />
          <button
            class="search-clear button-clear"
            id="clearButton"
            title="Clear search"
            disabled
          >
            ${iconsSvg.close}
          </button>
        </div>
      </div>
    </div>
  `;
}
