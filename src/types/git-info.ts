export interface GitLineInfo {
  date: Date;
  daysOld: number;
  isUncommitted?: boolean;
}

export interface UncommittedLineInfo {
  date: string; // ISO string for serialization
  contentHash: string; // Hash of line content to detect changes
}
