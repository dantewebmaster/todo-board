export function getBoardScripts(): string {
  return `
    const vscode = acquireVsCodeApi();

    const searchInput = document.getElementById('searchInput');
    const clearButton = document.getElementById('clearButton');
    const filterIndicator = document.getElementById('filterIndicator');
    const filterLabel = document.getElementById('filterLabel');
    const clearFilterButton = document.getElementById('clearFilterButton');
    const cards = document.querySelectorAll('[data-card="true"]');
    const labelBadges = document.querySelectorAll('[data-label]');

    let activeFilter = null;

    // Handle card clicks
    cards.forEach((element) => {
      element.addEventListener('click', (e) => {
        // Don't trigger card click if clicking on a label badge
        if (e.target.hasAttribute('data-label')) {
          return;
        }
        const file = element.getAttribute('data-file');
        const line = Number(element.getAttribute('data-line') ?? '0');
        vscode.postMessage({ type: 'open', file, line });
      });
    });

    // Handle label badge clicks
    labelBadges.forEach((badge) => {
      badge.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card click
        const label = badge.getAttribute('data-label');
        if (label) {
          filterByLabel(label);
        }
      });
    });

    // Filter by label
    function filterByLabel(label) {
      activeFilter = label;
      filterLabel.textContent = 'Filtered by: ' + label;
      filterIndicator.style.display = 'flex';
      searchInput.value = '';
      applyFilters();
    }

    // Clear label filter
    function clearLabelFilter() {
      activeFilter = null;
      filterIndicator.style.display = 'none';
      applyFilters();
    }

    // Apply all filters (search + label)
    function applyFilters() {
      const searchQuery = searchInput.value.toLowerCase().trim();

      cards.forEach((card) => {
        let shouldShow = true;

        // Apply label filter
        if (activeFilter) {
          const cardLabels = Array.from(card.querySelectorAll('[data-label]'))
            .map(badge => badge.getAttribute('data-label'));
          shouldShow = cardLabels.includes(activeFilter);
        }

        // Apply search filter
        if (shouldShow && searchQuery) {
          const description = card.querySelector('.card__description')?.textContent?.toLowerCase() || '';
          const location = card.querySelector('.card__meta')?.textContent?.toLowerCase() || '';
          const labels = Array.from(card.querySelectorAll('.card__labels .badge'))
            .map(badge => badge.textContent?.toLowerCase() || '')
            .join(' ');

          const searchableText = \`\${description} \${location} \${labels}\`;
          shouldShow = searchableText.includes(searchQuery);
        }

        if (shouldShow) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });

      // Update clear button state
      clearButton.disabled = !searchQuery;
    }

    // Search input event
    searchInput.addEventListener('input', () => {
      applyFilters();
    });

    // Clear button event
    clearButton.addEventListener('click', () => {
      searchInput.value = '';
      applyFilters();
      searchInput.focus();
    });

    // Clear filter button event
    clearFilterButton.addEventListener('click', () => {
      clearLabelFilter();
    });

    // Allow clearing with Escape key
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        applyFilters();
      }
    });

    // Listen for messages from extension
    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.type === 'filterByLabel') {
        filterByLabel(message.label);
      }
    });
  `;
}
