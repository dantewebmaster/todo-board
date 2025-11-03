export function getBoardScripts(): string {
  return `
    const vscode = acquireVsCodeApi();

    const searchInput = document.getElementById('searchInput');
    const clearButton = document.getElementById('clearButton');
    const filterIndicator = document.getElementById('filterIndicator');
    const filterLabels = document.getElementById('filterLabels');
    const clearFilterButton = document.getElementById('clearFilterButton');
    const sortButton = document.getElementById('sortButton');
    const ageFilterSelect = document.getElementById('ageFilterSelect');
    const resetFiltersButton = document.getElementById('resetFiltersButton');
    const cards = document.querySelectorAll('[data-card="true"]');
    const labelBadges = document.querySelectorAll('[data-label]');

    let activeLabels = []; // Array of active label filters
    let sortDirection = 'desc'; // Default: most recent first
    let ageFilter = 'all'; // Default: show all ages

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
          filterByLabelFromClick(label);
        }
      });
    });

    // Filter by label
    function filterByLabel(label) {
      // Toggle label in activeLabels array
      const index = activeLabels.indexOf(label);
      if (index === -1) {
        activeLabels.push(label);
      } else {
        activeLabels.splice(index, 1);
      }

      updateFilterIndicator();
      updateResetButtonVisibility();
      searchInput.value = '';
      applyFilters();
    }

    // Filter by label from user click (sends message to extension)
    function filterByLabelFromClick(label) {
      filterByLabel(label);
      vscode.postMessage({ type: 'setFilter', label });
    }

    // Remove a specific label from filter
    function removeLabel(label) {
      const index = activeLabels.indexOf(label);
      if (index !== -1) {
        activeLabels.splice(index, 1);
      }

      updateFilterIndicator();
      applyFilters();

      // Notify extension to remove label
      vscode.postMessage({ type: 'removeLabel', label });
    }

    // Update filter indicator to show active labels
    function updateFilterIndicator() {
      if (activeLabels.length > 0) {
        const labelsText = activeLabels.join(', ');
        filterLabels.textContent = 'Labels: ' + activeLabels.join(', ');
        filterLabels.setAttribute('title', labelsText);
        filterIndicator.style.display = 'flex';
      } else {
        filterIndicator.style.display = 'none';
      }

      // Update visual state of all label badges
      for (const badge of labelBadges) {
        const label = badge.getAttribute('data-label');
        if (activeLabels.includes(label)) {
          badge.classList.add('badge--active');
        } else {
          badge.classList.remove('badge--active');
        }
      }
    }

    // Clear label filter
    function clearLabelFilter() {
      activeLabels = [];
      updateFilterIndicator();
      updateResetButtonVisibility();
      applyFilters();

      vscode.postMessage({ type: 'clearLabels' });
    }

    // Apply all filters (search + labels + age) and sorting
    function applyFilters() {
      const searchQuery = searchInput.value.toLowerCase().trim();
      let visibleCards = [];

      cards.forEach((card) => {
        let shouldShow = true;

        // Apply label filter (OR logic: show if matches ANY active label)
        if (activeLabels.length > 0) {
          const cardLabels = Array.from(card.querySelectorAll('[data-label]'))
            .map(badge => badge.getAttribute('data-label'));
          shouldShow = activeLabels.some(label => cardLabels.includes(label));
        }

        // Apply age filter
        if (shouldShow && ageFilter !== 'all') {
          const daysOld = parseInt(card.getAttribute('data-days-old') || '0', 10);
          shouldShow = matchesAgeFilter(daysOld, ageFilter);
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
          visibleCards.push(card);
        } else {
          card.classList.add('hidden');
        }
      });

      // Apply sorting to visible cards
      sortCards(visibleCards);

      // Update clear button state
      clearButton.disabled = !searchQuery;

      // Show/hide empty state for each column
      updateEmptyStates();
    }

    // Check if days old matches age filter
    function matchesAgeFilter(daysOld, filter) {
      switch (filter) {
        case 'fresh':
          return daysOld <= 7;
        case 'recent':
          return daysOld <= 30;
        case 'old':
          return daysOld <= 90;
        case 'abandoned':
          return daysOld > 90;
        default:
          return true;
      }
    }

    // Sort visible cards by date
    function sortCards(visibleCards) {
      const columns = document.querySelectorAll('.column__content');

      visibleCards.sort((a, b) => {
        const daysA = parseInt(a.getAttribute('data-days-old') || '0', 10);
        const daysB = parseInt(b.getAttribute('data-days-old') || '0', 10);

        if (sortDirection === 'desc') {
          return daysA - daysB; // Most recent first (lower daysOld)
        } else {
          return daysB - daysA; // Oldest first (higher daysOld)
        }
      });

      // Re-append cards in sorted order within their columns
      for (const card of visibleCards) {
        const priority = card.getAttribute('data-priority');
        const column = document.querySelector(\`[data-priority="\${priority}"] .column__content\`);
        if (column) {
          column.appendChild(card);
        }
      }
    }

    // Update empty state messages for columns
    function updateEmptyStates() {
      const columns = document.querySelectorAll('.column');

      columns.forEach((column) => {
        const columnContent = column.querySelector('.column__content');
        const cardsInColumn = columnContent.querySelectorAll('[data-card="true"]');
        const visibleCardsInColumn = Array.from(cardsInColumn).filter(card => !card.classList.contains('hidden'));

        // Remove existing empty state if present
        let emptyState = columnContent.querySelector('.empty');

        if (visibleCardsInColumn.length === 0) {
          // Show empty state
          if (!emptyState) {
            emptyState = document.createElement('p');
            emptyState.className = 'empty';
            emptyState.textContent = 'No TODOs found.';
            columnContent.appendChild(emptyState);
          }
        } else {
          // Remove empty state
          if (emptyState) {
            emptyState.remove();
          }
        }
      });
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

    // Sort button event
    sortButton.addEventListener('click', () => {
      sortDirection = sortDirection === 'desc' ? 'asc' : 'desc';
      updateSortButton();
      updateResetButtonVisibility();
      applyFilters();

      vscode.postMessage({ type: 'toggleSort', direction: sortDirection });
    });

    // Age filter dropdown event
    ageFilterSelect.addEventListener('change', (e) => {
      ageFilter = e.target.value;
      updateResetButtonVisibility();
      applyFilters();

      vscode.postMessage({ type: 'setAgeFilter', ageFilter });
    });

    // Reset all filters button event
    resetFiltersButton.addEventListener('click', () => {
      resetAllFilters();
    });

    // Reset all filters and sorting to defaults
    function resetAllFilters() {
      activeLabels = [];
      ageFilter = 'all';
      sortDirection = 'desc';
      searchInput.value = '';

      ageFilterSelect.value = 'all';
      updateSortButton();
      updateFilterIndicator();
      updateResetButtonVisibility();
      applyFilters();

      vscode.postMessage({ type: 'resetFilters' });
    }

    // Update reset button visibility based on active filters
    function updateResetButtonVisibility() {
      const hasActiveFilters =
        activeLabels.length > 0 ||
        ageFilter !== 'all' ||
        sortDirection !== 'desc';

      resetFiltersButton.style.display = hasActiveFilters ? 'flex' : 'none';
    }

    // Update sort button icon and title
    function updateSortButton() {
      const iconsSvg = {
        sortAscending: \`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M128,128a8,8,0,0,1-8,8H48a8,8,0,0,1,0-16h72A8,8,0,0,1,128,128ZM48,72H184a8,8,0,0,0,0-16H48a8,8,0,0,0,0,16Zm56,112H48a8,8,0,0,0,0,16h56a8,8,0,0,0,0-16Zm125.66-21.66a8,8,0,0,0-11.32,0L192,188.69V112a8,8,0,0,0-16,0v76.69l-26.34-26.35a8,8,0,0,0-11.32,11.32l40,40a8,8,0,0,0,11.32,0l40-40A8,8,0,0,0,229.66,162.34Z"></path></svg>\`,
        sortDescending: \`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M128,128a8,8,0,0,1-8,8H48a8,8,0,0,1,0-16h72A8,8,0,0,1,128,128ZM48,72H184a8,8,0,0,0,0-16H48a8,8,0,0,0,0,16Zm56,112H48a8,8,0,0,0,0,16h56a8,8,0,0,0,0-16Zm125.66-90.34-40-40a8,8,0,0,0-11.32,0l-40,40a8,8,0,0,0,11.32,11.32L176,77.31V144a8,8,0,0,0,16,0V77.31l26.34,26.35a8,8,0,0,0,11.32-11.32Z"></path></svg>\`,
      };

      const icon = sortDirection === 'desc' ? iconsSvg.sortDescending : iconsSvg.sortAscending;
      const title = sortDirection === 'desc' ? 'Sort by date (descending)' : 'Sort by date (ascending)';

      sortButton.innerHTML = icon;
      sortButton.setAttribute('title', title);
      sortButton.setAttribute('data-direction', sortDirection);
    }

    // Listen for messages from extension
    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.type === 'filterByLabel') {
        filterByLabel(message.label);
      }
    });

    // Initialize
    updateResetButtonVisibility();
  `;
}
