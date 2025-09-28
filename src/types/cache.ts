interface CacheHit {
  id: string;
  line: number;
  text: string;
}

export interface CacheEntry {
  mtime: number;
  hits: CacheHit[];
}

export interface CacheData {
  version: 2;
  files: Record<string, CacheEntry>;
}
