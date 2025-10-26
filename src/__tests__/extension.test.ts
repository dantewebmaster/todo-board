import * as assert from "node:assert";
import * as vscode from "vscode";

suite("Extension", () => {
  test("should be present and activated", async () => {
    const extension = vscode.extensions.getExtension("undefined_publisher.todo-board");

    assert.ok(extension, "Extension should be present");

    if (!extension.isActive) {
      await extension.activate();
    }

    assert.ok(extension.isActive, "Extension should be activated");
  });

  test("should register scanTodos command", async () => {
    const extension = vscode.extensions.getExtension("undefined_publisher.todo-board");
    if (extension && !extension.isActive) {
      await extension.activate();
    }

    const commands = await vscode.commands.getCommands(true);

    assert.ok(commands.includes("todo-board.scanTodos"), "scanTodos command should be registered");
  });

  test("should register showBoard command", async () => {
    const commands = await vscode.commands.getCommands(true);

    assert.ok(commands.includes("todo-board.showBoard"), "showBoard command should be registered");
  });

  test("should register insertTodo command", async () => {
    const commands = await vscode.commands.getCommands(true);

    assert.ok(commands.includes("todo-board.insertTodo"), "insertTodo command should be registered");
  });

  test("should register filterByLabel command", async () => {
    const commands = await vscode.commands.getCommands(true);

    assert.ok(commands.includes("todo-board.filterByLabel"), "filterByLabel command should be registered");
  });

  test("should register refreshSidebar command", async () => {
    const commands = await vscode.commands.getCommands(true);

    assert.ok(commands.includes("todo-board.refreshSidebar"), "refreshSidebar command should be registered");
  });

  test("should register updateSidebar command", async () => {
    const commands = await vscode.commands.getCommands(true);

    assert.ok(commands.includes("todo-board.updateSidebar"), "updateSidebar command should be registered");
  });

  test("should execute scanTodos command without errors", async () => {
    await assert.doesNotReject(async () => {
      await vscode.commands.executeCommand("todo-board.scanTodos");
    });
  });

  test("should execute insertTodo command without errors", async () => {
    await assert.doesNotReject(async () => {
      await vscode.commands.executeCommand("todo-board.insertTodo");
    });
  });
});
