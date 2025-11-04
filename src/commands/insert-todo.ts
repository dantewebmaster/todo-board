import * as vscode from "vscode";

const COMMENT_STYLES: Record<string, { prefix: string; suffix?: string }> = {
  // Slash-style comments
  javascript: { prefix: "//" },
  typescript: { prefix: "//" },
  javascriptreact: { prefix: "//" },
  typescriptreact: { prefix: "//" },
  java: { prefix: "//" },
  go: { prefix: "//" },
  rust: { prefix: "//" },
  php: { prefix: "//" },
  swift: { prefix: "//" },
  kotlin: { prefix: "//" },
  dart: { prefix: "//" },
  csharp: { prefix: "//" },
  c: { prefix: "//" },
  cpp: { prefix: "//" },

  // Vue comments
  vue: { prefix: "<!--", suffix: "-->" },

  // Hash-style comments
  python: { prefix: "#" },
  ruby: { prefix: "#" },
  yaml: { prefix: "#" },
  shell: { prefix: "#" },
  bash: { prefix: "#" },

  // HTML-style comments
  html: { prefix: "<!--", suffix: "-->" },
  xml: { prefix: "<!--", suffix: "-->" },
  markdown: { prefix: "<!--", suffix: "-->" },

  // CSS-style comments
  css: { prefix: "/*", suffix: "*/" },
  scss: { prefix: "/*", suffix: "*/" },
  sass: { prefix: "/*", suffix: "*/" },
  less: { prefix: "/*", suffix: "*/" },
};

function getCommentStyle(languageId: string): {
  prefix: string;
  suffix?: string;
} {
  return COMMENT_STYLES[languageId] || { prefix: "//" };
}

function buildTodoComment(style: { prefix: string; suffix?: string }): string {
  if (style.suffix) {
    return `${style.prefix} @TODO(\${1|low,medium,high|}): \${2:description} [\${3|refactor,optimization,cleanup,security,lint|}] ${style.suffix}`;
  }

  return `${style.prefix} @TODO(\${1|low,medium,high|}): \${2:description} [\${3|refactor,optimization,cleanup,security,lint|}]`;
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
