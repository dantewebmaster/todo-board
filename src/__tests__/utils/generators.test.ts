import * as assert from "node:assert";

import { generateNonce, generateTodoId } from "@/utils/generators";

suite("utils/generators", () => {
  suite("generateTodoId", () => {
    test("should generate deterministic and stable IDs", () => {
      const firstId = generateTodoId("/a/b/file.ts", 10, "@TODO something");
      const secondId = generateTodoId("/a/b/file.ts", 10, "@TODO something");

      assert.strictEqual(firstId, secondId);
    });

    test("should generate different IDs for different lines", () => {
      const firstId = generateTodoId("/a/b/file.ts", 10, "@TODO something");
      const secondId = generateTodoId("/a/b/file.ts", 11, "@TODO something");

      assert.notStrictEqual(firstId, secondId);
    });

    test("should generate different IDs for different files", () => {
      const firstId = generateTodoId("/a/b/file.ts", 10, "@TODO something");
      const secondId = generateTodoId("/a/c/file.ts", 10, "@TODO something");

      assert.notStrictEqual(firstId, secondId);
    });

    test("should generate different IDs for different text", () => {
      const firstId = generateTodoId("/a/b/file.ts", 10, "@TODO first");
      const secondId = generateTodoId("/a/b/file.ts", 10, "@TODO second");

      assert.notStrictEqual(firstId, secondId);
    });

    test("should trim text before generating ID", () => {
      const firstId = generateTodoId("/a/b/file.ts", 10, "@TODO x");
      const secondId = generateTodoId("/a/b/file.ts", 10, "@TODO x  ");

      assert.strictEqual(firstId, secondId);
    });

    test("should generate 16-character hex string", () => {
      const todoId = generateTodoId("/a/b/file.ts", 10, "@TODO test");

      assert.strictEqual(todoId.length, 16);
      assert.ok(/^[a-f0-9]{16}$/.test(todoId));
    });
  });

  suite("generateNonce", () => {
    test("should generate 32-character string", () => {
      const nonce = generateNonce();

      assert.strictEqual(nonce.length, 32);
    });

    test("should generate different nonces on each call", () => {
      const firstNonce = generateNonce();
      const secondNonce = generateNonce();

      assert.notStrictEqual(firstNonce, secondNonce);
    });

    test("should only contain alphanumeric characters", () => {
      const nonce = generateNonce();

      assert.ok(/^[A-Za-z0-9]{32}$/.test(nonce));
    });

    test("should generate unique nonces in multiple calls", () => {
      const nonces = new Set<string>();
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        nonces.add(generateNonce());
      }

      assert.strictEqual(nonces.size, iterations);
    });
  });
});
