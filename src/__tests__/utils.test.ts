import * as assert from "node:assert";

import { REGEX } from "@/constants/regex";
import { extractCommentContent, isLineComment, isTodoLine, sanitizeTodoExtract, stripBlockLinePrefix } from "@/utils";

suite("utils helpers", () => {
  test("sanitizeTodoExtract removes escapes and endings", () => {
    assert.strictEqual(sanitizeTodoExtract("\n  text\n"), "text");
    assert.strictEqual(sanitizeTodoExtract('abc\\"def'), 'abc"def');
    assert.strictEqual(sanitizeTodoExtract("line */"), "line");
    assert.strictEqual(sanitizeTodoExtract("line -->"), "line");
    assert.strictEqual(sanitizeTodoExtract('end""'), 'end"');
  });

  test("line comment helpers", () => {
    assert.ok(isLineComment("// c"));
    assert.ok(isLineComment("   # c"));
    assert.strictEqual(extractCommentContent("// hello"), "hello");
    assert.strictEqual(extractCommentContent("# hello"), "hello");
  });

  test("isTodoLine uses pattern", () => {
    assert.ok(isTodoLine("// @TODO something", REGEX.TODO_PATTERN));
    assert.ok(!isTodoLine("// TODO something", REGEX.TODO_PATTERN));
  });

  test("stripBlockLinePrefix trims leading * and spaces", () => {
    assert.strictEqual(stripBlockLinePrefix("   * hello"), "hello");
    assert.strictEqual(stripBlockLinePrefix("  /** hello"), "hello");
  });
});
