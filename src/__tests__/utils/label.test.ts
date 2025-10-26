import * as assert from "node:assert";

import { countLabels, extractLabelsFromText, getLabelColor, getLabelIconSvg } from "@/utils/label";
import type { TodoHit } from "@/types/todo";

suite("utils/label", () => {
  suite("extractLabelsFromText", () => {
    test("should extract single label from text", () => {
      const result = extractLabelsFromText("@TODO Fix bug [bug]");

      assert.deepStrictEqual(result, ["bug"]);
    });

    test("should extract multiple labels from text", () => {
      const result = extractLabelsFromText("@TODO Refactor [refactor,cleanup]");

      assert.deepStrictEqual(result, ["refactor", "cleanup"]);
    });

    test("should trim whitespace from labels", () => {
      const result = extractLabelsFromText("@TODO Fix [bug, urgent, security]");

      assert.deepStrictEqual(result, ["bug", "urgent", "security"]);
    });

    test("should return undefined when no labels are present", () => {
      const result = extractLabelsFromText("@TODO Simple task");

      assert.strictEqual(result, undefined);
    });

    test("should return undefined for empty label brackets", () => {
      const result = extractLabelsFromText("@TODO Task []");

      assert.strictEqual(result, undefined);
    });

    test("should filter out empty labels", () => {
      const result = extractLabelsFromText("@TODO Task [bug,,cleanup]");

      assert.deepStrictEqual(result, ["bug", "cleanup"]);
    });
  });

  suite("countLabels", () => {
    test("should count labels across multiple todos", () => {
      const hits: TodoHit[] = [
        { id: "1", file: "a.ts", line: 1, text: "@TODO Fix [bug]" },
        { id: "2", file: "b.ts", line: 2, text: "@TODO Feature [feature]" },
        { id: "3", file: "c.ts", line: 3, text: "@TODO Fix [bug]" },
      ];

      const result = countLabels(hits);

      assert.strictEqual(result.get("bug"), 2);
      assert.strictEqual(result.get("feature"), 1);
    });

    test("should handle todos without labels", () => {
      const hits: TodoHit[] = [
        { id: "1", file: "a.ts", line: 1, text: "@TODO Fix [bug]" },
        { id: "2", file: "b.ts", line: 2, text: "@TODO Simple task" },
      ];

      const result = countLabels(hits);

      assert.strictEqual(result.get("bug"), 1);
      assert.strictEqual(result.size, 1);
    });

    test("should handle multiple labels in single todo", () => {
      const hits: TodoHit[] = [
        {
          id: "1",
          file: "a.ts",
          line: 1,
          text: "@TODO Fix [bug,urgent,security]",
        },
      ];

      const result = countLabels(hits);

      assert.strictEqual(result.get("bug"), 1);
      assert.strictEqual(result.get("urgent"), 1);
      assert.strictEqual(result.get("security"), 1);
    });

    test("should return empty map for empty hits array", () => {
      const result = countLabels([]);

      assert.strictEqual(result.size, 0);
    });
  });

  suite("getLabelIconSvg", () => {
    test("should return specific icon for bug label", () => {
      const icon = getLabelIconSvg("bug");

      assert.ok(typeof icon === "string");
      assert.ok(icon.length > 0);
    });

    test("should return specific icon for feature label", () => {
      const icon = getLabelIconSvg("feature");

      assert.ok(typeof icon === "string");
      assert.ok(icon.length > 0);
    });

    test("should be case-insensitive", () => {
      const lowerIcon = getLabelIconSvg("bug");
      const upperIcon = getLabelIconSvg("BUG");

      assert.strictEqual(lowerIcon, upperIcon);
    });

    test("should return default icon for unknown label", () => {
      const icon = getLabelIconSvg("unknown-label");

      assert.ok(typeof icon === "string");
      assert.ok(icon.length > 0);
    });

    test("should return icon for all common labels", () => {
      const commonLabels = ["bug", "feature", "refactor", "cleanup", "docs", "test", "security", "performance"];

      for (const label of commonLabels) {
        const icon = getLabelIconSvg(label);
        assert.ok(typeof icon === "string" && icon.length > 0);
      }
    });
  });

  suite("getLabelColor", () => {
    test("should return color object with background and text", () => {
      const color = getLabelColor("bug");

      assert.ok(typeof color.background === "string");
      assert.ok(typeof color.text === "string");
      assert.ok(color.background.startsWith("#"));
      assert.ok(color.text.startsWith("#"));
    });

    test("should return red color for bug label", () => {
      const color = getLabelColor("bug");

      assert.strictEqual(color.background, "#DC2626");
      assert.strictEqual(color.text, "#FFFFFF");
    });

    test("should return green color for feature label", () => {
      const color = getLabelColor("feature");

      assert.strictEqual(color.background, "#10B981");
      assert.strictEqual(color.text, "#FFFFFF");
    });

    test("should be case-insensitive", () => {
      const lowerColor = getLabelColor("bug");
      const upperColor = getLabelColor("BUG");

      assert.deepStrictEqual(lowerColor, upperColor);
    });

    test("should return default color for unknown label", () => {
      const color = getLabelColor("unknown-label");

      assert.strictEqual(color.background, "#6B7280");
      assert.strictEqual(color.text, "#FFFFFF");
    });

    test("should return colors for all common labels", () => {
      const commonLabels = ["bug", "feature", "refactor", "cleanup", "docs", "test", "security"];

      for (const label of commonLabels) {
        const color = getLabelColor(label);
        assert.ok(typeof color.background === "string");
        assert.ok(typeof color.text === "string");
      }
    });
  });
});
