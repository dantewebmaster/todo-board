export interface TodoHit {
  file: string;
  line: number;
  text: string;
}

export interface CacheEntry {
  mtime: number;
  hits: { line: number; text: string }[];
}

export interface CacheData {
  version: 1;
  files: Record<string, CacheEntry>;
}

export interface ScanResult {
  hits: TodoHit[];
  reused: number;
  scanned: number;
}
