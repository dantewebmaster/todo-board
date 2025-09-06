import * as vscode from "vscode";
import { persistResults } from "./persist";
import { scanWorkspace } from "./scanner";

let output: vscode.OutputChannel | undefined;

export async function scanTodos(): Promise<void> {
  output ??= vscode.window.createOutputChannel("TODO Board");
  output.clear();
  output.appendLine("== Scan @TODO iniciado ==");

  const started = Date.now();

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Escaneando @TODO...",
      cancellable: true,
    },
    async (progress, token) => {
      try {
        const { hits, reused, scanned } = await scanWorkspace(progress, token);

        if (!output) {
          return;
        }

        if (token.isCancellationRequested) {
          output.appendLine("Operação cancelada.");
          return;
        }

        await persistResults(hits);

        if (hits.length === 0) {
          output.appendLine("Nenhum @TODO encontrado.");
        } else {
          for (const r of hits) {
            output.appendLine(`${r.file}:${r.line + 1}: ${r.text}`);
          }

          output.appendLine(`-- Total: ${hits.length}`);
          output.appendLine("Arquivo salvo: .todo-board/todos.json");
          output.appendLine(
            `Cache: reutilizados ${reused}, reprocessados ${scanned}`,
          );
        }
      } catch (err) {
        if (output) {
          const message = err instanceof Error ? err.message : String(err);
          output.appendLine(`Erro: ${message}`);
        }
      }
    },
  );

  const elapsedSec = ((Date.now() - started) / 1000).toFixed(2);

  output.appendLine(`== Fim (${elapsedSec}s) ==`);
  output.show(true);
}
