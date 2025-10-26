import * as assert from "node:assert";

import { loadPersistedTodos, persistResults } from "@/services/persist";

suite("services/persist", () => {
  suite("persistResults and loadPersistedTodos", () => {
    test("should export persistResults function", () => {
      assert.strictEqual(typeof persistResults, "function");
    });

    test("should export loadPersistedTodos function", () => {
      assert.strictEqual(typeof loadPersistedTodos, "function");
    });
  });
});
