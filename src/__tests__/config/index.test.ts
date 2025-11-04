import * as assert from "node:assert";

import {
  getExcludeGlob,
  getIncludeGlob,
  getMaxTodoLines,
  getPriorityPattern,
  getSearchPatterns,
  getTargetExtensions,
  getTodoPattern,
} from "@/config";

suite("config", () => {
  suite("getTargetExtensions", () => {
    test("should return array of file extensions", () => {
      const extensions = getTargetExtensions();

      assert.ok(Array.isArray(extensions));
      assert.ok(extensions.length > 0);
    });

    test("should include common programming language extensions", () => {
      const extensions = getTargetExtensions();

      assert.ok(extensions.includes("ts"));
      assert.ok(extensions.includes("js"));
      assert.ok(extensions.includes("html"));
      assert.ok(extensions.includes("css"));
    });

    test("should include various language extensions", () => {
      const extensions = getTargetExtensions();

      assert.ok(extensions.includes("py"));
      assert.ok(extensions.includes("java"));
      assert.ok(extensions.includes("go"));
      assert.ok(extensions.includes("rs"));
    });
  });

  suite("getIncludeGlob", () => {
    test("should return glob pattern string", () => {
      const glob = getIncludeGlob();

      assert.ok(typeof glob === "string");
      assert.ok(glob.length > 0);
    });

    test("should start with glob wildcard pattern", () => {
      const glob = getIncludeGlob();

      assert.ok(glob.startsWith("**/*.{"));
    });

    test("should include file extensions", () => {
      const glob = getIncludeGlob();

      assert.ok(glob.includes("ts"));
      assert.ok(glob.includes("js"));
      assert.ok(glob.includes("html"));
    });

    test("should end with closing brace", () => {
      const glob = getIncludeGlob();

      assert.ok(glob.endsWith("}"));
    });
  });

  suite("getExcludeGlob", () => {
    test("should return glob pattern string", () => {
      const glob = getExcludeGlob();

      assert.ok(typeof glob === "string");
      assert.ok(glob.length > 0);
    });

    test("should exclude node_modules directory", () => {
      const glob = getExcludeGlob();

      assert.ok(glob.includes("**/node_modules/**"));
    });

    test("should exclude common build directories", () => {
      const glob = getExcludeGlob();

      assert.ok(glob.includes("**/dist/**"));
      assert.ok(glob.includes("**/out/**"));
      assert.ok(glob.includes("**/build/**"));
    });

    test("should exclude version control directories", () => {
      const glob = getExcludeGlob();

      assert.ok(glob.includes("**/.git/**"));
      assert.ok(glob.includes("**/.svn/**"));
    });

    test("should exclude coverage directory", () => {
      const glob = getExcludeGlob();

      assert.ok(glob.includes("**/coverage/**"));
    });
  });

  suite("getMaxTodoLines", () => {
    test("should return a number", () => {
      const maxLines = getMaxTodoLines();

      assert.ok(typeof maxLines === "number");
    });

    test("should return a positive number", () => {
      const maxLines = getMaxTodoLines();

      assert.ok(maxLines > 0);
    });

    test("should have default value of 4", () => {
      const maxLines = getMaxTodoLines();

      assert.strictEqual(maxLines, 4);
    });
  });

  suite("getSearchPatterns", () => {
    test("should return array of search patterns", () => {
      const patterns = getSearchPatterns();

      assert.ok(Array.isArray(patterns));
      assert.ok(patterns.length > 0);
    });

    test("should have default pattern of @TODO", () => {
      const patterns = getSearchPatterns();

      assert.ok(patterns.includes("@TODO"));
    });

    test("should return only non-empty strings", () => {
      const patterns = getSearchPatterns();

      for (const pattern of patterns) {
        assert.ok(typeof pattern === "string");
        assert.ok(pattern.trim().length > 0);
      }
    });
  });

  suite("getTodoPattern", () => {
    test("should return a RegExp", () => {
      const pattern = getTodoPattern();

      assert.ok(pattern instanceof RegExp);
    });

    test("should match default @TODO pattern", () => {
      const pattern = getTodoPattern();

      assert.ok(pattern.test("@TODO"));
      assert.ok(pattern.test("@TODO: description"));
      assert.ok(pattern.test("@TODO(high)"));
    });
  });

  suite("getPriorityPattern", () => {
    test("should return a RegExp", () => {
      const pattern = getPriorityPattern();

      assert.ok(pattern instanceof RegExp);
    });

    test("should match priority format", () => {
      const pattern = getPriorityPattern();

      assert.ok(pattern.test("@TODO(high)"));
      assert.ok(pattern.test("@TODO(medium)"));
      assert.ok(pattern.test("@TODO(low)"));
    });
  });
});
