import * as assert from "node:assert";
import { parseTodoStatus } from "../board";

describe("parseTodoStatus", () => {
  it("returns todo when no metadata is provided", () => {
    const result = parseTodoStatus("@TODO Implement feature");
    assert.deepStrictEqual(result, {
      status: "todo",
      description: "Implement feature",
    });
  });

  it("parses doing status and trims description", () => {
    const result = parseTodoStatus("@TODO(doing)   Work in progress ");
    assert.deepStrictEqual(result, {
      status: "doing",
      description: "Work in progress",
    });
  });

  it("parses done status and allows empty description", () => {
    const result = parseTodoStatus("@TODO(done)");
    assert.deepStrictEqual(result, {
      status: "done",
      description: "",
    });
  });

  it("ignores additional metadata sections", () => {
    const result = parseTodoStatus("@TODO(doing,owner:jane) Finalize work");
    assert.deepStrictEqual(result, {
      status: "doing",
      description: "Finalize work",
    });
  });
});
