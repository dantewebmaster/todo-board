import * as vscode from "vscode";

/**
 * Storage Service
 *
 * Provides centralized access to VS Code's workspace storage.
 * Files are stored in VS Code's managed storage directory, not in the user's workspace.
 *
 * Location: ~/Library/Application Support/Code/User/workspaceStorage/{workspace-id}/dantewebmaster.todo-board/
 */

let storageUri: vscode.Uri | undefined;

/**
 * Initialize storage service with extension context
 * Must be called during extension activation
 */
export function initializeStorage(context: vscode.ExtensionContext): void {
  storageUri = context.storageUri;
}

/**
 * Get the storage URI for the current workspace
 * @throws Error if storage was not initialized
 */
export function getStorageUri(): vscode.Uri {
  if (!storageUri) {
    throw new Error(
      "Storage not initialized. Call initializeStorage() during extension activation.",
    );
  }

  return storageUri;
}

/**
 * Get a file URI within the storage directory
 */
export function getStorageFile(filename: string): vscode.Uri {
  return vscode.Uri.joinPath(getStorageUri(), filename);
}

/**
 * Ensure storage directory exists
 */
export async function ensureStorageDirectory(): Promise<void> {
  const uri = getStorageUri();

  try {
    await vscode.workspace.fs.createDirectory(uri);
  } catch {
    // Directory might already exist, ignore errors
  }
}

/**
 * Read a JSON file from storage
 */
export async function readJsonFile<T>(filename: string): Promise<T | null> {
  try {
    const fileUri = getStorageFile(filename);
    const data = await vscode.workspace.fs.readFile(fileUri);
    const content = new TextDecoder().decode(data);

    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

/**
 * Write a JSON file to storage
 */
export async function writeJsonFile(
  filename: string,
  data: unknown,
): Promise<void> {
  await ensureStorageDirectory();

  const fileUri = getStorageFile(filename);
  const content = JSON.stringify(data, null, 2);

  await vscode.workspace.fs.writeFile(
    fileUri,
    new TextEncoder().encode(content),
  );
}
