import { generateTodoId } from "@utils/generators.util";
import * as assert from "node:assert";

suite("id generation", () => {
  test("deterministic and stable", () => {
    const a1 = generateTodoId("/a/b/file.ts", 10, "@TODO something");
    const a2 = generateTodoId("/a/b/file.ts", 10, "@TODO something");
    assert.strictEqual(a1, a2);
  });

  test("different line changes id", () => {
    const a1 = generateTodoId("/a/b/file.ts", 10, "@TODO something");
    const a2 = generateTodoId("/a/b/file.ts", 11, "@TODO something");
    assert.notStrictEqual(a1, a2);
  });

  test("text normalization trims affect id", () => {
    const a1 = generateTodoId("/a/b/file.ts", 10, "@TODO x");
    const a2 = generateTodoId("/a/b/file.ts", 10, "@TODO x  ");
    assert.strictEqual(a1, a2);
  });
});
