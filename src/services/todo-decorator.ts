import * as vscode from "vscode";

import { getMaxTodoLines, getSearchPatterns, getTodoPattern } from "@/config";
import type { TodoPriority } from "@/types/todo";

/**
 * TODO Comment Decorator
 *
 * Highlights TODO comments in the editor based on priority:
 * - High priority: Red background
 * - Medium priority: Orange background
 * - Low/No priority: Blue background
 */

let highPriorityDecorationType: vscode.TextEditorDecorationType;
let mediumPriorityDecorationType: vscode.TextEditorDecorationType;
let lowPriorityDecorationType: vscode.TextEditorDecorationType;

let isEnabled = true;

/**
 * Initialize decoration types with colors from settings
 */
function createDecorationTypes(): void {
  const config = vscode.workspace.getConfiguration("todo-board");

  const highColor = config.get<string>(
    "highlight.highPriorityColor",
    "#e74c3c",
  );
  const mediumColor = config.get<string>(
    "highlight.mediumPriorityColor",
    "#ffa94d",
  );
  const lowColor = config.get<string>("highlight.lowPriorityColor", "#4dabf7");

  highPriorityDecorationType = vscode.window.createTextEditorDecorationType({
    color: highColor,
    overviewRulerColor: highColor,
    overviewRulerLane: vscode.OverviewRulerLane.Right,
  });

  mediumPriorityDecorationType = vscode.window.createTextEditorDecorationType({
    color: mediumColor,
    overviewRulerColor: mediumColor,
    overviewRulerLane: vscode.OverviewRulerLane.Right,
  });

  lowPriorityDecorationType = vscode.window.createTextEditorDecorationType({
    color: lowColor,
    overviewRulerColor: lowColor,
    overviewRulerLane: vscode.OverviewRulerLane.Right,
  });
}

/**
 * Decorate TODO comments in the active editor
 */
function decorateTodos(editor: vscode.TextEditor | undefined): void {
  if (!editor || !isEnabled) {
    return;
  }

  const document = editor.document;
  const text = document.getText();

  const highPriorityRanges: vscode.Range[] = [];
  const mediumPriorityRanges: vscode.Range[] = [];
  const lowPriorityRanges: vscode.Range[] = [];

  const patterns = getSearchPatterns();
  const todoPattern = getTodoPattern();
  const maxLines = getMaxTodoLines();

  // Scan each line for TODO patterns
  const lines = text.split("\n");

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const lineText = lines[lineIndex];
    const match = todoPattern.exec(lineText);

    if (!match) {
      continue;
    }

    // Check if line contains any of the configured patterns
    const hasPattern = patterns.some((pattern) =>
      lineText.toUpperCase().includes(pattern.toUpperCase()),
    );

    if (!hasPattern) {
      continue;
    }

    // Extract priority from parentheses like (high), (medium), (low)
    // Works with any configured pattern: @TODO(high), TODO(medium), FIXME(low), etc.
    const priorityMatch = lineText.match(/\((\w+)\)/);
    let priority: TodoPriority = "low";

    if (priorityMatch?.[1]) {
      const token = priorityMatch[1].toLowerCase();
      if (token === "high") {
        priority = "high";
      } else if (token === "medium") {
        priority = "medium";
      } else {
        priority = "low";
      }
    }

    // Find the start of the comment block
    const trimmedLine = lineText.trimStart();
    const leadingWhitespace = lineText.length - trimmedLine.length;

    // Check if we're inside a block comment (line starts with * but not /*)
    let startLineIndex = lineIndex;
    let commentStart = leadingWhitespace;

    if (trimmedLine.startsWith("*") && !trimmedLine.startsWith("/*")) {
      // Look backwards for the opening /*
      for (let i = lineIndex - 1; i >= 0; i--) {
        const prevLine = lines[i];
        const prevTrimmed = prevLine.trimStart();

        if (prevTrimmed.startsWith("/*")) {
          startLineIndex = i;
          commentStart = prevLine.length - prevTrimmed.length;
          break;
        }

        // Stop if we hit a line that doesn't look like a comment
        if (!prevTrimmed.startsWith("*") && !prevTrimmed.startsWith("/*")) {
          break;
        }
      }
    } else if (
      trimmedLine.startsWith("//") ||
      trimmedLine.startsWith("/*") ||
      trimmedLine.startsWith("#") ||
      trimmedLine.startsWith("<!--")
    ) {
      // Already at the start of the comment
      commentStart = leadingWhitespace;
    } else {
      // Fallback to TODO position
      commentStart = lineText.indexOf(match[0]);
    }

    // Check for continuation lines (lines that follow and start with comment markers)
    let endLineIndex = lineIndex;
    const maxEndLine = Math.min(
      startLineIndex + maxLines - 1,
      lines.length - 1,
    );

    for (let i = lineIndex + 1; i <= maxEndLine; i++) {
      const nextLine = lines[i];
      const nextTrimmed = nextLine.trimStart();

      // Check if next line is a continuation (comment without TODO pattern)
      const isContinuation =
        (nextTrimmed.startsWith("//") ||
          nextTrimmed.startsWith("*") ||
          nextTrimmed.startsWith("#")) &&
        !todoPattern.test(nextLine);

      if (isContinuation) {
        endLineIndex = i;
      } else {
        break;
      }
    }

    const range = new vscode.Range(
      new vscode.Position(startLineIndex, commentStart),
      new vscode.Position(endLineIndex, lines[endLineIndex]?.length ?? 0),
    );

    switch (priority) {
      case "high":
        highPriorityRanges.push(range);
        break;
      case "medium":
        mediumPriorityRanges.push(range);
        break;
      default:
        lowPriorityRanges.push(range);
        break;
    }
  }

  editor.setDecorations(highPriorityDecorationType, highPriorityRanges);
  editor.setDecorations(mediumPriorityDecorationType, mediumPriorityRanges);
  editor.setDecorations(lowPriorityDecorationType, lowPriorityRanges);
}

