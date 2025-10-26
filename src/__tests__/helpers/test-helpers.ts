import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as vscode from "vscode";

export interface TempWorkspaceHandle {
  uri: vscode.Uri;
  folder: vscode.WorkspaceFolder | undefined;
  fsPath: string;
  dispose: () => Promise<void>;
  writeFile: (relPath: string, content: string) => Promise<vscode.Uri>;
}

export async function createTempWorkspace(): Promise<TempWorkspaceHandle> {
  const folder = vscode.workspace.workspaceFolders?.[0];

  if (!folder) {
    throw new Error("No workspace folder available");
  }

  const testDir = path.join(
    folder.uri.fsPath,
    ".test-tmp",
    Date.now().toString(),
  );
  const uri = vscode.Uri.file(testDir);

  await vscode.workspace.fs.createDirectory(uri);

  async function writeFile(
    relPath: string,
    content: string,
  ): Promise<vscode.Uri> {
    const fileUri = vscode.Uri.file(path.join(testDir, relPath));
    const dirUri = vscode.Uri.file(path.dirname(fileUri.fsPath));
    await vscode.workspace.fs.createDirectory(dirUri);
    await vscode.workspace.fs.writeFile(
      fileUri,
      new TextEncoder().encode(content),
    );
    return fileUri;
  }

  async function dispose() {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }

  return { uri, folder, fsPath: testDir, dispose, writeFile };
}
