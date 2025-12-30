import * as assert from "node:assert";
import * as vscode from "vscode";

import { clearAuthToken, getAuthToken, initializeAuth, setAuthToken } from "@/services/auth";

suite("services/auth", () => {
  let mockSecretStorage: vscode.SecretStorage;
  let storedSecrets: Map<string, string>;

  setup(() => {
    storedSecrets = new Map();

    mockSecretStorage = {
      get: async (key: string) => {
        return storedSecrets.get(key);
      },
      store: async (key: string, value: string) => {
        storedSecrets.set(key, value);
      },
      delete: async (key: string) => {
        storedSecrets.delete(key);
      },
      onDidChange: new vscode.EventEmitter<vscode.SecretStorageChangeEvent>().event,
    } as vscode.SecretStorage;
  });

  suite("initializeAuth", () => {
    test("should initialize auth with context", () => {
      const mockContext = {
        secrets: mockSecretStorage,
      } as unknown as vscode.ExtensionContext;

      assert.doesNotThrow(() => {
        initializeAuth(mockContext);
      });
    });
  });

  suite("setAuthToken and getAuthToken", () => {
    test("should store and retrieve token from secret storage", async () => {
      const mockContext = {
        secrets: mockSecretStorage,
      } as unknown as vscode.ExtensionContext;

      initializeAuth(mockContext);

      const testToken = "test-jwt-token-12345";
      await setAuthToken(testToken);

      const retrievedToken = await getAuthToken();
      assert.strictEqual(retrievedToken, testToken);
    });

    test("should return null when no token exists", async () => {
      const mockContext = {
        secrets: mockSecretStorage,
      } as unknown as vscode.ExtensionContext;

      initializeAuth(mockContext);

      const token = await getAuthToken();
      assert.strictEqual(token, null);
    });

    test("should handle empty string as null", async () => {
      const mockContext = {
        secrets: mockSecretStorage,
      } as unknown as vscode.ExtensionContext;

      initializeAuth(mockContext);

      await mockSecretStorage.store("todoBoard.jiraToken", "");
      const token = await getAuthToken();
      assert.strictEqual(token, null);
    });
  });

  suite("clearAuthToken", () => {
    test("should clear stored token", async () => {
      const mockContext = {
        secrets: mockSecretStorage,
      } as unknown as vscode.ExtensionContext;

      initializeAuth(mockContext);

      const testToken = "test-token-to-clear";
      await setAuthToken(testToken);

      let token = await getAuthToken();
      assert.strictEqual(token, testToken);

      await clearAuthToken();

      token = await getAuthToken();
      assert.strictEqual(token, null);
    });
  });
});