/**
 * Initialize the decorator
 */
export function initializeTodoDecorator(
  context: vscode.ExtensionContext,
): void {
  const config = vscode.workspace.getConfiguration("todo-board");
  isEnabled = config.get<boolean>("highlight.enabled", true);

  if (!isEnabled) {
    return;
  }

  createDecorationTypes();

  // Decorate active editor on startup
  if (vscode.window.activeTextEditor) {
    decorateTodos(vscode.window.activeTextEditor);
  }

  // Update decorations when active editor changes
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      decorateTodos(editor);
    }),
  );

  // Update decorations when document changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (
        vscode.window.activeTextEditor &&
        event.document === vscode.window.activeTextEditor.document
      ) {
        decorateTodos(vscode.window.activeTextEditor);
      }
    }),
  );

  // Recreate decorations when configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("todo-board.highlight")) {
        const newConfig = vscode.workspace.getConfiguration("todo-board");
        const newEnabled = newConfig.get<boolean>("highlight.enabled", true);

        if (newEnabled !== isEnabled) {
          isEnabled = newEnabled;

          if (!isEnabled) {
            // Clear all decorations
            if (vscode.window.activeTextEditor) {
              vscode.window.activeTextEditor.setDecorations(
                highPriorityDecorationType,
                [],
              );
              vscode.window.activeTextEditor.setDecorations(
                mediumPriorityDecorationType,
                [],
              );
              vscode.window.activeTextEditor.setDecorations(
                lowPriorityDecorationType,
                [],
              );
            }
          }
        }

        if (isEnabled) {
          // Recreate decoration types with new colors
          disposeTodoDecorator();

          createDecorationTypes();

          if (vscode.window.activeTextEditor) {
            decorateTodos(vscode.window.activeTextEditor);
          }
        }
      }
    }),
  );
}

/**
 * Dispose decorations
 */
function disposeTodoDecorator(): void {
  highPriorityDecorationType?.dispose();
  mediumPriorityDecorationType?.dispose();
  lowPriorityDecorationType?.dispose();
}
