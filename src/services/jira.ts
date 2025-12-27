import { getAuthToken } from "./auth";

export interface JiraIssueOptions {
  summary: string;
  description?: string;
  projectKey?: string;
  issuetype?: string;
}

// Minimal create issue function - expects your Jira API URL and token
export async function createJiraIssue(
  opts: JiraIssueOptions,
): Promise<Record<string, unknown>> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("No auth token found. Please connect to Jira first.");
  }

  // Use the project's backend endpoint to create issues
  const API_BASE = "https://todo-board.dantewebmaster.com.br";
  const apiUrl = `${API_BASE}/issue`;

  const body: Record<string, unknown> = {
    fields: {
      project: {
        key: opts.projectKey ?? "SMS",
      },
      summary: opts.summary,
      description: opts.description ?? "",
      issuetype: {
        name: opts.issuetype ?? "Task",
      },
    },
  };

  // Use global fetch if available (Node 18+ / VS Code runtime). If not available, consumers should add a fetch polyfill.
  type HttpResponse = {
    ok: boolean;
    status: number;
    text: () => Promise<string>;
    json: () => Promise<unknown>;
  };

  type FetchFunction = (
    input: string,
    init?: Record<string, unknown>,
  ) => Promise<HttpResponse>;

  const globalFetch = (globalThis as { fetch?: FetchFunction }).fetch;

  if (!globalFetch) {
    throw new Error(
      "Global fetch is not available in this runtime. Add a fetch polyfill or use node >=18.",
    );
  }

  const res = await globalFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Jira API error: ${res.status} ${text}`);
  }

  const json = await res.json();
  return json as Record<string, unknown>;
}
