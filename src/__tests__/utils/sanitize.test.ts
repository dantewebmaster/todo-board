import * as assert from "node:assert";

import { escapeAttribute, escapeHtml, sanitizeTodoExtract } from "@/utils/sanitize";

suite("utils/sanitize", () => {
  suite("escapeHtml", () => {
    test("should escape ampersands", () => {
      const result = escapeHtml("foo & bar");

      assert.strictEqual(result, "foo &amp; bar");
    });

    test("should escape less-than symbols", () => {
      const result = escapeHtml("x < 10");

      assert.strictEqual(result, "x &lt; 10");
    });

    test("should escape greater-than symbols", () => {
      const result = escapeHtml("x > 5");

      assert.strictEqual(result, "x &gt; 5");
    });

    test("should escape double quotes", () => {
      const result = escapeHtml('say "hello"');

      assert.strictEqual(result, "say &quot;hello&quot;");
    });

    test("should escape single quotes", () => {
      const result = escapeHtml("it's working");

      assert.strictEqual(result, "it&#39;s working");
    });

    test("should escape multiple special characters", () => {
      const result = escapeHtml('<div class="test">A & B</div>');

      assert.strictEqual(result, "&lt;div class=&quot;test&quot;&gt;A &amp; B&lt;/div&gt;");
    });

    test("should return unchanged string without special characters", () => {
      const result = escapeHtml("normal text");

      assert.strictEqual(result, "normal text");
    });
  });

  suite("escapeAttribute", () => {
    test("should escape HTML special characters", () => {
      const result = escapeAttribute('<div class="test">');

      assert.strictEqual(result, "&lt;div class=&quot;test&quot;&gt;");
    });

    test("should escape backticks", () => {
      const result = escapeAttribute("code `example`");

      assert.strictEqual(result, "code &#96;example&#96;");
    });

    test("should escape both HTML and backticks", () => {
      const result = escapeAttribute('`<script>alert("xss")</script>`');

      assert.strictEqual(result, "&#96;&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;&#96;");
    });
  });

  suite("sanitizeTodoExtract", () => {
    test("should trim whitespace", () => {
      const result = sanitizeTodoExtract("  @TODO task  ");

      assert.strictEqual(result, "@TODO task");
    });

    test("should replace escaped quotes with regular quotes", () => {
      const result = sanitizeTodoExtract('@TODO Fix \\"bug\\"');

      assert.strictEqual(result, '@TODO Fix "bug"');
    });

    test("should replace escaped newlines with spaces", () => {
      const result = sanitizeTodoExtract("@TODO First line\\nSecond line");

      assert.strictEqual(result, "@TODO First line Second line");
    });

    test("should remove trailing block comment end markers", () => {
      const result = sanitizeTodoExtract("@TODO task */");

      assert.strictEqual(result, "@TODO task");
    });

    test("should remove trailing HTML comment end markers", () => {
      const result = sanitizeTodoExtract("@TODO task -->");

      assert.strictEqual(result, "@TODO task");
    });

    test("should remove double quotes at end", () => {
      const result = sanitizeTodoExtract('@TODO task""');

      assert.strictEqual(result, '@TODO task"');
    });

    test("should handle complex sanitization", () => {
      const result = sanitizeTodoExtract('  @TODO Fix \\"bug\\" in code\\nSecond line */  ');

      assert.strictEqual(result, '@TODO Fix "bug" in code Second line');
    });

    test("should handle empty string", () => {
      const result = sanitizeTodoExtract("");

      assert.strictEqual(result, "");
    });

    test("should preserve normal text without special characters", () => {
      const result = sanitizeTodoExtract("@TODO simple task");

      assert.strictEqual(result, "@TODO simple task");
    });
  });
});
