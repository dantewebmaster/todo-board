import * as assert from "node:assert";

import { scanTodos } from "@/commands/scan-todos";

suite("commands/scan-todos", () => {
  test("should export scanTodos command", () => {
    assert.strictEqual(typeof scanTodos, "function");
  });
});
