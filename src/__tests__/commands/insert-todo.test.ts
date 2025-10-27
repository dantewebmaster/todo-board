import * as assert from "node:assert";
import * as vscode from "vscode";

import { insertTodoComment } from "@/commands/insert-todo";

suite("commands/insert-todo", () => {
  test("should show error when no active editor", async () => {
    const initialEditor = vscode.window.activeTextEditor;

    if (!initialEditor) {
      const errorShown = new Promise<void>((resolve) => {
        const originalShowError = vscode.window.showErrorMessage;
        vscode.window.showErrorMessage = async (message: string) => {
          assert.ok(message.includes("No active editor"));
          vscode.window.showErrorMessage = originalShowError;
          resolve();
          return undefined;
        };
      });

      await insertTodoComment();
      await errorShown;
    }
  });

  test("should insert snippet in active editor", async function () {
    this.timeout(5000);

    const document = await vscode.workspace.openTextDocument({
      language: "typescript",
      content: "",
    });

    const editor = await vscode.window.showTextDocument(document);

    try {
      await insertTodoComment();

      await new Promise((resolve) => setTimeout(resolve, 500));

      const text = editor.document.getText();
      assert.ok(text.includes("@TODO"));
    } finally {
      await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
    }
  });

  test("should use appropriate comment style for TypeScript", async function () {
    this.timeout(5000);

    const document = await vscode.workspace.openTextDocument({
      language: "typescript",
      content: "",
    });

    const editor = await vscode.window.showTextDocument(document);

    try {
      await insertTodoComment();

      await new Promise((resolve) => setTimeout(resolve, 500));

      const text = editor.document.getText();
      assert.ok(text.includes("//"));
    } finally {
      await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
    }
  });

  test("should use hash comment style for Python", async function () {
    this.timeout(5000);

    const document = await vscode.workspace.openTextDocument({
      language: "python",
      content: "",
    });

    const editor = await vscode.window.showTextDocument(document);

    try {
      await insertTodoComment();

      await new Promise((resolve) => setTimeout(resolve, 500));

      const text = editor.document.getText();
      assert.ok(text.includes("#"));
    } finally {
      await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
    }
  });

  test("should use block comment style for HTML", async function () {
    this.timeout(5000);

    const document = await vscode.workspace.openTextDocument({
      language: "html",
      content: "",
    });

    const editor = await vscode.window.showTextDocument(document);

    try {
      await insertTodoComment();

      await new Promise((resolve) => setTimeout(resolve, 500));

      const text = editor.document.getText();
      assert.ok(text.includes("<!--"));
      assert.ok(text.includes("-->"));
    } finally {
      await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
    }
  });
});
