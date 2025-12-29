import * as vscode from "vscode";

import { getAuthToken, setAuthToken } from "@/services/auth";
import { filterState } from "@/services/filter-state";
import { loadPersistedTodos, updateTodoWithIssue } from "@/services/persist";
import { renderBoard } from "@/ui/board";
import {
  buildBoardItems,
  groupItems,
} from "@/ui/board/services/board-transformer";

let currentPanel: vscode.WebviewPanel | undefined;

// Helper para fazer requisições com refresh token automático
async function fetchWithTokenRefresh(
  url: string,
  options: any,
  retryCount = 0,
): Promise<any> {
  const fetchModule = await import("node-fetch");
  const fetch = fetchModule.default;

  const response = await fetch(url, options);

  // Verificar se há um novo token e salva atualizado
  const newToken = response.headers.get("X-New-Token");
  if (newToken) {
    await setAuthToken(newToken);
  }

  // Se retornou 401 e ainda não tentou refresh, tenta renovar o token
  if (response.status === 401 && retryCount === 0) {
    try {
      const currentToken = await getAuthToken();
      if (!currentToken) {
        return response;
      }

      // Tenta refresh do token
      const refreshResponse = await fetch(
        "https://todo-board.dantewebmaster.com.br/refresh-token",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (refreshResponse.ok) {
        const refreshData = (await refreshResponse.json()) as { token: string };
        const newToken = refreshData.token;

        // Atualiza o token armazenado
        await setAuthToken(newToken);

        // Atualiza o header da requisição original com o novo token
        options.headers.Authorization = `Bearer ${newToken}`;

        // Retenta a requisição original
        return fetchWithTokenRefresh(url, options, retryCount + 1);
      }
    } catch (err) {
      console.error("[TODO Board] Erro ao fazer refresh do token:", err);
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[TODO Board] Erro ao criar issue:", {
      status: response.status,
      errorText,
    });
    throw new Error(`Erro ao criar issue: ${response.status} - ${errorText}`);
  }

  const jsonResponse = await response.json();

  return jsonResponse;
}

export async function updateBoardContent(
  webview: vscode.Webview,
): Promise<void> {
  const hits = await loadPersistedTodos();
  const boardItems = buildBoardItems(hits);
  const grouped = groupItems(boardItems);

  webview.html = renderBoard(webview, grouped);
}

export function getCurrentPanel(): vscode.WebviewPanel | undefined {
  return currentPanel;
}

