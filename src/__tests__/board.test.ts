import { parseTodoStatus } from "@resources/board";
import * as assert from "node:assert";

suite("board helpers", () => {
  test("parseTodoStatus returns todo when metadata is missing", () => {
    const result = parseTodoStatus("@TODO Implement feature");
    assert.deepStrictEqual(result, {
      status: "todo",
      description: "Implement feature",
    });
  });

  test("parseTodoStatus extracts doing status", () => {
    const result = parseTodoStatus("@TODO(doing)   Work in progress ");
    assert.deepStrictEqual(result, {
      status: "doing",
      description: "Work in progress",
    });
  });

  test("parseTodoStatus allows empty description for done", () => {
    const result = parseTodoStatus("@TODO(done)");
    assert.deepStrictEqual(result, {
      status: "done",
      description: "",
    });
  });

  test("parseTodoStatus ignores extra metadata tokens", () => {
    const result = parseTodoStatus("@TODO(doing,owner:jane) Finalize work");
    assert.deepStrictEqual(result, {
      status: "doing",
      description: "Finalize work",
    });
  });
});
