export function getBoardScripts(): string {
  return `
    const vscode = acquireVsCodeApi();

    const searchInput = document.getElementById('searchInput');
    const clearButton = document.getElementById('clearButton');
    const cards = document.querySelectorAll('[data-card="true"]');

    // Handle card clicks
    cards.forEach((element) => {
      element.addEventListener('click', () => {
        const file = element.getAttribute('data-file');
        const line = Number(element.getAttribute('data-line') ?? '0');
        vscode.postMessage({ type: 'open', file, line });
      });
    });

    // Filter cards based on search input
    function filterCards(searchText) {
      const query = searchText.toLowerCase().trim();

      cards.forEach((card) => {
        if (!query) {
          card.classList.remove('hidden');
          return;
        }

        const description = card.querySelector('.card__description')?.textContent?.toLowerCase() || '';
        const location = card.querySelector('.card__meta')?.textContent?.toLowerCase() || '';
        const labels = Array.from(card.querySelectorAll('.card__labels .badge'))
          .map(badge => badge.textContent?.toLowerCase() || '')
          .join(' ');

        const searchableText = \`\${description} \${location} \${labels}\`;

        if (searchableText.includes(query)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });

      // Update clear button state
      clearButton.disabled = !query;
    }

    // Search input event
    searchInput.addEventListener('input', (e) => {
      filterCards(e.target.value);
    });

    // Clear button event
    clearButton.addEventListener('click', () => {
      searchInput.value = '';
      filterCards('');
      searchInput.focus();
    });

    // Allow clearing with Escape key
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        filterCards('');
      }
    });
  `;
}
