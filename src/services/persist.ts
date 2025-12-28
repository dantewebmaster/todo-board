import { readJsonFile, writeJsonFile } from "@/services/storage";
import type { TodoHit } from "@/types/todo";

/**
 * Mescla novos TODOs escaneados com informações de issues já criadas.
 * Se um TODO já existia e tinha issue associada, mantém essas informações.
 */
export async function mergeWithPersistedIssues(
  newTodos: TodoHit[],
): Promise<TodoHit[]> {
  try {
    const persistedTodos = await loadPersistedTodos();

    // Cria um mapa de TODOs antigos por file:line para rápida consulta
    const persistedMap = new Map<string, TodoHit>();
    for (const todo of persistedTodos) {
      const key = `${todo.file}:${todo.line}`;
      persistedMap.set(key, todo);
    }

    // Mescla informações de issues nos novos TODOs
    const mergedTodos = newTodos.map((newTodo) => {
      const key = `${newTodo.file}:${newTodo.line}`;
      const persistedTodo = persistedMap.get(key);

      // Se o TODO já existia e tinha issue, mantém as informações
      if (persistedTodo?.issueId) {
        return {
          ...newTodo,
          issueId: persistedTodo.issueId,
          issueKey: persistedTodo.issueKey,
          issueLink: persistedTodo.issueLink,
        };
      }

      return newTodo;
    });

    return mergedTodos;
  } catch {
    // Se houver erro ao carregar TODOs antigos, retorna os novos sem merge
    return newTodos;
  }
}

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

export async function updateTodoWithIssue(
  filePath: string,
  line: number,
  issueData: { id: string; key: string; link: string },
): Promise<void> {
  try {
    const todos = await loadPersistedTodos();

    const updatedTodos = todos.map((todo) => {
      console.log("[updateTodoWithIssue] Comparando:", {
        todoFile: todo.file,
        todoLine: todo.line,
        searchFile: filePath,
        searchLine: line,
        match: todo.file === filePath && todo.line === line,
      });

      if (todo.file === filePath && todo.line === line) {
        return {
          ...todo,
          issueId: issueData.id,
          issueKey: issueData.key,
          issueLink: issueData.link,
        };
      }
      return todo;
    });

    await persistResults(updatedTodos);
  } catch (error) {
    console.error("[updateTodoWithIssue] Erro:", error);
  }
}
