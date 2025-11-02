import * as assert from "node:assert";

import { filterByLabel } from "@/commands/filter-by-label";
import { filterState } from "@/services/filter-state";

suite("commands/filter-by-label", () => {
  test("should add label to filter state", async () => {
    filterState.clearLabels(); // Start clean
    await filterByLabel("bug");

    const filters = filterState.getFilters();
    assert.strictEqual(filters.labels.includes("bug"), true);
  });

  test("should toggle labels (add and remove)", async () => {
    filterState.clearLabels(); // Start clean

    await filterByLabel("feature");
    assert.strictEqual(filterState.getFilters().labels.includes("feature"), true);

    await filterByLabel("feature"); // Toggle off
    assert.strictEqual(filterState.getFilters().labels.includes("feature"), false);
  });

  test("should support multiple labels", async () => {
    filterState.clearLabels(); // Start clean

    await filterByLabel("bug");
    await filterByLabel("feature");
    await filterByLabel("refactor");

    const filters = filterState.getFilters();
    assert.strictEqual(filters.labels.length, 3);
    assert.strictEqual(filters.labels.includes("bug"), true);
    assert.strictEqual(filters.labels.includes("feature"), true);
    assert.strictEqual(filters.labels.includes("refactor"), true);
  });

  test("should handle empty label", async () => {
    filterState.clearLabels(); // Start clean
    await filterByLabel("");

    const filters = filterState.getFilters();
    assert.strictEqual(filters.labels.includes(""), true);
  });

  test("should not throw errors when executing", async () => {
    await assert.doesNotReject(async () => {
      await filterByLabel("test-label");
    });
  });
});
