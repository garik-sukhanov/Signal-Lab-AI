"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchHealth, runScenario } from "@/lib/api";

const scenarioValues = [
  "platform_foundation",
  "observability_demo",
  "cursor_ai_layer",
] as const;

type ScenarioType = (typeof scenarioValues)[number];

const scenarioOptions: Array<{
  value: ScenarioType;
  label: string;
  description: string;
}> = [
  {
    value: "platform_foundation",
    label: "Platform Foundation (PRD 001)",
    description: "Базовый каркас платформы и инфраструктуры",
  },
  {
    value: "observability_demo",
    label: "Observability Demo (PRD 002)",
    description: "Демо сценария с метриками и трассировкой",
  },
  {
    value: "cursor_ai_layer",
    label: "Cursor AI Layer (PRD 003)",
    description: "Сценарий работы AI-слоя в продукте",
  },
];

const isScenarioType = (value: string): value is ScenarioType =>
  (scenarioValues as readonly string[]).includes(value);

const runScenarioSchema = z.object({
  type: z.string().refine(isScenarioType, "Выберите сценарий из списка"),
});

type RunScenarioFormData = z.infer<typeof runScenarioSchema>;

export default function Home() {
  const healthQuery = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    refetchInterval: 15_000,
  });

  const runMutation = useMutation({
    mutationFn: (data: RunScenarioFormData) =>
      runScenario({
        type: data.type,
        payload: { source: "frontend-form" },
      }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RunScenarioFormData>({
    resolver: zodResolver(runScenarioSchema),
    defaultValues: {
      type: "",
    },
  });

  const onSubmit = async (data: RunScenarioFormData) => {
    await runMutation.mutateAsync(data);
    reset({ type: "" });
  };

  return (
    <div className="min-h-screen px-4 py-10">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <nav className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Signal Lab
          </p>
          <Button variant="outline" onClick={() => healthQuery.refetch()}>
            Обновить health
          </Button>
        </nav>

        <Card>
          <CardHeader>
            <CardTitle>Статус API</CardTitle>
            <CardDescription>
              Проверка backend через TanStack Query
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Статус:</span>{" "}
              {healthQuery.isLoading
                ? "loading..."
                : healthQuery.data?.status ?? "unavailable"}
            </p>
            <p className="text-sm text-muted-foreground">
              {healthQuery.data?.timestamp
                ? `Обновлено: ${new Date(healthQuery.data.timestamp).toLocaleString()}`
                : "Timestamp недоступен"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Запуск сценария</CardTitle>
            <CardDescription>
              Форма на React Hook Form отправляет POST /api/scenarios/run
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id="scenario-form"
              className="space-y-3"
              onSubmit={handleSubmit(onSubmit)}
            >
              <label
                className="block text-sm font-medium text-foreground"
                htmlFor="scenario-type"
              >
                Сценарий запуска
              </label>
              <select
                id="scenario-type"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                aria-invalid={Boolean(errors.type)}
                {...register("type")}
              >
                <option value="" disabled>
                  Выберите сценарий из списка
                </option>
                {scenarioOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                {scenarioOptions.map((option) => option.description).join(" • ")}
              </p>
              {errors.type ? (
                <p className="text-sm text-red-600">{errors.type.message}</p>
              ) : null}
            </form>
          </CardContent>
          <CardFooter className="flex-col items-start gap-3">
            <Button
              type="submit"
              form="scenario-form"
              disabled={runMutation.isPending}
            >
              {runMutation.isPending ? "Отправка..." : "Запустить"}
            </Button>
            {runMutation.data ? (
              <p className="text-sm text-muted-foreground">
                Создан запуск: <span className="font-mono">{runMutation.data.id}</span>
              </p>
            ) : null}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
