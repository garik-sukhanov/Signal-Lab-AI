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
  onDismissToast: () => void;
  health: { isLoading: boolean; status: string; timestamp?: string; onRefresh: () => void };
  scenarioForm: ScenarioFormViewModel;
  runState: { isPending: boolean; latestRun: ScenarioRunResponse | undefined };
  history: {
    isLoading: boolean;
    isError: boolean;
    items: ScenarioRunHistoryItem[] | undefined;
  };
  observabilityLinks: {
    grafanaUrl: string;
    sentryUrl: string;
    lokiExploreUrl?: string;
    lokiQuery: string;
  };
}

export function ObservabilityPageView({
  toast,
  onDismissToast,
  health,
  scenarioForm,
  runState,
  history,
  observabilityLinks,
}: ObservabilityPageViewProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {toast ? <ToastBanner toast={toast} onDismiss={onDismissToast} /> : null}

      <header className="w-full border-b border-border bg-card">
        <div className="flex w-full items-center justify-between px-4 py-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Signal Lab
          </p>
          <Button variant="outline" onClick={health.onRefresh}>
            Обновить health
          </Button>
        </div>
      </header>

      <main className="flex-1 w-full px-4 py-6">
        <div className="grid w-full gap-6 lg:grid-cols-2 lg:items-stretch">
          <section className="flex h-full flex-col gap-6">
            <ScenarioRunCard scenarioForm={scenarioForm} runState={runState} />
            <ObservabilityLinksCard links={observabilityLinks} />
            <ApiHealthCard health={health} />
          </section>

          <aside className="flex h-full flex-col gap-6">
            <RunHistoryCard history={history} />
          </aside>
        </div>
      </main>

      <footer className="w-full border-t border-border bg-card">
        <div className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-4 text-sm text-muted-foreground">
          <span>All rights reserved © {new Date().getFullYear()}</span>
          <span>tg @garik_sukhanov</span>
        </div>
      </footer>
    </div>
  );
}

function ToastBanner({
  toast,
  onDismiss,
}: {
  toast: NonNullable<ToastState>;
  onDismiss: () => void;
}) {
  const isSuccess = toast.variant === "success";

  return (
    <div
      className={`fixed right-4 top-4 z-50 flex min-w-72 max-w-sm items-start justify-between gap-3 rounded-lg border px-4 py-3 shadow-lg ${
        isSuccess
          ? "border-emerald-300 bg-emerald-50 text-emerald-950"
          : "border-rose-300 bg-rose-50 text-rose-950"
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide">
          {isSuccess ? "Успех" : "Ошибка"}
        </p>
        <p className="text-sm">{toast.message}</p>
      </div>
      <button
        type="button"
        className="text-xs font-medium underline underline-offset-4"
        onClick={onDismiss}
      >
        Закрыть
      </button>
    </div>
  );
}
