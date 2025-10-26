import * as assert from "node:assert";

import { REGEX } from "@/constants/regex";

suite("constants/regex", () => {
  suite("TODO_PATTERN", () => {
    test("should match basic @TODO", () => {
      assert.ok(REGEX.TODO_PATTERN.test("@TODO"));
    });

    test("should match @TODO with metadata", () => {
      assert.ok(REGEX.TODO_PATTERN.test("@TODO(high)"));
      assert.ok(REGEX.TODO_PATTERN.test("@TODO(medium,owner:john)"));
    });

    test("should match @TODO in line comments", () => {
      assert.ok(REGEX.TODO_PATTERN.test("// @TODO implement feature"));
      assert.ok(REGEX.TODO_PATTERN.test("# @TODO refactor code"));
    });

    test("should not match TODO without @ symbol", () => {
      assert.ok(!REGEX.TODO_PATTERN.test("TODO: fix bug"));
      assert.ok(!REGEX.TODO_PATTERN.test("// TODO implement"));
    });
  });

  suite("LABEL_PATTERN", () => {
    test("should match labels in brackets", () => {
      const match = "@TODO Fix [bug]".match(REGEX.LABEL_PATTERN);

      assert.ok(match);
      assert.strictEqual(match[1], "bug");
    });

    test("should match multiple labels", () => {
      const match = "@TODO Fix [bug,urgent,security]".match(REGEX.LABEL_PATTERN);

      assert.ok(match);
      assert.strictEqual(match[1], "bug,urgent,security");
    });

    test("should not match when no brackets", () => {
      const match = "@TODO Simple task".match(REGEX.LABEL_PATTERN);

      assert.strictEqual(match, null);
    });
  });

  suite("PRIORITY_REGEX", () => {
    test("should match @TODO with priority", () => {
      const match = REGEX.PRIORITY_REGEX.exec("@TODO(high) Critical fix");

      assert.ok(match);
      assert.strictEqual(match[1], "high");
    });

    test("should match @TODO without priority", () => {
      const match = REGEX.PRIORITY_REGEX.exec("@TODO Simple task");

      assert.ok(match);
      assert.strictEqual(match[1], undefined);
    });

    test("should be case-insensitive", () => {
      assert.ok(REGEX.PRIORITY_REGEX.test("@todo(low)"));
      assert.ok(REGEX.PRIORITY_REGEX.test("@TODO(LOW)"));
    });
  });

  suite("LINE_COMMENT_REGEX", () => {
    test("should match double-slash comments", () => {
      assert.ok(REGEX.LINE_COMMENT_REGEX.test("// comment"));
      assert.ok(REGEX.LINE_COMMENT_REGEX.test("  // indented comment"));
    });

    test("should match hash comments", () => {
      assert.ok(REGEX.LINE_COMMENT_REGEX.test("# comment"));
      assert.ok(REGEX.LINE_COMMENT_REGEX.test("  # indented comment"));
    });

    test("should not match regular code", () => {
      assert.ok(!REGEX.LINE_COMMENT_REGEX.test("const x = 1"));
    });
  });

  suite("LINE_COMMENT_PREFIX_REGEX", () => {
    test("should remove comment prefix from double-slash", () => {
      const result = "// hello world".replace(REGEX.LINE_COMMENT_PREFIX_REGEX, "");

      assert.strictEqual(result.trim(), "hello world");
    });

    test("should remove comment prefix from hash", () => {
      const result = "# hello world".replace(REGEX.LINE_COMMENT_PREFIX_REGEX, "");

      assert.strictEqual(result.trim(), "hello world");
    });

    test("should handle indented comments", () => {
      const result = "  // indented".replace(REGEX.LINE_COMMENT_PREFIX_REGEX, "");

      assert.strictEqual(result.trim(), "indented");
    });
  });

  suite("BLOCK_COMMENT constants", () => {
    test("should have correct block comment markers", () => {
      assert.strictEqual(REGEX.BLOCK_COMMENT_START, "/*");
      assert.strictEqual(REGEX.BLOCK_COMMENT_END, "*/");
    });
  });

  suite("HTML_COMMENT constants", () => {
    test("should have correct HTML comment markers", () => {
      assert.strictEqual(REGEX.HTML_COMMENT_START, "<!--");
      assert.strictEqual(REGEX.HTML_COMMENT_END, "-->");
    });
  });

  suite("BLOCK_CONTENT_LINE_REGEX", () => {
    test("should match block comment continuation lines", () => {
      assert.ok(REGEX.BLOCK_CONTENT_LINE_REGEX.test(" * content"));
      assert.ok(REGEX.BLOCK_CONTENT_LINE_REGEX.test("  * content"));
    });

    test("should match block comment start", () => {
      assert.ok(REGEX.BLOCK_CONTENT_LINE_REGEX.test("/*"));
    });
  });

  suite("LINE_BREAK_REGEX", () => {
    test("should match Unix line breaks", () => {
      const text = "line1\nline2";
      const matches = text.match(REGEX.LINE_BREAK_REGEX);

      assert.ok(matches);
      assert.strictEqual(matches.length, 1);
    });

    test("should match Windows line breaks", () => {
      const text = "line1\r\nline2";
      const matches = text.match(REGEX.LINE_BREAK_REGEX);

      assert.ok(matches);
      assert.strictEqual(matches.length, 1);
    });

    test("should match multiple line breaks", () => {
      const text = "line1\nline2\nline3";
      const matches = text.match(REGEX.LINE_BREAK_REGEX);

      assert.ok(matches);
      assert.strictEqual(matches.length, 2);
    });
  });

  suite("LINE_BREAK_TOKEN", () => {
    test("should be newline character", () => {
      assert.strictEqual(REGEX.LINE_BREAK_TOKEN, "\n");
    });
  });

  suite("sanitization regexes", () => {
    test("ESCAPED_QUOTE_REGEX should match escaped quotes", () => {
      const result = 'text \\"quoted\\"'.replace(REGEX.ESCAPED_QUOTE_REGEX, '"');

      assert.strictEqual(result, 'text "quoted"');
    });

    test("ESCAPED_NEWLINE_REGEX should match escaped newlines", () => {
      const result = "text\\nmore".replace(REGEX.ESCAPED_NEWLINE_REGEX, " ");

      assert.strictEqual(result, "text more");
    });

    test("TRAILING_BLOCK_END_REGEX should match trailing block end", () => {
      const result = "content */".replace(REGEX.TRAILING_BLOCK_END_REGEX, "");

      assert.strictEqual(result, "content ");
    });

    test("TRAILING_HTML_END_REGEX should match trailing HTML end", () => {
      const result = "content -->".replace(REGEX.TRAILING_HTML_END_REGEX, "");

      assert.strictEqual(result, "content ");
    });

    test("DOUBLE_QUOTE_AT_END_REGEX should match double quotes at end", () => {
      const result = 'text""'.replace(REGEX.DOUBLE_QUOTE_AT_END_REGEX, '"');

      assert.strictEqual(result, 'text"');
    });
  });
});
