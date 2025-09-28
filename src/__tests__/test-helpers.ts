import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import * as vscode from "vscode";

export interface TempWorkspaceHandle {
  uri: vscode.Uri;
  folder: vscode.WorkspaceFolder;
  fsPath: string;
  dispose: () => Promise<void>;
  writeFile: (relPath: string, content: string) => Promise<vscode.Uri>;
}

export async function createTempWorkspace(): Promise<TempWorkspaceHandle> {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "todo-board-test-"));
  const uri = vscode.Uri.file(tmpRoot);

  // Replace all current workspace folders with this temp folder to keep tests isolated
  const removeCount = vscode.workspace.workspaceFolders?.length ?? 0;
  const added = vscode.workspace.updateWorkspaceFolders(0, removeCount, {
    uri,
    name: path.basename(tmpRoot),
  });

  if (!added || !vscode.workspace.workspaceFolders?.length) {
    throw new Error("Failed to add temporary workspace folder");
  }

  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) {
    throw new Error("No workspace folder available after adding temp folder");
  }

  async function writeFile(
    relPath: string,
    content: string,
  ): Promise<vscode.Uri> {
    const fileUri = vscode.Uri.file(path.join(tmpRoot, relPath));
    const dirUri = vscode.Uri.file(path.dirname(fileUri.fsPath));
    await vscode.workspace.fs.createDirectory(dirUri);
    await vscode.workspace.fs.writeFile(
      fileUri,
      new TextEncoder().encode(content),
    );
    return fileUri;
  }

  async function dispose() {
    // Remove workspace folder first
    const index =
      vscode.workspace.workspaceFolders?.findIndex(
        (f) => f.uri.fsPath === folder.uri.fsPath,
      ) ?? -1;
    if (index >= 0) {
      vscode.workspace.updateWorkspaceFolders(index, 1);
    }
    // Cleanup on disk best-effort
    try {
      await fs.rm(tmpRoot, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }

  return { uri, folder, fsPath: tmpRoot, dispose, writeFile };
}
