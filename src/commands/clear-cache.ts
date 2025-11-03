import * as vscode from "vscode";

import { clearAllUncommittedLineCache } from "@/services/git-line-info";

/**
 * Clear all cached dates for uncommitted TODO lines
 */
export async function clearAgeCache(): Promise<void> {
  try {
    clearAllUncommittedLineCache();

    await vscode.window.showInformationMessage(
      "TODO age cache cleared successfully. Rescan to update dates.",
    );
  } catch (error) {
    await vscode.window.showErrorMessage(
      `Failed to clear age cache: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
