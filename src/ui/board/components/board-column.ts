import { escapeHtml } from "@/utils/sanitize";
import { renderCard } from "./board-card";
import type { BoardItem, TodoPriority } from "@/types/todo";

function renderEmptyColumn(): string {
  return `<p class="empty">No TODOs found.</p>`;
}

const PRIORITY_LABELS: Record<TodoPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function renderColumn(
  priority: TodoPriority,
  items: BoardItem[],
): string {
  const title = PRIORITY_LABELS[priority];
  const count = items.length;
  const cards =
    count === 0 ? renderEmptyColumn() : items.map(renderCard).join("");

  return `
    <section class="column" data-priority="${priority}">
      <header class="column__header">
        <span>${escapeHtml(title)}</span>
        <span class="badge">${count}</span>
      </header>
      <div class="column__content">
        ${cards}
      </div>
    </section>
  `;
}
