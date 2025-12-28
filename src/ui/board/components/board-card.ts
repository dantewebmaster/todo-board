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

  // Issue badge (se existir)
  const issueBadgeHtml = item.issueKey
    ? `<span class="issue-badge" data-issue-link="${escapeAttribute(item.issueLink || "")}" title="Clique para abrir a issue no Jira">${escapeHtml(item.issueKey)}</span>`
    : "";

  // Kebab menu (3 pontinhos)
  const hasIssue = Boolean(item.issueKey);
  const kebabMenuHtml = `
    <div class="card__menu">
      <button class="card__menu-btn" title="Mais opções" tabindex="0">
        <span class="card__menu-icon">&#8942;</span>
      </button>
      <ul class="card__menu-list" hidden>
        <li class="card__menu-item" data-menu-create-issue ${hasIssue ? "hidden" : ""}>Criar issue no Jira</li>
        <li class="card__menu-item" data-menu-view-issue ${hasIssue ? "" : "hidden"}>Ver issue no Jira</li>
      </ul>
    </div>
  `;

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
      data-issue-id="${escapeAttribute(item.issueId || "")}"
      data-issue-key="${escapeAttribute(item.issueKey || "")}"
      data-issue-link="${escapeAttribute(item.issueLink || "")}"
    >
      <div class="card__content">
        <div class="card__header">
          ${issueBadgeHtml}
          ${ageBadgeHtml}
          ${kebabMenuHtml}
        </div>
        <h2 class="card__description">${formattedDescription}</h2>
        <p class="card__meta">
          <span class="card__meta-location">${location}</span>
        </p>
        ${labelsHtml}
      </div>
    </article>
  `;
}
