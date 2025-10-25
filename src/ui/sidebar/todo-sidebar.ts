import * as vscode from "vscode";

import { loadPersistedTodos } from "@/services/persist";
import { countLabels, getLabelIcon } from "@/utils/label";

class TodoTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command,
    public readonly contextValue?: string,
  ) {
    super(label, collapsibleState);
  }
}

export class TodoSidebarProvider
  implements vscode.TreeDataProvider<TodoTreeItem>
{
  private onDidChangeTreeDataEmitter: vscode.EventEmitter<
    TodoTreeItem | undefined | null
  > = new vscode.EventEmitter<TodoTreeItem | undefined | null>();

  readonly onDidChangeTreeData: vscode.Event<TodoTreeItem | undefined | null> =
    this.onDidChangeTreeDataEmitter.event;

  refresh(): void {
    this.onDidChangeTreeDataEmitter.fire(undefined);
  }

  getTreeItem(element: TodoTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: TodoTreeItem): Promise<TodoTreeItem[]> {
    if (element) {
      return [];
    }

    const hits = await loadPersistedTodos();
    const todoCount = hits.length;

    const openBoardItem = new TodoTreeItem(
      "Open TODO Board",
      vscode.TreeItemCollapsibleState.None,
      {
        command: "todo-board.showBoard",
        title: "Open TODO Board",
      },
      "action",
    );
    openBoardItem.iconPath = new vscode.ThemeIcon("list-tree");

    const scanItem = new TodoTreeItem(
      "Scan TODOs",
      vscode.TreeItemCollapsibleState.None,
      {
        command: "todo-board.scanTodos",
        title: "Scan TODOs",
      },
      "action",
    );
    scanItem.iconPath = new vscode.ThemeIcon("search");

    const items: TodoTreeItem[] = [openBoardItem, scanItem];

    const separatorItem = new TodoTreeItem(
      "─────────────────────",
      vscode.TreeItemCollapsibleState.None,
      undefined,
      "separator",
    );
    separatorItem.iconPath = new vscode.ThemeIcon("window");
    items.push(separatorItem);

    const countItem = new TodoTreeItem(
      `Total: ${todoCount} TODO${todoCount !== 1 ? "s" : ""}`,
      vscode.TreeItemCollapsibleState.None,
      undefined,
      "count",
    );
    countItem.iconPath = new vscode.ThemeIcon("symbol-number");
    countItem.tooltip = `Total number of TODOs found`;
    items.push(countItem);

    const labelCounts = countLabels(hits);

    if (labelCounts.size > 0) {
      const sortedLabels = Array.from(labelCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([label, count]) => {
          const item = new TodoTreeItem(
            `${label}: ${count}`,
            vscode.TreeItemCollapsibleState.None,
            undefined,
            "labelCount",
          );
          item.iconPath = new vscode.ThemeIcon(getLabelIcon(label));
          item.tooltip = `${count} TODO${count !== 1 ? "s" : ""} with label "${label}"`;
          return item;
        });

      items.push(...sortedLabels);
    }

    return items;
  }
}

export function registerTodoSidebar(
  context: vscode.ExtensionContext,
): vscode.Disposable {
  const todoSidebarProvider = new TodoSidebarProvider();

  const treeView = vscode.window.createTreeView("todoBoard", {
    treeDataProvider: todoSidebarProvider,
  });

  treeView.onDidChangeVisibility((event) => {
    if (event.visible) {
      void vscode.commands.executeCommand("todo-board.showBoard");
    }
  });

  const refreshCommand = vscode.commands.registerCommand(
    "todo-board.refreshSidebar",
    () => {
      todoSidebarProvider.refresh();
    },
  );

  context.subscriptions.push(treeView, refreshCommand);

  return treeView;
}
