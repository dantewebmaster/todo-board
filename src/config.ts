import * as vscode from "vscode";

export function getTargetExtensions(): string[] {
  return vscode.workspace
    .getConfiguration("todo-board")
    .get<string[]>("fileExtensions", ["ts", "tsx", "js", "jsx", "mjs", "cjs", "md", "json"]);
}

export function getIncludeGlob(): string {
  const exts = getTargetExtensions();
  return `**/*.{${exts.join(",")}}`;
}

export function getExcludeGlob(): string {
  return "{**/node_modules/**,**/assets/**,**/.git/**,**/.svn/**,**/.hg/**,**/.DS_Store,**/.idea/**,**/.vscode/**,**/.angular/**,**/dist/**,**/out/**,**/build/**,**/coverage/**,**/tmp/**,**/.cache/**}";
}
