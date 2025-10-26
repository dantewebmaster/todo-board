import * as assert from "node:assert";

import { parseTodoPriority } from "@/utils/priority";

suite("utils/priority", () => {
  suite("parseTodoPriority", () => {
    test("should return low priority when metadata is missing", () => {
      const result = parseTodoPriority("@TODO Implement feature");

      assert.deepStrictEqual(result, {
        priority: "low",
        description: "@TODO Implement feature",
        labels: undefined,
      });
    });

    test("should extract medium priority from metadata", () => {
      const result = parseTodoPriority("@TODO(medium) Work in progress");

      assert.deepStrictEqual(result, {
        priority: "medium",
        description: "@TODO(medium) Work in progress",
        labels: undefined,
      });
    });

    test("should extract high priority from metadata", () => {
      const result = parseTodoPriority("@TODO(high) Critical fix needed");

      assert.deepStrictEqual(result, {
        priority: "high",
        description: "@TODO(high) Critical fix needed",
        labels: undefined,
      });
    });

    test("should return low priority when no priority is specified", () => {
      const result = parseTodoPriority("@TODO: testing without priority");

      assert.deepStrictEqual(result, {
        priority: "low",
        description: "@TODO: testing without priority",
        labels: undefined,
      });
    });

    test("should ignore extra metadata tokens", () => {
      const result = parseTodoPriority("@TODO(high,owner:jane) Finalize work");

      assert.deepStrictEqual(result, {
        priority: "high",
        description: "@TODO(high,owner:jane) Finalize work",
        labels: undefined,
      });
    });

    test("should extract labels from description", () => {
      const result = parseTodoPriority("@TODO(high) Fix bug [bug,urgent]");

      assert.deepStrictEqual(result, {
        priority: "high",
        description: "@TODO(high) Fix bug [bug,urgent]",
        labels: ["bug", "urgent"],
      });
    });

    test("should handle multiple labels with spaces", () => {
      const result = parseTodoPriority("@TODO Refactor code [refactor, cleanup, performance]");

      assert.deepStrictEqual(result, {
        priority: "low",
        description: "@TODO Refactor code [refactor, cleanup, performance]",
        labels: ["refactor", "cleanup", "performance"],
      });
    });

    test("should handle empty labels array", () => {
      const result = parseTodoPriority("@TODO Simple task []");

      assert.deepStrictEqual(result, {
        priority: "low",
        description: "@TODO Simple task []",
        labels: undefined,
      });
    });

    test("should normalize priority case-insensitively", () => {
      const resultUpper = parseTodoPriority("@TODO(HIGH) Uppercase priority");
      const resultMixed = parseTodoPriority("@TODO(MeDiUm) Mixed case");

      assert.strictEqual(resultUpper.priority, "high");
      assert.strictEqual(resultMixed.priority, "medium");
    });
  });
});
