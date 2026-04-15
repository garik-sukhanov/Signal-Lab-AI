import type { ScenarioRunHistoryItem, ScenarioRunResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import type { ToastState } from "./model";
import {
  ApiHealthCard,
  ObservabilityLinksCard,
  RunHistoryCard,
  ScenarioRunCard,
  type ScenarioFormViewModel,
} from "./view-sections";

interface ObservabilityPageViewProps {
  toast: ToastState;
  health: { isLoading: boolean; status: string; timestamp?: string; onRefresh: () => void };
  scenarioForm: ScenarioFormViewModel;
  runState: { isPending: boolean; latestRun: ScenarioRunResponse | undefined };
  history: {
    isLoading: boolean;
    isError: boolean;
    items: ScenarioRunHistoryItem[] | undefined;
  };
}

export function ObservabilityPageView({
  toast,
  health,
  scenarioForm,
  runState,
  history,
}: ObservabilityPageViewProps) {
  return (
    <div className="min-h-screen px-4 py-10">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        {toast ? <ToastBanner toast={toast} /> : null}

        <nav className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Signal Lab
          </p>
          <Button variant="outline" onClick={health.onRefresh}>
            Обновить health
          </Button>
        </nav>

        <ApiHealthCard health={health} />
        <ScenarioRunCard scenarioForm={scenarioForm} runState={runState} />
        <RunHistoryCard history={history} />
        <ObservabilityLinksCard />
      </main>
    </div>
  );
}

function ToastBanner({ toast }: { toast: NonNullable<ToastState> }) {
  return (
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
  );
}
