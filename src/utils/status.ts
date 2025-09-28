import type { TodoStatus } from "../types/todo";

export function extractStatusToken(metadata: string): string {
  const firstSection = metadata.split(",")[0] ?? metadata;
  const token = firstSection.split(":")[0] ?? firstSection;

  return token.trim().toLowerCase();
}

export function normalizeStatus(token: string): TodoStatus {
  if (token === "doing") {
    return "doing";
  }

  if (token === "done") {
    return "done";
  }

  return "todo";
}
