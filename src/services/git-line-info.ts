import { exec } from "node:child_process";
import { stat } from "node:fs/promises";
import { promisify } from "node:util";
import * as vscode from "vscode";

import { readJsonFile, writeJsonFile } from "@/services/storage";
import { hashContent } from "@/utils/generators";
import type { GitLineInfo, UncommittedLineInfo } from "@/types/git-info";

const execAsync = promisify(exec);

/**
 * Cache to store uncommitted line dates persistently
 *
 * How it works:
 * - For committed lines: Uses git blame to get exact commit date
 * - For uncommitted lines: Uses file mtime (modification time) and content hash
 * - Cache persists to VS Code's workspace storage
 * - If line content changes, cache updates with new mtime
 * - If line is committed, cache entry is removed automatically
 *
 * This ensures:
 * - Dates remain consistent across rescans (even after saving files)
 * - Editing a TODO updates its date to reflect the modification
 * - Committed TODOs show exact commit dates
 * - Behavior matches GitLens line age display
 */

const uncommittedLineCache = new Map<string, UncommittedLineInfo>();
let cacheLoaded = false;

/**
 * Load uncommitted line cache from disk
 */
async function loadUncommittedLineCache(): Promise<void> {
  if (cacheLoaded) {
    return;
  }

  try {
    const cacheData = await readJsonFile<Record<string, UncommittedLineInfo>>(
      "uncommitted-cache.json",
    );

    if (cacheData) {
      uncommittedLineCache.clear();
      for (const [key, value] of Object.entries(cacheData)) {
        uncommittedLineCache.set(key, value);
      }
    }
  } catch {
    // Cache file doesn't exist or is invalid, start fresh
  } finally {
    cacheLoaded = true;
  }
}

/**
 * Save uncommitted line cache to disk
 */
async function saveUncommittedLineCache(): Promise<void> {
  try {
    const cacheData: Record<string, UncommittedLineInfo> = {};
    for (const [key, value] of uncommittedLineCache.entries()) {
      cacheData[key] = value;
    }

    await writeJsonFile("uncommitted-cache.json", cacheData);
  } catch {
    // Ignore errors when saving cache
  }
}

/**
 * Get the last modification date of a specific line in a file using git blame
 *
 * Behavior:
 * - Committed lines: Returns exact date from git commit
 * - Uncommitted lines (new): Uses file mtime and caches it
 * - Uncommitted lines (edited): Updates cache with new mtime when content changes
 * - Uncommitted lines (rescanned): Keeps original cached date if content unchanged
 *
 * Example scenarios:
 * 1. TODO added 2 days ago (not committed):
 *    - Shows "2 days" based on file mtime
 *    - Remains "2 days" on rescans (cached)
 *
 * 2. Editing that TODO today:
 *    - Content hash changes
 *    - Updates to show "Today" (new mtime)
 *
 * 3. Committing the TODO:
 *    - Shows exact commit date
 *    - Cache entry removed
 *
 * @param filePath - Absolute path to the file
 * @param lineNumber - Line number (1-based)
 * @returns Git line information or undefined if not available
 */
export async function getLineInfo(
  filePath: string,
  lineNumber: number,
): Promise<GitLineInfo | undefined> {
  // Load cache from disk on first use
  await loadUncommittedLineCache();

  try {
    // Extract directory from file path to run git blame in the correct repo
    const fileDir = filePath.substring(0, filePath.lastIndexOf("/"));

    // Get the actual line content to detect changes
    const fileUri = vscode.Uri.file(filePath);
    const document = await vscode.workspace.openTextDocument(fileUri);
    const lineContent = document.lineAt(lineNumber - 1).text.trim();
    const contentHash = hashContent(lineContent);

    const { stdout } = await execAsync(
      `git blame -L ${lineNumber},${lineNumber} --porcelain "${filePath}"`,
      {
        timeout: 5000, // 5 second timeout to prevent hanging
        cwd: fileDir, // Run git in the file's directory
      },
    );

    // Extract timestamp from porcelain format
    // Example line: "author-time 1698364800"
    const timeMatch = stdout.match(/^author-time (\d+)$/m);

    if (!timeMatch) {
      return undefined;
    }

    const timestamp = Number.parseInt(timeMatch[1], 10);
    let date = new Date(timestamp * 1000);

    // Check if line is not committed yet (hash starts with 0000000000)
    const hashMatch = stdout.match(/^([0-9a-f]{40})/m);
    const isUncommitted = hashMatch?.[1].startsWith("0000000000");

    // For uncommitted changes, use cached date or file mtime
    if (isUncommitted) {
      const cacheKey = `${filePath}:${lineNumber}`;
      const cachedInfo = uncommittedLineCache.get(cacheKey);

      // Check if we have cached info for this exact content
      if (cachedInfo && cachedInfo.contentHash === contentHash) {
        // Content hasn't changed, use cached date
        date = new Date(cachedInfo.date);
      } else {
        // New line or content changed - use file modification time
        try {
          const fileStat = await stat(filePath);
          date = fileStat.mtime;
        } catch {
          date = new Date();
        }

        // Cache this info
        uncommittedLineCache.set(cacheKey, {
          date: date.toISOString(),
          contentHash,
        });

        // Save cache to disk
        await saveUncommittedLineCache();
      }
    } else {
      // Line is committed, remove from cache if it exists
      const cacheKey = `${filePath}:${lineNumber}`;
      if (uncommittedLineCache.has(cacheKey)) {
        uncommittedLineCache.delete(cacheKey);
        await saveUncommittedLineCache();
      }
    }

    const now = new Date();

    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysOld = Math.floor(
      (nowOnly.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24),
    );

    return { date, daysOld, isUncommitted };
  } catch {
    return undefined;
  }
}

/**
 * Clear all uncommitted line cache
 * Useful when rescanning or when commits are made
 */
export async function clearAllUncommittedLineCache(): Promise<void> {
  uncommittedLineCache.clear();
  await saveUncommittedLineCache();
}
