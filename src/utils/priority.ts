import type { TodoPriority } from "@/types/todo";

export function extractPriorityToken(metadata: string): string {
  const firstSection = metadata.split(",")[0] ?? metadata;
  const token = firstSection.split(":")[0] ?? firstSection;

  return token.trim().toLowerCase();
}

export function normalizePriority(token: string): TodoPriority {
  if (token === "high") {
    return "high";
  }

  if (token === "medium") {
    return "medium";
  }

  return "low";
}
