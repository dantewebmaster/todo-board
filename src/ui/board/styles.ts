export function getBoardStyles(): string {
  return `
    :root {
      color-scheme: var(--vscode-color-scheme);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }

    body {
      margin: 0;
      padding: 16px;
      background-color: var(--vscode-editor-background);
      color: var(--vscode-foreground);
    }

    body * {
      box-sizing: border-box;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      gap: 16px;
      position: sticky;
      top: 0;
      background-color: var(--vscode-editor-background);
      z-index: 2;
      padding-top: 10px;
      padding-bottom: 10px;
    }

    h1 {
      font-size: 18px;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    h1 svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    h1 svg line,
    h1 svg polyline {
      stroke: var(--vscode-foreground);
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      justify-content: flex-end;
    }

    .search-container {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      flex: 1;
      flex-wrap: wrap;
    }

    .custom-search-input {
      display: flex;
      align-items: center;
      flex: 1;
      width: 60px;
      height: 40px;
      padding: 4px;
      max-width: 230px;

      background-color: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      overflow: hidden;
    }

    .filter-indicator {
      display: none;
      align-items: center;
      gap: 6px;
      padding: 6px;
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      height: 40px;
    }

    .filter-labels {
      display: block;
      align-items: center;
      max-width: 200px;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .search-icon {
      height: 32px;
      width: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      opacity: 0.6;
    }

    .search-icon svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }

    .search-input {
      background: transparent;
      color: var(--vscode-input-foreground);
      flex: 1;
      padding: 8px 4px;
      font-size: 14px;
      outline: none;
      height: 40px;
      border: none;
      transition: border-color 120ms ease;
    }

    .search-input:focus {
      border-color: var(--vscode-focusBorder);
    }

    .search-input::placeholder {
      color: var(--vscode-input-placeholderForeground);
    }

    .button-clear {
      height: 32px;
      width: 32px;
      background-color: transparent;
      color: var(--vscode-input-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 300ms ease-in-out, background-color 120ms ease;
      flex-shrink: 0;
      z-index: 100;
    }

    .button-clear svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }

    .button-clear:hover:not(:disabled) {
      background-color: var(--vscode-toolbar-hoverBackground);
    }

    .button-clear:disabled {
      opacity: 0;
    }

    .sort-button {
      height: 40px;
      width: 40px;
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 120ms ease;
      flex-shrink: 0;
    }

    .sort-button svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }

    .sort-button:hover {
      background-color: var(--vscode-button-secondaryHoverBackground);
    }

    .sort-button:active {
      transform: scale(0.95);
    }

    .reset-filters-button {
      height: 40px;
      width: 40px;
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 120ms ease;
      flex-shrink: 0;
    }

    .reset-filters-button svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }

    .reset-filters-button:hover {
      background-color: var(--vscode-button-secondaryHoverBackground);
    }

    .reset-filters-button:active {
      transform: scale(0.95);
    }

    .age-filter-container {
      display: flex;
      align-items: center;
      height: 40px;
      padding: 0 4px 0 8px;
      background-color: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      gap: 4px;
      flex-shrink: 0;
      min-width: 160px;
    }

    .age-filter-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      opacity: 0.7;
    }

    .age-filter-icon svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }

    .age-filter-select {
      flex: 1;
      background: transparent;
      color: var(--vscode-input-foreground);
      border: none;
      outline: none;
      font-size: 13px;
      cursor: pointer;
      padding: 4px;
      min-width: 0;
    }

    .age-filter-select:focus {
      outline: none;
    }

    .age-filter-select option {
      background-color: var(--vscode-dropdown-background);
      color: var(--vscode-dropdown-foreground);
    }

    .board {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
    }

    .column {
      background-color: var(--vscode-sideBar-background);
      border: 1px solid var(--vscode-widget-border);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .column__header {
      padding: 12px 16px;
      border: 1px solid var(--vscode-widget-border);
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 60px;
      border-radius: 8px 8px 0 0;
      background-color: var(--vscode-sideBar-background);
      z-index: 1;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .column__content {
      flex: 1;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .card {
      border-radius: 6px;
      border: 1px solid transparent;
      padding: 12px;
      background: var(--vscode-editorWidget-background);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      transition: border-color 120ms ease, transform 120ms ease;
      display: flex;
      flex-direction: column;
      word-break: break-word;
      overflow-wrap: break-word;
    }

    .card.hidden {
      display: none;
    }

    .card__header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .card__description {
      font-size: 14px;
      font-weight: 500;
      margin: 0 0 8px;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .card__meta {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
    }

    .card__meta:hover {
      text-decoration: underline;
      color: var(--vscode-foreground);
    }

    .card__labels {
      margin-top: 8px;
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .card__labels .badge {
      margin-top: 4px;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    .badge--clickable {
      cursor: pointer;
      border: 1px solid transparent;
      transition: opacity 120ms ease, transform 120ms ease;
    }

    .badge--clickable:hover {
      opacity: 0.85;
      transform: scale(1.05);
    }

    .badge--clickable:active {
      transform: scale(0.98);
    }

    .badge--active {
      border-color: currentColor;
    }

    .badge {
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 12px;
    }

    /* Age badges */
    .age-badge {
      padding: 4px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.3px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      background: transparent;
      color: var(--vscode-foreground);
    }

    .age-badge svg {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }

    .age-fresh {
      border: 1px solid #10b981;
    }

    .age-recent {
      border: 1px solid #3b82f6;
    }

    .age-old {
      border: 1px solid #f59e0b;
    }

    .age-abandoned {
      border: 1px solid #ef4444;
    }

    .empty {
      font-size: 14px;
      color: var(--vscode-descriptionForeground);
      text-align: center;
      padding: 20px;
      margin: 0;
    }

    .card__menu {
      position: relative;
      margin-left: auto;
      cursor: pointer;
    }

    .card__menu-btn {
      background: transparent;
      border: 1px solid var(--vscode-foreground);
      border-radius: 50px;
      font-size: 16px;
      font-weight: bold;
      color: var(--vscode-foreground);
      width: 24px;
      height: 24px;
      cursor: pointer;
    }

    .card__menu-list {
      position: absolute;
      top: 100%;
      right: 0;
      background-color: var(--vscode-sideBar-background);
      border: 1px solid var(--vscode-foreground);
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      z-index: 10;
      min-width: 160px;
      list-style: none;
      margin-top: 2px;
      padding: 0;
      overflow: hidden;
    }

    .card__menu-item {
      padding: 8px 12px;
      font-size: 13px;
      color: var(--vscode-foreground);
      cursor: pointer;
      transition: background-color 120ms ease;
    }

    .card__menu-item:hover {
      background-color: var(--vscode-list-hoverBackground);
    }

    .card__menu-item:active {
      background-color: var(--vscode-list-activeSelectionBackground);
    }
  `;
}
