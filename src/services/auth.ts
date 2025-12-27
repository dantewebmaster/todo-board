import * as vscode from "vscode";

import {
  getStorageFile,
  readJsonFile,
  writeJsonFile,
} from "@/services/storage";

const TOKEN_FILENAME = "auth.token.json";
const SECRET_KEY = "todoBoard.jiraToken";

let secretStorage: vscode.SecretStorage | null = null;

export function initializeAuth(context: vscode.ExtensionContext): void {
  secretStorage = context.secrets;
}

export async function getAuthToken(): Promise<string | null> {
  // Prefer secret storage
  if (secretStorage) {
    try {
      const storedToken = await secretStorage.get(SECRET_KEY);

      if (storedToken === undefined || storedToken === "") {
        return null;
      }

      return storedToken;
    } catch {
      // fallback
    }
  }

  // Fallback to storage file
  const data = await readJsonFile<{ token: string }>(TOKEN_FILENAME);
  return data?.token ?? null;
}

export async function setAuthToken(token: string): Promise<void> {
  if (secretStorage) {
    try {
      await secretStorage.store(SECRET_KEY, token);
      return;
    } catch {
      // fallback to file
    }
  }

  const payload = { token, createdAt: new Date().toISOString() };
  await writeJsonFile(TOKEN_FILENAME, payload);
}

export async function clearAuthToken(): Promise<void> {
  if (secretStorage) {
    try {
      await secretStorage.delete(SECRET_KEY);
      return;
    } catch {
      // fallback
    }
  }

  try {
    const uri = getStorageFile(TOKEN_FILENAME);
    await vscode.workspace.fs.delete(uri);
  } catch {
    // ignore
  }
}
