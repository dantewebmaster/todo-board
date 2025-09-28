import * as assert from "node:assert";
import * as vscode from "vscode";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Sample test", () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });

  test("scanTodos command executes", async () => {
    // Garantir que extensão está ativa
    await vscode.commands.executeCommand("todo-board.scanTodos");
    assert.ok(true, "Command executed without throwing");
  });
});
