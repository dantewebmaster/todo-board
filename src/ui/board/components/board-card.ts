import { formatDate, formatDaysOld, getAgeBadgeClass } from "@/utils/git-info";
import { getLabelColor } from "@/utils/label";
import { escapeAttribute, escapeHtml } from "@/utils/sanitize";
import type { BoardItem } from "@/types/todo";

export function renderCard(item: BoardItem): string {
  const description = item.description;
  const formattedDescription = escapeHtml(description).replace(/\n/g, "<br />");
  const location = `${escapeHtml(item.relativePath)}:${item.line + 1}`;

  // Age badge (if available)
  const ageBadgeHtml =
    item.daysOld !== undefined
      ? `
      <span
        class="age-badge ${getAgeBadgeClass(item.daysOld)}"
        title="Last modified: ${item.lastModified ? formatDate(item.lastModified) : "Unknown"}"
      >
        🕐 ${formatDaysOld(item.daysOld)}
      </span>
    `
      : "";

  const labelsHtml =
    item.labels && item.labels.length > 0
      ? `
      <div class="card__labels">
        ${item.labels
          .map((label) => {
            const colors = getLabelColor(label);

            return `
            <span
              class="badge badge--clickable"
              data-label="${escapeAttribute(label)}"
              style="
                background-color: ${colors.background}; color: ${colors.text};
              "
              title="Click to filter by '${escapeAttribute(label)}'"
            >${escapeHtml(label)}</span>`;
          })
          .join("")}
      </div>
    `
      : "";

  return `
    <article
      class="card"
      data-card="true"
      data-file="${escapeAttribute(item.filePath)}"
      data-line="${item.line}"
    >
      <div class="card__header">
        ${ageBadgeHtml}
      </div>
      <h2 class="card__description">${formattedDescription}</h2>
      <p class="card__meta">${location}</p>
      ${labelsHtml}
    </article>
  `;
}
