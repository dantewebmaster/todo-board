import * as assert from "node:assert";
import { REGEX } from "../regex";

suite("regex constants", () => {
  test("TODO_PATTERN matches variants", () => {
    assert.ok(REGEX.TODO_PATTERN.test("// @TODO"));
    assert.ok(REGEX.TODO_PATTERN.test("# @TODO(abc) some text"));
    assert.ok(!REGEX.TODO_PATTERN.test("// TODO:"));
  });

  test("line comment regexes", () => {
    assert.ok(REGEX.LINE_COMMENT_REGEX.test("// hello"));
    assert.ok(REGEX.LINE_COMMENT_REGEX.test("  # hello"));
    assert.strictEqual("hello", "// hello".replace(REGEX.LINE_COMMENT_PREFIX_REGEX, "").trim());
  });

  test("block and html markers present", () => {
    assert.strictEqual(REGEX.BLOCK_COMMENT_START, "/*");
    assert.strictEqual(REGEX.BLOCK_COMMENT_END, "*/");
    assert.strictEqual(REGEX.HTML_COMMENT_START, "<!--");
    assert.strictEqual(REGEX.HTML_COMMENT_END, "-->");
  });
});
