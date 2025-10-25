import { icons } from "./icons";

export function getHeaderComponent(): string {
  return `
    <div class="header">
      <h1>
        ${icons.listChecks}
        TODO Board
      </h1>
      <div class="search-container">
        <span class="search-icon" aria-hidden="true">
          ${icons.search}
        </span>
        <input
          type="text"
          class="search-input"
          id="searchInput"
          placeholder="Search TODOs..."
          autocomplete="off"
        />
        <button class="search-clear" id="clearButton" disabled title="Clear search">
          ${icons.close}
        </button>
      </div>
    </div>
  `;
}
