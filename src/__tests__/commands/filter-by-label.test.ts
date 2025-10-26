import * as assert from "node:assert";

import { filterByLabel } from "@/commands/filter-by-label";
import { filterState } from "@/services/filter-state";

suite("commands/filter-by-label", () => {
  test("should update filter state with provided label", async () => {
    await filterByLabel("bug");

    const activeLabel = filterState.getActiveLabel();
    assert.strictEqual(activeLabel, "bug");
  });

  test("should handle different label values", async () => {
    await filterByLabel("feature");
    assert.strictEqual(filterState.getActiveLabel(), "feature");

    await filterByLabel("refactor");
    assert.strictEqual(filterState.getActiveLabel(), "refactor");

    await filterByLabel("cleanup");
    assert.strictEqual(filterState.getActiveLabel(), "cleanup");
  });

  test("should clear previous filter state", async () => {
    await filterByLabel("bug");
    assert.strictEqual(filterState.getActiveLabel(), "bug");

    await filterByLabel("feature");
    assert.strictEqual(filterState.getActiveLabel(), "feature");
  });

  test("should handle empty label", async () => {
    await filterByLabel("");

    const activeLabel = filterState.getActiveLabel();
    assert.strictEqual(activeLabel, "");
  });

  test("should not throw errors when executing", async () => {
    await assert.doesNotReject(async () => {
      await filterByLabel("test-label");
    });
  });
});
