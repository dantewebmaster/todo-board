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
      padding-top: 8px;
      padding-bottom: 8px;
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

    .search-container {
      display: flex;
      align-items: center;
      flex: 1;
      max-width: 344px;
      height: 40px;
      padding: 4px;

      background-color: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
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

    .search-clear {
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
    }

    .search-clear svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }

    .search-clear:hover:not(:disabled) {
      background-color: var(--vscode-toolbar-hoverBackground);
    }

    .search-clear:disabled {
      opacity: 0;
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
      border-bottom: 1px solid var(--vscode-widget-border);
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
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

    .card:hover {
      border-color: var(--vscode-focusBorder);
      transform: translateY(-1px);
    }

    .card.hidden {
      display: none;
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

    .badge {
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 12px;
    }

    .empty {
      font-size: 13px;
      color: var(--vscode-descriptionForeground);
    }
  `;
}
