const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface HealthResponse {
  status: string;
  timestamp: string;
}

export interface ScenarioRunInput {
  type: string;
  payload?: Record<string, unknown>;
}

export interface ScenarioRunResponse {
  id: string;
  status: string;
  createdAt: string;
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
    throw new Error("Unable to run scenario");
  }

  return response.json() as Promise<ScenarioRunResponse>;
}
