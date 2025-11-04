import { readJsonFile, writeJsonFile } from "@/services/storage";
import { generateTodoId } from "@/utils/generators";
import type { CacheData } from "@/types/cache";

export async function readCache(): Promise<CacheData> {
  try {
    const parsed = await readJsonFile<unknown>("cache.json");
    const maybeNormalized = normalizeParsedCache(parsed);

    if (maybeNormalized) {
      return maybeNormalized;
    }
  } catch {
    // ignore
  }

  return { version: 2, files: {} };
}

export async function writeCache(cache: CacheData): Promise<void> {
  await writeJsonFile(
    "cache.json",
    cache.version === 2 ? cache : { version: 2, files: cache.files },
  );
}

function normalizeParsedCache(parsed: unknown): CacheData | null {
  if (!parsed || typeof parsed !== "object" || !("files" in parsed)) {
    return null;
  }

  const filesValue = (parsed as Record<string, unknown>).files;

  if (!filesValue || typeof filesValue !== "object") {
    return null;
  }

  const normalized: CacheData = { version: 2, files: {} };

  for (const [file, entryValue] of Object.entries(
    filesValue as Record<string, unknown>,
  )) {
    if (!entryValue || typeof entryValue !== "object") {
      continue;
    }

    const entryObj = entryValue as Record<string, unknown>;
    const mtimeRaw = entryObj.mtime;
    const mtime: number = typeof mtimeRaw === "number" ? mtimeRaw : 0;
    const hitsRaw = entryObj.hits;
    const hitsArray = Array.isArray(hitsRaw) ? hitsRaw : [];

    const hits = hitsArray.map((hValue) => {
      if (!hValue || typeof hValue !== "object") {
        return { id: generateTodoId(file, 0, ""), line: 0, text: "" };
      }

      const hObj = hValue as Record<string, unknown>;
      const line = typeof hObj.line === "number" ? hObj.line : 0;
      const text = typeof hObj.text === "string" ? hObj.text : "";
      const existingId = hObj.id;
      const id =
        typeof existingId === "string" && existingId.length > 0
          ? existingId
          : generateTodoId(file, line, text);

      return { id, line, text };
    });

    normalized.files[file] = { mtime, hits };
  }

  return normalized;
}
