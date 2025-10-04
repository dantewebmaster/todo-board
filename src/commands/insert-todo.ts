import * as vscode from "vscode";

const COMMENT_STYLES: Record<
  string,
  { start: string; middle?: string; end?: string }
> = {
  // Single-line comments
  javascript: { start: "//" },
  typescript: { start: "//" },
  javascriptreact: { start: "//" },
  typescriptreact: { start: "//" },
  java: { start: "//" },
  go: { start: "//" },
  rust: { start: "//" },
  php: { start: "//" },
  swift: { start: "//" },
  kotlin: { start: "//" },
  dart: { start: "//" },
  csharp: { start: "//" },
  vue: { start: "//" },

  // Hash-style comments
  python: { start: "#" },
  ruby: { start: "#" },
  yaml: { start: "#" },
  shell: { start: "#" },

  // Block comments
  html: { start: "<!--", end: "-->" },
  xml: { start: "<!--", end: "-->" },
  markdown: { start: "<!--", end: "-->" },
  css: { start: "/*", middle: " *", end: " */" },
  scss: { start: "/*", middle: " *", end: " */" },
  sass: { start: "/*", middle: " *", end: " */" },
  less: { start: "/*", middle: " *", end: " */" },
};

function getCommentStyle(languageId: string) {
  return COMMENT_STYLES[languageId] || { start: "//" };
}

function buildTodoComment(style: {
  start: string;
  middle?: string;
  end?: string;
}): string {
  if (style.end) {
    /**
     * Block comment style
     */
    const mid = style.middle || "";
    return `${style.start} @TODO(\${1|low,medium,high|}): \${2:description}\n${mid} Labels: [\${3|refactor,optimization,cleanup|}] ${style.end}`;
  }

  /**
   * Single-line comment style
   * ex: // @TODO(priority): description [labels]
   */
  return `${style.start} @TODO(\${1|low,medium,high|}): \${2:description} [\${3|refactor,optimization,cleanup|}]`;
}

export async function insertTodoComment() {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showErrorMessage("No active editor found");
    return;
  }

  const languageId = editor.document.languageId;
  const commentStyle = getCommentStyle(languageId);
  const snippetText = buildTodoComment(commentStyle);

  const snippet = new vscode.SnippetString(snippetText);
  await editor.insertSnippet(snippet);
}
