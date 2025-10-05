import type { TodoPriority } from "@/types/todo";

export function extractPriorityToken(metadata: string): string {
  const firstSection = metadata.split(",")[0] ?? metadata;
  const token = firstSection.split(":")[0] ?? firstSection;

  return token.trim().toLowerCase();
}

export function normalizePriority(token: string): TodoPriority {
  if (token === "low") {
    return "low";
  }

  if (token === "medium") {
    return "medium";
  }

  return "high";
}
