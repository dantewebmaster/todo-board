export type TodoStatus = "todo" | "doing" | "done";

export interface BoardItem {
  id: string;
  status: TodoStatus;
  summary: string;
  description: string;
  filePath: string;
  relativePath: string;
  line: number;
}

export interface TodoGroups {
  todo: BoardItem[];
  doing: BoardItem[];
  done: BoardItem[];
}

export interface TodoHit {
  id: string;
  file: string;
  line: number;
  text: string;
}

export interface ScanResult {
  hits: TodoHit[];
  reused: number;
  scanned: number;
  filesProcessed: number;
}
