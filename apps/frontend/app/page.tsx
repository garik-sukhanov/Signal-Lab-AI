"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  fetchHealth,
  fetchScenarioRuns,
  type ScenarioRunHistoryItem,
  runScenario,
} from "@/lib/api";

const scenarioValues = [
  "success",
  "validation_error",
  "system_error",
  "slow_request",
  "teapot",
] as const;

type ScenarioType = (typeof scenarioValues)[number];

const scenarioOptions: Array<{
  value: ScenarioType;
  label: string;
  description: string;
}> = [
  {
    value: "success",
    label: "success",
    description: "Успешный запуск и завершение сценария",
  },
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
    description: 'Easter egg: HTTP 418 с signal = 42',
  },
];

const runScenarioSchema = z.object({
  type: z.enum(scenarioValues, { error: "Выберите сценарий из списка" }),
  name: z.string().max(80, "Не больше 80 символов").optional(),
});

type RunScenarioFormData = z.infer<typeof runScenarioSchema>;
type ToastState = { variant: "success" | "error"; message: string } | null;

export default function Home() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<ToastState>(null);

  const healthQuery = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    refetchInterval: 15_000,
  });

  const historyQuery = useQuery({
    queryKey: ["scenario-runs"],
    queryFn: fetchScenarioRuns,
    refetchInterval: 10_000,
  });

  const runMutation = useMutation({
    mutationFn: (data: RunScenarioFormData) =>
      runScenario({
        type: data.type,
        name: normalizeOptionalText(data.name),
      }),
    onSuccess: (result) => {
      setToast({
        variant: "success",
        message: `Сценарий ${result.status}. ID: ${result.id}`,
      });
      void queryClient.invalidateQueries({ queryKey: ["scenario-runs"] });
    },
    onError: (error) => {
      setToast({
        variant: "error",
        message: error.message,
      });
      void queryClient.invalidateQueries({ queryKey: ["scenario-runs"] });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RunScenarioFormData>({
    resolver: zodResolver(runScenarioSchema),
    defaultValues: {
      type: "success",
      name: "",
    },
  });

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 4000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  const onSubmit = async (data: RunScenarioFormData) => {
    await runMutation.mutateAsync(data);
    reset({ type: "success", name: "" });
  };

  const scenarioDescriptions = useMemo(
    () => scenarioOptions.map((option) => option.description).join(" • "),
    [],
  );

  return (
    <div className="min-h-screen px-4 py-10">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        {toast ? (
          <div
            className={`fixed right-4 top-4 z-50 rounded-md border px-4 py-3 text-sm shadow-lg ${
              toast.variant === "success"
                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                : "border-rose-300 bg-rose-50 text-rose-900"
            }`}
            role="status"
          >
            {toast.message}
          </div>
        ) : null}

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
                {scenarioOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Произвольное название (опционально)"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                {scenarioDescriptions}
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
                Создан запуск: <span className="font-mono">{runMutation.data.id}</span> (
                {runMutation.data.duration} ms)
              </p>
            ) : null}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>История запусков</CardTitle>
            <CardDescription>Последние 20 сценариев с автообновлением</CardDescription>
          </CardHeader>
          <CardContent>
            {historyQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Загрузка истории...</p>
            ) : historyQuery.isError ? (
              <p className="text-sm text-red-600">Не удалось загрузить историю</p>
            ) : historyQuery.data && historyQuery.data.length > 0 ? (
              <ul className="space-y-3">
                {historyQuery.data.map((run) => (
                  <li
                    key={run.id}
                    className="rounded-lg border border-border bg-background p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={getStatusVariant(run)}>{run.status}</Badge>
                      <span className="font-mono text-xs text-muted-foreground">
                        {run.id}
                      </span>
                      <span className="text-sm font-medium">{run.type}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span>Duration: {run.duration ?? "—"} ms</span>
                      <span>
                        Time: {new Date(run.createdAt).toLocaleString()}
                      </span>
                      {run.error ? <span>Error: {run.error}</span> : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">История пока пуста</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observability Links</CardTitle>
            <CardDescription>Быстрые ссылки для проверки сигналов</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Grafana Dashboard:{" "}
              <a
                className="underline"
                href="http://localhost:3100"
                rel="noreferrer"
                target="_blank"
              >
                http://localhost:3100
              </a>
            </p>
            <p>Sentry: check project dashboard</p>
            <p>
              Loki query: <span className="font-mono">{"{app=\"signal-lab\"}"}</span>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function getStatusVariant(
  run: ScenarioRunHistoryItem,
): "success" | "warning" | "error" | "outline" {
  if (run.status === "completed") {
    return "success";
  }
  if (run.status === "validation_error" || run.status === "teapot") {
    return "warning";
  }
  if (run.status === "system_error") {
    return "error";
  }
  return "outline";
}

function normalizeOptionalText(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}
