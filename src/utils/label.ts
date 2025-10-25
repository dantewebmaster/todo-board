import { REGEX } from "@/constants/regex";
import type { TodoHit } from "@/types/todo";

function extractLabels(text: string): string[] {
  const match = text.match(REGEX.LABEL_PATTERN);

  if (!match?.[1]) {
    return [];
  }

  return match[1]
    .split(",")
    .map((label) => label.trim())
    .filter((label) => label.length > 0);
}

export function countLabels(hits: TodoHit[]): Map<string, number> {
  const labelCounts = new Map<string, number>();

  for (const hit of hits) {
    const labels = extractLabels(hit.text);

    for (const label of labels) {
      labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
    }
  }

  return labelCounts;
}

export function getLabelIcon(label: string): string {
  const iconMap: Record<string, string> = {
    refactor: "tools",
    cleanup: "trash",
    optimization: "rocket",
    bug: "bug",
    feature: "star",
    docs: "book",
    test: "beaker",
    security: "shield",
  };

  return iconMap[label.toLowerCase()] || "tag";
}

export function extractLabelsFromText(text: string): string[] | undefined {
  const match = text.match(REGEX.LABEL_PATTERN);

  if (!match?.[1]) {
    return undefined;
  }

  const labels = match[1]
    .split(",")
    .map((label) => label.trim())
    .filter((label) => label.length > 0);

  return labels.length > 0 ? labels : undefined;
}
