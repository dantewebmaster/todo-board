import * as assert from "node:assert";
import * as fscb from "node:fs";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as vscode from "vscode";

import { readCache, writeCache } from "@/services/cache";
import { persistResults } from "@/services/persist";
import { createTempWorkspace } from "./test-helpers";

suite("cache and persist", () => {
  test("readCache returns empty when missing; writeCache persists", async () => {
    const tmp = await createTempWorkspace();
    try {
      const empty = await readCache(tmp.uri);
      assert.deepStrictEqual(empty, { version: 2, files: {} });

      const sample = {
        version: 2 as const,
        files: {
          [path.join(tmp.fsPath, "a.ts")]: {
            mtime: 123,
            hits: [{ id: "dummy", line: 1, text: "@TODO x" }],
          },
        },
      };
      await writeCache(tmp.uri, sample);
      const roundtrip = await readCache(tmp.uri);
      assert.deepStrictEqual(roundtrip, sample);
    } finally {
      await tmp.dispose();
    }
  });

  test("persistResults writes todos.json", async () => {
    // Use existing workspace folder to avoid updateWorkspaceFolders restrictions
    const folder = vscode.workspace.workspaceFolders?.[0];
    if (!folder) {
      // Skip if no workspace available
      return;
    }

    const rootPath = folder.uri.fsPath;
    const outDir = path.join(rootPath, ".todo-board");
    const outFile = path.join(outDir, "todos.json");

    // Pre-clean
    try {
      if (fscb.existsSync(outFile)) {
        await fs.unlink(outFile);
      }
    } catch {
      // ignore
    }

    const results = [
      { id: "id-a", file: path.join(rootPath, "f1.ts"), line: 1, text: "@TODO a" },
      { id: "id-b", file: path.join(rootPath, "f2.ts"), line: 2, text: "@TODO b" },
    ];
    await persistResults(results);
    const uri = vscode.Uri.file(outFile);
    const data = await vscode.workspace.fs.readFile(uri);
    const parsed = JSON.parse(new TextDecoder().decode(data));
    assert.strictEqual(Array.isArray(parsed), true);
    assert.strictEqual(parsed.length, results.length);

    // Cleanup best-effort
    try {
      await fs.unlink(outFile);
      await fs.rmdir(outDir);
    } catch {
      // ignore
    }
  });
});
