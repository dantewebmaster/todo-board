import * as vscode from "vscode";

import { TodoSidebarProvider } from "./providers/render-sidebar";

export function registerTodoSidebar(context: vscode.ExtensionContext): {
  disposable: vscode.Disposable;
  provider: TodoSidebarProvider;
} {
  const provider = new TodoSidebarProvider(context.extensionUri);

  const webviewView = vscode.window.registerWebviewViewProvider(
    "todoBoard",
    provider,
    {
      webviewOptions: {
        retainContextWhenHidden: true,
      },
    },
  );

  context.subscriptions.push(webviewView);

  return { disposable: webviewView, provider };
}
