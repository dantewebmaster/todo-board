import * as assert from "node:assert";
import { getExcludeGlob, getIncludeGlob, getTargetExtensions } from "../config";

suite("config", () => {
  test("getTargetExtensions returns defaults including ts and html", () => {
    const exts = getTargetExtensions();
    assert.ok(exts.includes("ts"));
    assert.ok(exts.includes("html"));
  });

  test("include glob includes extensions list", () => {
    const glob = getIncludeGlob();
    assert.ok(glob.startsWith("**/*.{"));
    assert.ok(glob.includes("ts"));
  });

  test("exclude glob contains .todo-board", () => {
    const glob = getExcludeGlob();
    assert.ok(glob.includes("**/.todo-board/**"));
  });
});
