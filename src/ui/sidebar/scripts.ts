export function getSidebarScripts(): string {
  return `
    const vscode = acquireVsCodeApi();

    let activeLabels = [];

    // Handle button clicks
    document.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.getAttribute('data-action');
        vscode.postMessage({ type: action });
      });
    });

    // Handle label clicks
    document.querySelectorAll('[data-label]').forEach((item) => {
      item.addEventListener('click', () => {
        const label = item.getAttribute('data-label');
        vscode.postMessage({ type: 'filterByLabel', label });
      });
    });

    // Listen for messages to update active filters
    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.type === 'updateFilters') {
        activeLabels = message.labels || [];
        updateActiveFilters();
      }
    });

    // Update visual state of active filters
    function updateActiveFilters() {
      const allLabels = document.querySelectorAll('[data-label]');

      allLabels.forEach((item) => {
        const label = item.getAttribute('data-label');
        if (activeLabels.includes(label)) {
          item.classList.add('label-item--active');
        } else {
          item.classList.remove('label-item--active');
        }
      });
    }

    // Initialize on load
    updateActiveFilters();
  `;
}