function setupWebviewMessageHandler(panel: vscode.WebviewPanel): void {
  panel.webview.onDidReceiveMessage(async (message) => {
    if (message?.type === "open" && typeof message.file === "string") {
      const line = typeof message.line === "number" ? message.line : 0;

      try {
        const resourceUri = vscode.Uri.file(message.file);
        const document = await vscode.workspace.openTextDocument(resourceUri);
        const position = new vscode.Position(line, 0);
        const selection = new vscode.Selection(position, position);

        await vscode.window.showTextDocument(document, {
          selection,
          preview: false,
        });
      } catch (error) {
        const messageText =
          error instanceof Error ? error.message : String(error);
        void vscode.window.showErrorMessage(
          `Unable to open TODO location: ${messageText}`,
        );
      }
    } else if (
      message?.type === "setFilter" &&
      typeof message.label === "string"
    ) {
      // Toggle label in filter state (supports multiple labels)
      filterState.toggleLabel(message.label);
    } else if (
      message?.type === "removeLabel" &&
      typeof message.label === "string"
    ) {
      // Remove a specific label from filter
      filterState.removeLabel(message.label);
    } else if (message?.type === "clearLabels") {
      filterState.clearLabels();
    } else if (
      message?.type === "setAgeFilter" &&
      typeof message.ageFilter === "string"
    ) {
      filterState.setAgeFilter(message.ageFilter);
    } else if (
      message?.type === "toggleSort" &&
      typeof message.direction === "string"
    ) {
      filterState.toggleSortDirection();
    } else if (message?.type === "resetFilters") {
      filterState.clearLabels();
      filterState.setAgeFilter("all");
      filterState.setSort({ direction: "desc" });
    } else if (message?.type === "fetchProjects") {
      // Buscar projetos do Jira
      try {
        const token = await getAuthToken();
        if (!token) {
          panel.webview.postMessage({
            type: "projectsLoaded",
            projects: [],
          });
          return;
        }

        const response = await fetchWithTokenRefresh(
          "https://todo-board.dantewebmaster.com.br/projects",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response) {
          panel.webview.postMessage({
            type: "projectsLoaded",
            projects: [],
          });
          return;
        }

        panel.webview.postMessage({
          type: "projectsLoaded",
          projects: response,
        });
      } catch (error) {
        console.error("[TODO Board] Falha ao buscar projetos:", error);
        panel.webview.postMessage({
          type: "projectsLoaded",
          projects: [],
        });
      }
    } else if (message?.type === "fetchIssueTypes") {
      // Buscar tipos de issue do Jira
      try {
        const token = await getAuthToken();
        if (!token) {
          panel.webview.postMessage({
            type: "issueTypesLoaded",
            issueTypes: [],
          });
          return;
        }

        const projectId = message.projectId || "";
        const url = `https://todo-board.dantewebmaster.com.br/issue-types?projectId=${projectId}`;

        const response = await fetchWithTokenRefresh(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response) {
          panel.webview.postMessage({
            type: "issueTypesLoaded",
            issueTypes: [],
          });
          return;
        }

        panel.webview.postMessage({
          type: "issueTypesLoaded",
          issueTypes: response,
        });
      } catch (error) {
        console.error("[TODO Board] Falha ao buscar tipos de issue:", error);
        panel.webview.postMessage({
          type: "issueTypesLoaded",
          issueTypes: [],
        });
      }
    } else if (message?.type === "createIssue") {
      try {
        const token = await getAuthToken();
        if (!token) {
          void vscode.window.showErrorMessage(
            "Você precisa estar autenticado para criar uma issue.",
          );
          return;
        }

        // Construir descrição no formato ADF
        const adfDescription = {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: message.description || "TODO sem descrição",
                },
                { type: "text", text: "\n" },
                {
                  type: "text",
                  text: `Arquivo: ${message.location} | Linha: ${message.line}`,
                },
              ],
            },
          ],
        };

        const payload = {
          fields: {
            project: { key: message.projectKey || "" },
            summary: message.summary || "TODO sem descrição",
            issuetype: { id: message.issueTypeId },
            description: adfDescription,
          },
        };

        // Faz requisição com refresh automático de token
        const response = await fetchWithTokenRefresh(
          "https://todo-board.dantewebmaster.com.br/issue",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        const issueData = await response;

        // Atualiza o TODO persistido com informações da issue
        console.log("Atualizando TODO:", {
          filePath: message.filePath,
          line: message.line,
          issueData,
        });

        await updateTodoWithIssue(message.filePath, message.line, {
          id: issueData.id,
          key: issueData.key,
          link: issueData.link,
        });

        // Envia dados da issue criada de volta ao webview
        panel.webview.postMessage({
          type: "issueCreated",
          issueData: {
            id: issueData.id,
            key: issueData.key,
            link: issueData.link,
            location: message.location,
            line: message.line,
          },
        });

        void vscode.window.showInformationMessage(
          `Issue [${issueData.key}] criada com sucesso!`,
        );
      } catch (err) {
        // Loga o erro e o token para debug
        console.error("[TODO Board] Falha ao criar issue:", err);
        void vscode.window.showErrorMessage(
          `Erro ao criar issue: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    } else if (
      message?.type === "openExternal" &&
      typeof message.url === "string"
    ) {
      // Abrir URL externa (issue do Jira)
      try {
        const externalUri = vscode.Uri.parse(message.url);
        await vscode.env.openExternal(externalUri);
      } catch (err) {
        void vscode.window.showErrorMessage(
          `Erro ao abrir link: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    } else if (message?.type === "checkAuthBeforeCreateIssue") {
      // Verificar se está autenticado antes de abrir modal
      try {
        const token = await getAuthToken();

        if (!token) {
          // Não está autenticado, inicia fluxo de autenticação
          void vscode.window.showInformationMessage(
            "Você precisa se conectar ao Jira primeiro. Iniciando autenticação...",
          );
          await vscode.commands.executeCommand("todo-board.authenticate");
          return;
        }

        // Está autenticado, envia mensagem para abrir modal
        panel.webview.postMessage({
          type: "openIssueModal",
          data: message.data,
        });
      } catch (err) {
        void vscode.window.showErrorMessage(
          `Erro ao verificar autenticação: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  });
}

export async function openTodoBoard(
  context?: vscode.ExtensionContext,
): Promise<void> {
  if (currentPanel) {
    currentPanel.reveal(vscode.ViewColumn.Active);
    await updateBoardContent(currentPanel.webview);
    return;
  }

  const panel = vscode.window.createWebviewPanel(
    "todoBoard",
    "TODO Board",
    vscode.ViewColumn.Active,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    },
  );

  if (context) {
    const lightIconPath = vscode.Uri.joinPath(
      context.extensionUri,
      "resources",
      "activity-bar-icon.svg",
    );
    const darkIconPath = vscode.Uri.joinPath(
      context.extensionUri,
      "resources",
      "activity-bar-icon.svg",
    );
    panel.iconPath = {
      light: lightIconPath,
      dark: darkIconPath,
    };
  }

  currentPanel = panel;

  panel.onDidDispose(() => {
    currentPanel = undefined;
  });

  await updateBoardContent(panel.webview);
  setupWebviewMessageHandler(panel);
}
