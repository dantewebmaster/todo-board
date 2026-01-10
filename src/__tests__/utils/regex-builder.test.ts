import { strict as assert } from "assert";

import {
  buildPriorityPattern,
  buildTodoPattern,
  findFirstPatternIndex,
  validateSearchPatterns,
} from "@/utils/regex-builder";

suite("regex-builder", () => {
  suite("buildTodoPattern", () => {
    test("should build pattern with single search term", () => {
      const pattern = buildTodoPattern(["@TODO"]);
      assert(pattern.test("@TODO"));
      assert(pattern.test("@TODO(high)"));
      assert(!pattern.test("FIXME"));
    });

    test("should build pattern with multiple search terms", () => {
      const pattern = buildTodoPattern(["@TODO", "FIXME", "BUG"]);
      assert(pattern.test("@TODO"));
      assert(pattern.test("FIXME"));
      assert(pattern.test("BUG"));
      assert(pattern.test("@TODO(high)"));
      assert(pattern.test("FIXME(medium)"));
    });

    test("should handle special regex characters", () => {
      const pattern = buildTodoPattern(["@TODO", "[URGENT]"]);
      assert(pattern.test("@TODO"));
      assert(pattern.test("[URGENT]"));
      assert(!pattern.test("URGENT]")); // should not match partial
    });

    test("should use fallback pattern for empty array", () => {
      const pattern = buildTodoPattern([]);
      assert(pattern.test("@TODO"));
      assert(pattern.test("@TODO(high)"));
    });

    test("should support patterns without @ symbol", () => {
      const pattern = buildTodoPattern(["TODO", "FIXME"]);
      assert(pattern.test("TODO"));
      assert(pattern.test("TODO(high)"));
      assert(pattern.test("FIXME"));
    });

    test("should allow optional priority in parentheses", () => {
      const pattern = buildTodoPattern(["@TODO"]);
      assert(pattern.test("@TODO: description"));
      assert(pattern.test("@TODO(high): description"));
      assert(pattern.test("@TODO(medium): description"));
      assert(pattern.test("@TODO(low): description"));
    });
  });

  suite("buildPriorityPattern", () => {
    test("should build priority pattern with single term", () => {
      const pattern = buildPriorityPattern(["@TODO"]);
      const match = "@TODO(high)".match(pattern);
      assert(match && match[1] === "@TODO");
      assert(match && match[2] === "high");
    });

    test("should build priority pattern with multiple terms", () => {
      const pattern = buildPriorityPattern(["@TODO", "FIXME"]);
      const match1 = "@TODO(medium)".match(pattern);
      assert(match1 && match1[1] === "@TODO");

      const match2 = "FIXME(high)".match(pattern);
      assert(match2 && match2[1] === "FIXME");
    });

    test("should be case-insensitive", () => {
      const pattern = buildPriorityPattern(["@TODO"]);
      const match1 = "@todo(high)".match(pattern);
      assert(match1);

      const match2 = "@TODO(HIGH)".match(pattern);
      assert(match2);
    });

    test("should handle pattern without priority", () => {
      const pattern = buildPriorityPattern(["@TODO"]);
      const match = "@TODO".match(pattern);
      assert(match && match[1] === "@TODO");
      assert(match && match[2] === undefined);
    });

    test("should use fallback pattern for empty array", () => {
      const pattern = buildPriorityPattern([]);
      const match = "@TODO(high)".match(pattern);
      assert(match && match[1] === "@TODO");
    });
  });

  suite("validateSearchPatterns", () => {
    test("should filter out empty strings", () => {
      const result = validateSearchPatterns(["@TODO", "", "FIXME", "  "]);
      assert.deepStrictEqual(result, ["@TODO", "FIXME"]);
    });

    test("should preserve valid patterns", () => {
      const patterns = ["@TODO", "FIXME", "BUG"];
      const result = validateSearchPatterns(patterns);
      assert.deepStrictEqual(result, patterns);
    });

    test("should handle empty array", () => {
      const result = validateSearchPatterns([]);
      assert.deepStrictEqual(result, []);
    });

    test("should filter out only empty strings", () => {
      const patterns = ["@TODO", "", "FIXME", "  ", "BUG"];
      const result = validateSearchPatterns(patterns);
      assert.deepStrictEqual(result, ["@TODO", "FIXME", "BUG"]);
    });
  });

  suite("findFirstPatternIndex", () => {
    test("should find first pattern in text", () => {
      const index = findFirstPatternIndex("// @TODO: description", ["@TODO"]);
      assert.strictEqual(index, 3);
    });

    test("should find closest pattern when multiple exist", () => {
      const index = findFirstPatternIndex("FIXME and @TODO", ["@TODO", "FIXME"]);
      assert.strictEqual(index, 0); // FIXME comes first
    });

    test("should return -1 when pattern not found", () => {
      const index = findFirstPatternIndex("// comment without todo", ["@TODO"]);
      assert.strictEqual(index, -1);
    });

    test("should handle multiple search patterns", () => {
      const index = findFirstPatternIndex("// @TODO and FIXME", ["@TODO", "FIXME", "BUG"]);
      assert.strictEqual(index, 3); // @TODO comes first
    });

    test("should be case-sensitive", () => {
      const index = findFirstPatternIndex("// todo: description", ["@TODO"]);
      assert.strictEqual(index, -1); // should not match lowercase
    });

    test("should use TODO fallback for empty patterns array", () => {
      const index = findFirstPatternIndex("// @TODO: description", []);
      assert.strictEqual(index, 4);
    });

    test("should handle patterns with special characters", () => {
      const index = findFirstPatternIndex("// [URGENT] fix this", ["[URGENT]", "@TODO"]);
      assert.strictEqual(index, 3); // [URGENT] comes first
    });
  });
});
