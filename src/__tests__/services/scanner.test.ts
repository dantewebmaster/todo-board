import * as assert from "node:assert";

import { scanWorkspace } from "@/services/scanner";

suite("services/scanner", function () {
  this.timeout(8000);

  suite("scanWorkspace", () => {
    test("should export scanWorkspace as function", () => {
      assert.strictEqual(typeof scanWorkspace, "function");
    });
  });
});
