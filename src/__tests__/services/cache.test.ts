import * as assert from "node:assert";

import { readCache, writeCache } from "@/services/cache";

suite("services/cache", () => {
  suite("readCache and writeCache", () => {
    test("should export readCache function", () => {
      assert.strictEqual(typeof readCache, "function");
    });

    test("should export writeCache function", () => {
      assert.strictEqual(typeof writeCache, "function");
    });
  });
});
