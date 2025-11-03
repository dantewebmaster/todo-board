import type { CommonLabels } from "./label";

export type TodoPriority = "low" | "medium" | "high";

export interface BoardItem {
  id: string;
  priority: TodoPriority;
  description: string;
  filePath: string;
  relativePath: string;
  line: number;
  labels: CommonLabels[] | string[] | undefined;
  lastModified?: Date;
  daysOld?: number;
}

export interface TodoGroups {
  low: BoardItem[];
  medium: BoardItem[];
  high: BoardItem[];
}

export interface TodoHit {
  id: string;
  file: string;
  line: number;
  text: string;
  lastModified?: Date;
  daysOld?: number;
}

export interface ScanResult {
  hits: TodoHit[];
  reused: number;
  scanned: number;
  filesProcessed: number;
}
