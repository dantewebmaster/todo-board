import * as vscode from "vscode";

import { REGEX } from "@/constants/regex";
import { parseTodoPriority } from "@/utils/priority";
import type {
  BoardItem,
  TodoGroups,
  TodoHit,
  TodoPriority,
} from "@/types/todo";

const PRIORITY_LEVELS: TodoPriority[] = ["low", "medium", "high"];

export function buildBoardItems(hits: TodoHit[]): BoardItem[] {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  const relativePathResolver = workspaceFolders?.length
    ? (uri: string) => vscode.workspace.asRelativePath(uri)
    : (uri: string) => uri;

  return hits.map((hit) => toBoardItem(hit, relativePathResolver(hit.file)));
}

function toBoardItem(hit: TodoHit, relativePath: string): BoardItem {
  const { priority, description, labels } = parseTodoPriority(hit.text);
  const normalizedDescription = description.replace(
    REGEX.LINE_BREAK_REGEX,
    REGEX.LINE_BREAK_TOKEN,
  );

  return {
    id: hit.id,
    priority,
    description: normalizedDescription,
    filePath: hit.file,
    relativePath,
    line: hit.line,
    labels,
    lastModified: hit.lastModified,
    daysOld: hit.daysOld,
    issueId: hit.issueId,
    issueKey: hit.issueKey,
    issueLink: hit.issueLink,
  };
}

function compareBoardItems(left: BoardItem, right: BoardItem): number {
  if (left.relativePath !== right.relativePath) {
    return left.relativePath.localeCompare(right.relativePath);
  }

  if (left.line !== right.line) {
    return left.line - right.line;
  }

  return left.description.localeCompare(right.description);
}

export function groupItems(items: BoardItem[]): TodoGroups {
  const groups: TodoGroups = {
    low: [],
    medium: [],
    high: [],
  };

  for (const item of items) {
    groups[item.priority ?? "low"].push(item);
  }

  for (const priority of PRIORITY_LEVELS) {
    groups[priority].sort(compareBoardItems);
  }

  return groups;
}
