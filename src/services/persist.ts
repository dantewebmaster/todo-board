import { readJsonFile, writeJsonFile } from "@/services/storage";
import type { TodoHit } from "@/types/todo";

export async function persistResults(results: TodoHit[]): Promise<void> {
  try {
    await writeJsonFile("todos.json", results);
  } catch {
    // ignore
  }
}

export async function loadPersistedTodos(): Promise<TodoHit[]> {
  try {
    const parsed = await readJsonFile<unknown>("todos.json");

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isValidTodoHit).map((todo) => {
      // Convert lastModified string back to Date object if present
      if (todo.lastModified && typeof todo.lastModified === "string") {
        return {
          ...todo,
          lastModified: new Date(todo.lastModified),
        };
      }

      return todo;
    });
  } catch {
    return [];
  }
}

function isValidTodoHit(value: unknown): value is TodoHit {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.file === "string" &&
    typeof candidate.line === "number" &&
    typeof candidate.text === "string"
  );
}
