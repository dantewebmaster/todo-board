export interface TodoHit {
  id: string;
  file: string;
  line: number;
  text: string;
}

export interface CacheEntryV2 {
  mtime: number;
  hits: { id: string; line: number; text: string }[];
}

export interface CacheDataV2 {
  version: 2;
  files: Record<string, CacheEntryV2>;
}

// Backward compat types (v1) for migration
export interface CacheEntryV1 {
  mtime: number;
  hits: { line: number; text: string }[];
}
export interface CacheDataV1 {
  version: 1;
  files: Record<string, CacheEntryV1>;
}

export type CacheData = CacheDataV2; // public usage now points to v2

export interface ScanResult {
  hits: TodoHit[];
  reused: number;
  scanned: number;
  filesProcessed: number;
}
