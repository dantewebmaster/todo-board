import * as vscode from "vscode";

export function getTargetExtensions(): string[] {
  return vscode.workspace
    .getConfiguration("todo-board")
    .get<string[]>("fileExtensions", [
      "html",
      "css",
      "scss",
      "sass",
      "ts",
      "tsx",
      "js",
      "jsx",
      "vue",
      "mjs",
      "cjs",
      "md",
      "mdx",
      "json",
      "yaml",
      "yml",
      "java",
      "py",
      "go",
      "rb",
      "php",
      "rs",
      "swift",
      "kt",
      "kts",
      "dart",
      "cs",
    ]);
}

export function getIncludeGlob(): string {
  const exts = getTargetExtensions();
  return `**/*.{${exts.join(",")}}`;
}

export function getExcludeGlob(): string {
  return "{**/node_modules/**,**/assets/**,**/.git/**,**/.svn/**,**/.hg/**,**/.DS_Store,**/.idea/**,**/.vscode/**,**/.angular/**,**/dist/**,**/out/**,**/build/**,**/coverage/**,**/tmp/**,**/.cache/**,**/.todo-board/**}";
}

export function getMaxTodoLines(): number {
  return vscode.workspace
    .getConfiguration("todo-board")
    .get<number>("maxTodoLines", 4);
}
