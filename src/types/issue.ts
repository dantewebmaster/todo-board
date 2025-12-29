export interface CreateIssueResponse {
  id: string;
  key: string;
  link: string;
}

export interface IssueTypeResponse {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  subtask: boolean;
}
