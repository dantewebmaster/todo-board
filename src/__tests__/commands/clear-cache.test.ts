import * as assert from "node:assert";

import { clearAllUncommittedLineCache } from "@/services/git-line-info";

suite("commands/clear-age-cache", () => {
  test("should clear uncommitted line cache", () => {
    // Test the actual cache clearing logic without UI
    assert.doesNotThrow(
      () => clearAllUncommittedLineCache(),
      "clearAllUncommittedLineCache should execute successfully",
    );
  });
});
