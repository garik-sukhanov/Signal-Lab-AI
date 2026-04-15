export const scenarioValues = [
  "success",
  "validation_error",
  "system_error",
  "slow_request",
  "teapot",
] as const;

export type ScenarioType = (typeof scenarioValues)[number];
