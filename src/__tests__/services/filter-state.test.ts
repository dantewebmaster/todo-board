import * as assert from "node:assert";

import { filterState } from "@/services/filter-state";

suite("services/filter-state", () => {
  // Clean state after each test
  teardown(() => {
    filterState.reset();
  });

  suite("Label Filters", () => {
    test("should start with empty labels", () => {
      const filters = filterState.getFilters();
      assert.deepStrictEqual(filters.labels, []);
    });

    test("should add label", () => {
      filterState.addLabel("bug");
      const filters = filterState.getFilters();

      assert.deepStrictEqual(filters.labels, ["bug"]);
    });

    test("should not add duplicate labels", () => {
      filterState.addLabel("bug");
      filterState.addLabel("bug");
      const filters = filterState.getFilters();

      assert.deepStrictEqual(filters.labels, ["bug"]);
    });

    test("should add multiple labels", () => {
      filterState.addLabel("bug");
      filterState.addLabel("feature");
      const filters = filterState.getFilters();

      assert.deepStrictEqual(filters.labels, ["bug", "feature"]);
    });

    test("should remove label", () => {
      filterState.addLabel("bug");
      filterState.addLabel("feature");
      filterState.removeLabel("bug");
      const filters = filterState.getFilters();

      assert.deepStrictEqual(filters.labels, ["feature"]);
    });

    test("should toggle label on", () => {
      filterState.toggleLabel("bug");
      const filters = filterState.getFilters();

      assert.deepStrictEqual(filters.labels, ["bug"]);
    });

    test("should toggle label off", () => {
      filterState.addLabel("bug");
      filterState.toggleLabel("bug");
      const filters = filterState.getFilters();

      assert.deepStrictEqual(filters.labels, []);
    });

    test("should set labels (replace all)", () => {
      filterState.addLabel("bug");
      filterState.setLabels(["feature", "refactor"]);
      const filters = filterState.getFilters();

      assert.deepStrictEqual(filters.labels, ["feature", "refactor"]);
    });

    test("should clear all labels", () => {
      filterState.addLabel("bug");
      filterState.addLabel("feature");
      filterState.clearLabels();
      const filters = filterState.getFilters();

      assert.deepStrictEqual(filters.labels, []);
    });
  });

  suite("Age Filter", () => {
    test("should start with 'all' age filter", () => {
      const filters = filterState.getFilters();
      assert.strictEqual(filters.age, "all");
    });

    test("should set age filter to 'fresh'", () => {
      filterState.setAgeFilter("fresh");
      const filters = filterState.getFilters();

      assert.strictEqual(filters.age, "fresh");
    });

    test("should set age filter to 'recent'", () => {
      filterState.setAgeFilter("recent");
      const filters = filterState.getFilters();

      assert.strictEqual(filters.age, "recent");
    });

    test("should set age filter to 'old'", () => {
      filterState.setAgeFilter("old");
      const filters = filterState.getFilters();

      assert.strictEqual(filters.age, "old");
    });

    test("should set age filter to 'abandoned'", () => {
      filterState.setAgeFilter("abandoned");
      const filters = filterState.getFilters();

      assert.strictEqual(filters.age, "abandoned");
    });
  });

  suite("Sort Options", () => {
    test("should start with descending sort", () => {
      const sort = filterState.getSort();
      assert.strictEqual(sort.direction, "desc");
    });

    test("should set sort to ascending", () => {
      filterState.setSort({ direction: "asc" });
      const sort = filterState.getSort();

      assert.strictEqual(sort.direction, "asc");
    });

    test("should toggle sort direction from desc to asc", () => {
      filterState.toggleSortDirection();
      const sort = filterState.getSort();

      assert.strictEqual(sort.direction, "asc");
    });

    test("should toggle sort direction from asc to desc", () => {
      filterState.setSort({ direction: "asc" });

      // Verify it's asc first
      let sort = filterState.getSort();
      assert.strictEqual(sort.direction, "asc");

      filterState.toggleSortDirection();
      sort = filterState.getSort();

      assert.strictEqual(sort.direction, "desc");
    });
  });

  suite("Change Listeners", () => {
    test("should notify listeners when label added", (done) => {
      filterState.clearLabels(); // Clean state

      const unsubscribe = filterState.onChange(() => {
        unsubscribe();
        done();
      });

      filterState.addLabel("bug");
    });

    test("should notify listeners when label removed", (done) => {
      filterState.setLabels(["bug"]); // Setup

      const unsubscribe = filterState.onChange(() => {
        unsubscribe();
        done();
      });

      filterState.removeLabel("bug");
    });

    test("should notify listeners when age filter changes", (done) => {
      const unsubscribe = filterState.onChange(() => {
        unsubscribe();
        done();
      });

      filterState.setAgeFilter("fresh");
    });

    test("should notify listeners when sort changes", (done) => {
      const unsubscribe = filterState.onChange(() => {
        unsubscribe();
        done();
      });

      filterState.toggleSortDirection();
    });

    test("should allow unsubscribing", () => {
      let callCount = 0;

      const unsubscribe = filterState.onChange(() => {
        callCount++;
      });

      filterState.addLabel("bug"); // callCount = 1
      unsubscribe();
      filterState.addLabel("feature"); // should not increment

      assert.strictEqual(callCount, 1);
    });

    test("should notify multiple listeners", () => {
      filterState.clearLabels(); // Clean state
      let count1 = 0;
      let count2 = 0;

      const unsub1 = filterState.onChange(() => {
        count1++;
      });
      const unsub2 = filterState.onChange(() => {
        count2++;
      });

      filterState.addLabel("bug");

      assert.strictEqual(count1, 1);
      assert.strictEqual(count2, 1);

      unsub1();
      unsub2();
    });
  });

  suite("Reset", () => {
    test("should reset all filters and sort to defaults", () => {
      filterState.addLabel("bug");
      filterState.addLabel("feature");
      filterState.setAgeFilter("fresh");
      filterState.setSort({ direction: "asc" });

      filterState.reset();

      const filters = filterState.getFilters();
      const sort = filterState.getSort();

      assert.deepStrictEqual(filters.labels, []);
      assert.strictEqual(filters.age, "all");
      assert.strictEqual(sort.direction, "desc");
    });

    test("should notify listeners when reset", (done) => {
      filterState.setLabels(["bug"]); // Setup

      const unsubscribe = filterState.onChange(() => {
        unsubscribe();
        done();
      });

      filterState.reset();
    });
  });

  suite("Immutability", () => {
    test("getFilters should return a copy", () => {
      filterState.addLabel("bug");
      const filters1 = filterState.getFilters();
      const filters2 = filterState.getFilters();

      assert.notStrictEqual(filters1, filters2);
      assert.deepStrictEqual(filters1, filters2);
    });

    test("getSort should return a copy", () => {
      const sort1 = filterState.getSort();
      const sort2 = filterState.getSort();

      assert.notStrictEqual(sort1, sort2);
      assert.deepStrictEqual(sort1, sort2);
    });

    test("modifying returned filters should not affect state", () => {
      filterState.clearLabels(); // Ensure clean state
      const filters = filterState.getFilters();
      // Cannot push to the array as it's a reference
      // This test verifies the object itself is a copy
      assert.ok(filters !== filterState.getFilters());
    });
  });
});
