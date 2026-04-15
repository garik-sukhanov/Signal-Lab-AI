import { z } from "zod";
import type { ScenarioRunHistoryItem } from "@/shared/lib/api";
import { scenarioValues, type ScenarioType } from "@/shared/lib/scenario-contracts";

export type StatusBadgeVariant = "success" | "warning" | "error" | "outline";
export type ToastState = { variant: "success" | "error"; message: string } | null;

export const scenarioOptions: Array<{
  value: ScenarioType;
  label: string;
  description: string;
}> = [
  { value: "success", label: "success", description: "Успешный запуск и завершение сценария" },
  {
    value: "validation_error",
    label: "validation_error",
    description: "Синтетическая ошибка валидации (HTTP 400)",
  },
  {
    value: "system_error",
    label: "system_error",
    description: "Синтетическая системная ошибка (HTTP 500)",
  },
  {
    value: "slow_request",
    label: "slow_request",
    description: "Искусственная задержка 2-5 секунд",
  },
  {
    value: "teapot",
    label: "teapot (опционально)",
    description: "Easter egg: HTTP 418 с signal = 42",
  },
];

export const runScenarioSchema = z.object({
  type: z.enum(scenarioValues, { error: "Выберите сценарий из списка" }),
  name: z.string().max(80, "Не больше 80 символов").optional(),
});

export type RunScenarioFormData = z.infer<typeof runScenarioSchema>;

export const scenarioDescriptions = scenarioOptions
  .map((option) => option.description)
  .join(" • ");

export const defaultRunScenarioValues: RunScenarioFormData = {
  type: "success",
  name: "",
};

export function getStatusVariant(run: ScenarioRunHistoryItem): StatusBadgeVariant {
  if (run.status === "completed") return "success";
  if (run.status === "validation_error" || run.status === "teapot") return "warning";
  if (run.status === "system_error") return "error";
  return "outline";
}

export function normalizeOptionalText(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}
