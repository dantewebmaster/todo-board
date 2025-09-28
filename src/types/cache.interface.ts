export interface CacheEntry {
  mtime: number;
  hits: { id: string; line: number; text: string }[];
}

export interface CacheData {
  version: 2;
  files: Record<string, CacheEntry>;
}
