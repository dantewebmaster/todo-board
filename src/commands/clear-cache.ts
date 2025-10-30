import * as vscode from "vscode";

import { clearAllLineCache } from "@/utils/git-info";

/**
 * Clear all cached dates for uncommitted TODO lines
 */
export async function clearCache(): Promise<void> {
  try {
    clearAllLineCache();

    await vscode.window.showInformationMessage(
      "TODO age cache cleared successfully. Rescan to update dates.",
    );
  } catch (error) {
    await vscode.window.showErrorMessage(
      `Failed to clear cache: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
