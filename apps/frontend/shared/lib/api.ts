import type { ScenarioType } from "./scenario-contracts";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface HealthResponse {
  status: string;
  timestamp: string;
}

export interface ScenarioRunInput {
  type: ScenarioType;
  name?: string;
}

export interface ScenarioRunResponse {
  id: string;
  status: string;
  duration: number;
  createdAt: string;
}

export interface ScenarioRunHistoryItem {
  id: string;
  type: string;
  status: string;
  duration: number | null;
  error: string | null;
  createdAt: string;
}

interface ApiErrorResponse {
  message?: string | string[];
}

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/health`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Health endpoint is unavailable");
  }

  return response.json() as Promise<HealthResponse>;
}

export async function runScenario(
  payload: ScenarioRunInput,
): Promise<ScenarioRunResponse> {
  const response = await fetch(`${API_BASE_URL}/api/scenarios/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<ScenarioRunResponse>;
}

export async function fetchScenarioRuns(): Promise<ScenarioRunHistoryItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/scenarios/runs`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load run history");
  }

  return response.json() as Promise<ScenarioRunHistoryItem[]>;
}

async function getErrorMessage(response: Response): Promise<string> {
  const fallback = `Request failed with status ${response.status}`;

  try {
    const data = (await response.json()) as ApiErrorResponse;
    if (Array.isArray(data.message)) {
      return data.message.join(", ");
    }
    if (typeof data.message === "string" && data.message.trim().length > 0) {
      return data.message;
    }
    return fallback;
  } catch {
    return fallback;
  }
}
