import { REGEX } from "@/constants/regex";
import { iconsSvg } from "@/ui/icons";
import type { TodoHit } from "@/types/todo";

type CommonLabels =
  | "bug"
  | "feature"
  | "refactor"
  | "cleanup"
  | "docs"
  | "ui"
  | "ux"
  | "database"
  | "api"
  | "security"
  | "performance"
  | "lint"
  | "dead-code"
  | "unused-code"
  | "docs"
  | "test"
  | "improvement"
  | "optimization"
  | "config";

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

export function getLabelIconSvg(label: string): string {
  // Map common label types to icons
  const iconMap: Record<CommonLabels, string> = {
    bug: iconsSvg.bug,
    feature: iconsSvg.sparkle,
    refactor: iconsSvg.code,
    cleanup: iconsSvg.clean,
    docs: iconsSvg.board,
    ui: iconsSvg.clean,
    ux: iconsSvg.clean,
    database: iconsSvg.database,
    api: iconsSvg.code,
    security: iconsSvg.security,
    performance: iconsSvg.rocket,
    lint: iconsSvg.lint,
    "dead-code": iconsSvg.trash,
    "unused-code": iconsSvg.trash,
    test: iconsSvg.test,
    improvement: iconsSvg.sparkle,
    optimization: iconsSvg.rocket,
    config: iconsSvg.gear,
  };

  const lowerLabel = label.toLowerCase() as CommonLabels;

  if (Object.hasOwn(iconMap, lowerLabel)) {
    return iconMap[lowerLabel];
  }

  return iconsSvg.tag;
}

export function getLabelColor(label: string): {
  background: string;
  text: string;
} {
  const colorMap: Record<CommonLabels, { background: string; text: string }> = {
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
    lint: { background: "#F43F5E", text: "#FFFFFF" }, // rose
    "dead-code": { background: "#9CA3AF", text: "#000000" }, // gray
    "unused-code": { background: "#9CA3AF", text: "#000000" }, // gray
  };

  const lowerLabel = label.toLowerCase();

  if (Object.hasOwn(colorMap, lowerLabel)) {
    return colorMap[lowerLabel as CommonLabels];
  }

  const defaultColor = { background: "#E5E7EB", text: "#000000" }; // light gray

  return defaultColor;
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
