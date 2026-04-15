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
import { Input } from "@/components/ui/input";
import { fetchHealth, runScenario } from "@/lib/api";

const runScenarioSchema = z.object({
  type: z.string().min(2, "Минимум 2 символа"),
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
      type: "observability_demo",
    },
  });

  const onSubmit = async (data: RunScenarioFormData) => {
    await runMutation.mutateAsync(data);
    reset();
  };

  return (
    <div className="min-h-screen px-4 py-10">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <nav className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
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
            <p className="text-sm text-zinc-500">
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
              <Input
                placeholder="Тип сценария"
                aria-invalid={Boolean(errors.type)}
                {...register("type")}
              />
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
              <p className="text-sm text-zinc-600">
                Создан запуск: <span className="font-mono">{runMutation.data.id}</span>
              </p>
            ) : null}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
