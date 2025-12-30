import * as assert from "node:assert";

import { formatDate, formatDaysOld, getAgeBadgeClass, getAgeCategory } from "@/utils/age-formatter";

suite("utils/age-formatter", () => {
  suite("getAgeCategory", () => {
    test("should return 'fresh' for TODOs 0-7 days old", () => {
      assert.strictEqual(getAgeCategory(0), "fresh");
      assert.strictEqual(getAgeCategory(3), "fresh");
      assert.strictEqual(getAgeCategory(7), "fresh");
    });

    test("should return 'recent' for TODOs 8-30 days old", () => {
      assert.strictEqual(getAgeCategory(8), "recent");
      assert.strictEqual(getAgeCategory(15), "recent");
      assert.strictEqual(getAgeCategory(30), "recent");
    });

    test("should return 'old' for TODOs 31-90 days old", () => {
      assert.strictEqual(getAgeCategory(31), "old");
      assert.strictEqual(getAgeCategory(60), "old");
      assert.strictEqual(getAgeCategory(90), "old");
    });

    test("should return 'abandoned' for TODOs over 90 days old", () => {
      assert.strictEqual(getAgeCategory(91), "abandoned");
      assert.strictEqual(getAgeCategory(180), "abandoned");
      assert.strictEqual(getAgeCategory(365), "abandoned");
    });
  });

  suite("getAgeBadgeClass", () => {
    test("should return correct CSS class for each age category", () => {
      assert.strictEqual(getAgeBadgeClass(0), "age-fresh");
      assert.strictEqual(getAgeBadgeClass(7), "age-fresh");
      assert.strictEqual(getAgeBadgeClass(15), "age-recent");
      assert.strictEqual(getAgeBadgeClass(60), "age-old");
      assert.strictEqual(getAgeBadgeClass(180), "age-abandoned");
    });
  });

  suite("formatDaysOld", () => {
    test("should return 'Today' for 0 days", () => {
      assert.strictEqual(formatDaysOld(0), "Today");
    });

    test("should return '1 day' for 1 day", () => {
      assert.strictEqual(formatDaysOld(1), "1 day");
    });

    test("should return plural format for multiple days", () => {
      assert.strictEqual(formatDaysOld(2), "2 days");
      assert.strictEqual(formatDaysOld(30), "30 days");
      assert.strictEqual(formatDaysOld(100), "100 days");
    });
  });

  suite("formatDate", () => {
    test("should format date to locale string", () => {
      const date = new Date("2025-12-29");
      const formatted = formatDate(date);

      // Check that it returns a non-empty string
      assert.ok(typeof formatted === "string");
      assert.ok(formatted.length > 0);
      assert.ok(formatted.includes("2025"));
    });

    test("should handle different dates", () => {
      const date1 = new Date("2024-01-15");
      const formatted1 = formatDate(date1);

      assert.ok(typeof formatted1 === "string");
      assert.ok(formatted1.length > 0);
      assert.ok(formatted1.includes("2024"));
    });
  });
});
