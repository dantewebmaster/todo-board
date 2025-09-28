import * as vscode from "vscode";

import { persistResults } from "@/services/persist";
import { scanWorkspace } from "@/services/scanner";

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

        // Não abrir o output; vamos notificar o usuário com os totais

        if (token.isCancellationRequested) {
          void vscode.window.showWarningMessage("Operação cancelada.");
          return;
        }

        await persistResults(hits);

        const message =
          hits.length === 0
            ? `Nenhum @TODO encontrado | Arquivos processados: ${filesProcessed}`
            : `@TODOs encontrados: ${hits.length} em ${filesProcessed} arquivos processados`;

        void vscode.window.showInformationMessage(message);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        void vscode.window.showErrorMessage(`Erro no scan: ${message}`);
      }
    },
  );
}
