import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "todo-board" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand(
		"todo-board.helloWorld",
		() => {
			vscode.window.showInformationMessage("Hello Worldzão!");
		},
	);

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
