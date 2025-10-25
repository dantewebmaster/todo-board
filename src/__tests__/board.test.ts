import * as assert from "node:assert";

import { parseTodoPriority } from "@/utils/priority";

suite("board helpers", () => {
  test("parseTodoPriority returns low when metadata is missing", () => {
    const result = parseTodoPriority("@TODO Implement feature");
    assert.deepStrictEqual(result, {
      priority: "low",
      description: "Implement feature",
    });
  });

  test("parseTodoPriority extracts medium priority", () => {
    const result = parseTodoPriority("@TODO(medium) Work in progress");
    assert.deepStrictEqual(result, {
      priority: "medium",
      description: "Work in progress",
    });
  });

  test("parseTodoPriority return low if no priority is specified", () => {
    const result = parseTodoPriority("@TODO: testando sem prioridade");
    assert.deepStrictEqual(result, {
      priority: "low",
      description: "testando sem prioridade",
    });
  });

  test("parseTodoPriority ignores extra metadata tokens", () => {
    const result = parseTodoPriority("@TODO(high,owner:jane) Finalize work");
    assert.deepStrictEqual(result, {
      priority: "high",
      description: "Finalize work",
    });
  });
});
