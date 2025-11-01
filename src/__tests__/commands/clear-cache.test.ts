import * as assert from "node:assert";

import { clearAgeCache } from "@/commands/clear-cache";

suite("commands/clear-age-cache", () => {
  test("should execute without errors", async () => {
    // Just verify the command can be called without throwing
    await assert.doesNotReject(async () => await clearAgeCache(), "clearAgeCache should execute successfully");
  });
});
