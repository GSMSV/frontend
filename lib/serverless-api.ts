import { api } from "./api";

export interface ServerlessFunction {
  id: string;
  name: string;
  description?: string;
  code: string;
  runtime: "javascript" | "typescript";
  timeout: number;
  memoryLimit: number;
  envVars: Record<string, string>;
  status: "active" | "disabled";
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface FunctionTrigger {
  id: string;
  functionId: string;
  type: "http" | "cron";
  httpMethod?: string;
  cronExpr?: string;
  enabled: boolean;
  createdAt: string;
}

export interface ExecutionLog {
  id: string;
  functionId: string;
  trigger: "http" | "cron" | "manual";
  status: "success" | "error" | "timeout";
  duration: number;
  logs: string[];
  error?: string;
  requestBody?: string;
  response?: string;
  createdAt: string;
}

export interface ExecutionResult {
  status: "success" | "error" | "timeout";
  body: string;
  statusCode: number;
  headers: Record<string, string>;
  logs: string[];
  error?: string;
  duration: number;
}

export interface FunctionQuota {
  current: number;
  max: number;
}

export async function getFunctions(): Promise<ServerlessFunction[]> {
  return api<ServerlessFunction[]>("/serverless/functions");
}

export async function getFunction(id: string): Promise<ServerlessFunction> {
  return api<ServerlessFunction>(`/serverless/functions/${id}`);
}

export async function createFunction(body: {
  name: string;
  description?: string;
  code: string;
  runtime?: "javascript" | "typescript";
  timeout?: number;
  memoryLimit?: number;
  envVars?: Record<string, string>;
}): Promise<ServerlessFunction> {
  return api<ServerlessFunction>("/serverless/functions", { method: "POST", body });
}

export async function updateFunction(
  id: string,
  body: Partial<{
    name: string;
    description: string;
    code: string;
    runtime: "javascript" | "typescript";
    timeout: number;
    memoryLimit: number;
    envVars: Record<string, string>;
    status: "active" | "disabled";
  }>,
): Promise<ServerlessFunction> {
  return api<ServerlessFunction>(`/serverless/functions/${id}`, { method: "PUT", body });
}

export async function deleteFunction(id: string): Promise<void> {
  return api<void>(`/serverless/functions/${id}`, { method: "DELETE" });
}

export async function executeFunction(
  id: string,
  payload?: unknown,
): Promise<ExecutionResult> {
  return api<ExecutionResult>(`/serverless/functions/${id}/execute`, {
    method: "POST",
    body: payload ?? {},
  });
}

export async function getFunctionLogs(
  id: string,
  limit = 50,
  offset = 0,
): Promise<ExecutionLog[]> {
  return api<ExecutionLog[]>(
    `/serverless/functions/${id}/logs?limit=${limit}&offset=${offset}`,
  );
}

export async function deleteFunctionLogs(id: string): Promise<void> {
  return api<void>(`/serverless/functions/${id}/logs`, { method: "DELETE" });
}

export async function getTriggers(funcId: string): Promise<FunctionTrigger[]> {
  return api<FunctionTrigger[]>(`/serverless/functions/${funcId}/triggers`);
}

export async function createTrigger(
  funcId: string,
  body: {
    type: "http" | "cron";
    httpMethod?: string;
    cronExpr?: string;
    enabled?: boolean;
  },
): Promise<FunctionTrigger> {
  return api<FunctionTrigger>(`/serverless/functions/${funcId}/triggers`, {
    method: "POST",
    body,
  });
}

export async function updateTrigger(
  funcId: string,
  triggerId: string,
  body: Partial<{ httpMethod: string; cronExpr: string; enabled: boolean }>,
): Promise<FunctionTrigger> {
  return api<FunctionTrigger>(
    `/serverless/functions/${funcId}/triggers/${triggerId}`,
    { method: "PUT", body },
  );
}

export async function deleteTrigger(
  funcId: string,
  triggerId: string,
): Promise<void> {
  return api<void>(`/serverless/functions/${funcId}/triggers/${triggerId}`, {
    method: "DELETE",
  });
}

export async function getQuota(): Promise<FunctionQuota> {
  return api<FunctionQuota>("/serverless/functions/quota");
}
