import { REGEX } from "@/constants/regex";
import { extractLabelsFromText } from "./label";
import type { TodoPriority } from "@/types/todo";

function extractPriorityToken(metadata: string): string {
  const firstSection = metadata.split(",")[0] ?? metadata;
  const token = firstSection.split(":")[0] ?? firstSection;

  return token.trim().toLowerCase();
}

function normalizePriority(token: string): TodoPriority {
  if (token === "high") {
    return "high";
  }

  if (token === "medium") {
    return "medium";
  }

  return "low";
}

export function parseTodoPriority(text: string): {
  priority: TodoPriority;
  description: string;
  labels?: string[];
} {
  const match = REGEX.PRIORITY_REGEX.exec(text);

  if (!match) {
    const labels = extractLabelsFromText(text);
    return { priority: "low", description: text.trim(), labels };
  }

  const metadata = match[1] ?? "";
  const token = extractPriorityToken(metadata);
  const priority: TodoPriority = normalizePriority(token);
  const description = text;
  const labels = extractLabelsFromText(description);

  return {
    priority,
    description,
    labels,
  };
}
