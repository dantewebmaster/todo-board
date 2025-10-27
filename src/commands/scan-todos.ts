import * as vscode from "vscode";

import { getCurrentPanel, updateBoardContent } from "@/commands/open-board";
import { persistResults } from "@/services/persist";
import { enrichTodosWithGitInfo, scanWorkspace } from "@/services/scanner";

export async function scanTodos(): Promise<void> {
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Escaneando @TODO...",
      cancellable: true,
    },
    async (progress, token) => {
      try {
        const { hits, filesProcessed } = await scanWorkspace(progress, token);

        if (token.isCancellationRequested) {
          void vscode.window.showWarningMessage("Operação cancelada.");
          return;
        }

        // Enrich TODOs with Git information (date and age)
        progress.report({
          message: "Enriquecendo TODOs com informações do Git...",
        });
        const enrichedHits = await enrichTodosWithGitInfo(hits);

        await persistResults(enrichedHits);

        // Refresh sidebar via command (will be handled by provider)
        await vscode.commands.executeCommand("todo-board.updateSidebar");

        const panel = getCurrentPanel();
        if (panel) {
          await updateBoardContent(panel.webview);
        }

        const message =
          enrichedHits.length === 0
            ? `Nenhum @TODO encontrado | Arquivos processados: ${filesProcessed}`
            : `@TODOs encontrados: ${enrichedHits.length} em ${filesProcessed} arquivos processados`;

        void vscode.window.showInformationMessage(message);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        void vscode.window.showErrorMessage(`Erro no scan: ${message}`);
      }
    },
  );
}
