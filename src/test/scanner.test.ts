import * as assert from "node:assert";
import * as path from "node:path";
import type { Progress } from "vscode";
import { scanWorkspace } from "../scanner";
import { createTempWorkspace } from "./helpers";

suite("scanner", function () {
  this.timeout(8000);
  test("finds @TODO in //, #, block and html comments with continuation", async () => {
    const tmp = await createTempWorkspace();
    try {
      const files = [
        {
          rel: "src/a.ts",
          content: `// @TODO first\n// line two\nconst x = 1;`,
        },
        {
          rel: "scripts/b.py",
          content: `# @TODO py task\n# continued\nprint('ok')`,
        },
        {
          rel: "pkg/c.java",
          content: `/* @TODO(java) start\n * middle\n */\nclass C {}`,
        },
        {
          rel: "web/d.html",
          content: `<!-- @TODO html todo\nnext line\n-->\n<div></div>`,
        },
      ];

      for (const f of files) {
        await tmp.writeFile(f.rel, f.content);
      }
      // Give the filesystem a brief moment
      await new Promise((r) => setTimeout(r, 100));

      const progress: Progress<{ message?: string; increment?: number }> = {
        report: () => undefined,
      };
      const result = await scanWorkspace(progress);
      assert.ok(result.filesProcessed >= files.length);
      // We expect at least one hit per file
      const filesWithHits = new Set(result.hits.map((h) => path.basename(h.file)));
      assert.ok(filesWithHits.has("a.ts"));
      assert.ok(filesWithHits.has("b.py"));
      assert.ok(filesWithHits.has("c.java"));
      assert.ok(filesWithHits.has("d.html"));

      // Validate continuation join token appears (newline) for a.ts
      const aHit = result.hits.find((h) => h.file.endsWith("a.ts"));
      const text = aHit?.text ?? "";
      assert.ok(text.includes("first") && text.includes("line two"));
    } finally {
      await tmp.dispose();
    }
  });
});
