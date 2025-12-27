import { iconsSvg } from "@/ui/icons";
import {
  formatDate,
  formatDaysOld,
  getAgeBadgeClass,
} from "@/utils/age-formatter";
import { getLabelColor } from "@/utils/label";
import { escapeAttribute, escapeHtml } from "@/utils/sanitize";
import type { BoardItem } from "@/types/todo";

export function renderCard(item: BoardItem): string {
  const description = item.description;
  const formattedDescription = escapeHtml(description).replace(/\n/g, "<br />");
  const location = `${escapeHtml(item.relativePath)}:${item.line + 1}`;
  const issueButtonHtml = `<button class="card__create-issue-btn" data-create-issue title="Criar issue para este TODO">Abrir Issue</button>`;

  // Age badge (if available)
  const ageBadgeHtml =
    item.daysOld !== undefined
      ? `
      <span
        class="age-badge ${getAgeBadgeClass(item.daysOld)}"
        title="Last modified: ${item.lastModified ? formatDate(item.lastModified) : "Unknown"}"
      >
        ${iconsSvg.clock} ${formatDaysOld(item.daysOld)}
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
      data-days-old="${item.daysOld !== undefined ? item.daysOld : 0}"
      data-priority="${item.priority}"
      data-location="${location}"
    >
      <div class="card__header">
        ${ageBadgeHtml}
      </div>
      <h2 class="card__description">${formattedDescription}</h2>
      <p class="card__meta">
        <span class="card__meta-location">${location}</span>
        ${issueButtonHtml}
      </p>
      ${labelsHtml}
    </article>
  `;
}
