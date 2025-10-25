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

export function getLabelColor(label: string): {
  background: string;
  text: string;
} {
  const colorMap: Record<string, { background: string; text: string }> = {
    refactor: { background: "#3B82F6", text: "#FFFFFF" }, // blue
    cleanup: { background: "#EF4444", text: "#FFFFFF" }, // red
    optimization: { background: "#8B5CF6", text: "#FFFFFF" }, // purple
    bug: { background: "#DC2626", text: "#FFFFFF" }, // dark red
    feature: { background: "#10B981", text: "#FFFFFF" }, // green
    docs: { background: "#F59E0B", text: "#000000" }, // amber
    test: { background: "#06B6D4", text: "#FFFFFF" }, // cyan
    security: { background: "#EC4899", text: "#FFFFFF" }, // pink
    improvement: { background: "#6366F1", text: "#FFFFFF" }, // indigo
    performance: { background: "#8B5CF6", text: "#FFFFFF" }, // purple
    ui: { background: "#14B8A6", text: "#FFFFFF" }, // teal
    ux: { background: "#14B8A6", text: "#FFFFFF" }, // teal
    api: { background: "#F97316", text: "#FFFFFF" }, // orange
    database: { background: "#7C3AED", text: "#FFFFFF" }, // violet
    config: { background: "#64748B", text: "#FFFFFF" }, // slate
  };

  return (
    colorMap[label.toLowerCase()] || { background: "#6B7280", text: "#FFFFFF" }
  );
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
