export function getSidebarScripts(): string {
  return `
    const vscode = acquireVsCodeApi();

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

    // Listen for messages to update active filter
    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.type === 'setActiveFilter') {
        updateActiveFilter(message.label);
      }
    });

    // Update visual state of active filter
    function updateActiveFilter(activeLabel) {
      const allLabels = document.querySelectorAll('[data-label]');

      allLabels.forEach((item) => {
        const label = item.getAttribute('data-label');
        if (label === activeLabel) {
          item.classList.add('label-item--active');
        } else {
          item.classList.remove('label-item--active');
        }
      });
    }
  `;
}
