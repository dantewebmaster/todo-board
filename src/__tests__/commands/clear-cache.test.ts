import * as assert from "node:assert";

import { clearCache } from "@/commands/clear-cache";

suite("commands/clear-cache", () => {
  test("should execute without errors", async () => {
    // Just verify the command can be called without throwing
    await assert.doesNotReject(async () => await clearCache(), "clearCache should execute successfully");
  });
});
