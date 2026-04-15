import type { FieldErrors, UseFormHandleSubmit, UseFormRegister } from "react-hook-form";
import type { ScenarioRunHistoryItem, ScenarioRunResponse } from "@/lib/api";
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
  getStatusVariant,
  type RunScenarioFormData,
  scenarioDescriptions,
  scenarioOptions,
} from "./model";

export interface ScenarioFormViewModel {
  register: UseFormRegister<RunScenarioFormData>;
  handleSubmit: UseFormHandleSubmit<RunScenarioFormData>;
  onSubmit: (values: RunScenarioFormData) => Promise<void>;
  errors: FieldErrors<RunScenarioFormData>;
}

export function ApiHealthCard({
  health,
}: {
  health: { isLoading: boolean; status: string; timestamp?: string };
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Статус API</CardTitle>
        <CardDescription>Проверка backend через TanStack Query</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">
          <span className="font-medium">Статус:</span> {health.isLoading ? "loading..." : health.status}
        </p>
        <p className="text-sm text-muted-foreground">
          {health.timestamp
            ? `Обновлено: ${new Date(health.timestamp).toLocaleString()}`
            : "Timestamp недоступен"}
        </p>
      </CardContent>
    </Card>
  );
}

export function ScenarioRunCard({
  scenarioForm,
  runState,
}: {
  scenarioForm: ScenarioFormViewModel;
  runState: { isPending: boolean; latestRun: ScenarioRunResponse | undefined };
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Запуск сценария</CardTitle>
        <CardDescription>Форма на React Hook Form отправляет POST /api/scenarios/run</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="scenario-form" className="space-y-3" onSubmit={scenarioForm.handleSubmit(scenarioForm.onSubmit)}>
          <label className="block text-sm font-medium text-foreground" htmlFor="scenario-type">
            Сценарий запуска
          </label>
          <select
            id="scenario-type"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            aria-invalid={Boolean(scenarioForm.errors.type)}
            {...scenarioForm.register("type")}
          >
            {scenarioOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Input
            placeholder="Произвольное название (опционально)"
            aria-invalid={Boolean(scenarioForm.errors.name)}
            {...scenarioForm.register("name")}
          />
          {scenarioForm.errors.name ? (
            <p className="text-sm text-red-600">{scenarioForm.errors.name.message}</p>
          ) : null}
          <p className="text-xs text-muted-foreground">{scenarioDescriptions}</p>
          {scenarioForm.errors.type ? (
            <p className="text-sm text-red-600">{scenarioForm.errors.type.message}</p>
          ) : null}
        </form>
      </CardContent>
      <CardFooter className="flex-col items-start gap-3">
        <Button type="submit" form="scenario-form" disabled={runState.isPending}>
          {runState.isPending ? "Отправка..." : "Запустить"}
        </Button>
        {runState.latestRun ? (
          <p className="text-sm text-muted-foreground">
            Создан запуск: <span className="font-mono">{runState.latestRun.id}</span> ({runState.latestRun.duration} ms)
          </p>
        ) : null}
      </CardFooter>
    </Card>
  );
}

export function RunHistoryCard({
  history,
}: {
  history: { isLoading: boolean; isError: boolean; items: ScenarioRunHistoryItem[] | undefined };
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>История запусков</CardTitle>
        <CardDescription>Последние 20 сценариев с автообновлением</CardDescription>
      </CardHeader>
      <CardContent>
        {history.isLoading ? (
          <p className="text-sm text-muted-foreground">Загрузка истории...</p>
        ) : history.isError ? (
          <p className="text-sm text-red-600">Не удалось загрузить историю</p>
        ) : history.items && history.items.length > 0 ? (
          <ul className="space-y-3">
            {history.items.map((run) => (
              <li key={run.id} className="rounded-lg border border-border bg-background p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={getStatusVariant(run)}>{run.status}</Badge>
                  <span className="font-mono text-xs text-muted-foreground">{run.id}</span>
                  <span className="text-sm font-medium">{run.type}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>Duration: {run.duration ?? "—"} ms</span>
                  <span>Time: {new Date(run.createdAt).toLocaleString()}</span>
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
  );
}

export function ObservabilityLinksCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Observability Links</CardTitle>
        <CardDescription>Быстрые ссылки для проверки сигналов</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>
          Grafana Dashboard:{" "}
          <a className="underline" href="http://localhost:3100" rel="noreferrer" target="_blank">
            http://localhost:3100
          </a>
        </p>
        <p>Sentry: check project dashboard</p>
        <p>
          Loki query: <span className="font-mono">{"{app=\"signal-lab\"}"}</span>
        </p>
      </CardContent>
    </Card>
  );
}
