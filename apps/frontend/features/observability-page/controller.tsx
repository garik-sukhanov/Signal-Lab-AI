"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  defaultRunScenarioValues,
  normalizeOptionalText,
  runScenarioSchema,
  type RunScenarioFormData,
  type ToastState,
} from "./model";
import { useHealthActions } from "./use-health-query";
import { useRunScenarioMutation } from "./use-run-scenario-mutation";
import { useScenarioRunsState } from "./use-scenario-runs-query";
import { ObservabilityPageView } from "./view";

const TOAST_TIMEOUT_MS = 4_000;
const DEFAULT_OBSERVABILITY_LINKS = {
  grafanaUrl: "http://localhost:3100",
  sentryUrl: "https://sentry.io",
  lokiQuery: '{app="signal-lab"}',
};

export function ObservabilityPageController() {
  const [toast, setToast] = useState<ToastState>(null);
  const healthQuery = useHealthActions();
  const historyQuery = useScenarioRunsState();

  const scenarioForm = useForm<RunScenarioFormData>({
    resolver: zodResolver(runScenarioSchema),
    defaultValues: defaultRunScenarioValues,
  });

  const runMutation = useRunScenarioMutation({
    onSuccess: (result) => {
      setToast({
        variant: "success",
        message: `Сценарий ${result.status}. ID: ${result.id}`,
      });
    },
    onError: (error) => {
      setToast({
        variant: "error",
        message: error.message,
      });
    },
  });

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(null), TOAST_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const onSubmit = async (values: RunScenarioFormData) => {
    await runMutation.mutateAsync({
      type: values.type,
      name: normalizeOptionalText(values.name),
    });
    scenarioForm.reset(defaultRunScenarioValues);
  };

  const observabilityLinks = {
    grafanaUrl:
      process.env.NEXT_PUBLIC_GRAFANA_URL ?? DEFAULT_OBSERVABILITY_LINKS.grafanaUrl,
    sentryUrl:
      process.env.NEXT_PUBLIC_SENTRY_URL ?? DEFAULT_OBSERVABILITY_LINKS.sentryUrl,
    lokiExploreUrl: process.env.NEXT_PUBLIC_LOKI_EXPLORE_URL,
    lokiQuery:
      process.env.NEXT_PUBLIC_LOKI_QUERY ?? DEFAULT_OBSERVABILITY_LINKS.lokiQuery,
  };

  return (
    <ObservabilityPageView
      toast={toast}
      onDismissToast={() => setToast(null)}
      health={{
        isLoading: healthQuery.isLoading,
        status: healthQuery.data?.status ?? "unavailable",
        timestamp: healthQuery.data?.timestamp,
        onRefresh: () => {
          void healthQuery.refresh();
        },
      }}
      scenarioForm={{
        register: scenarioForm.register,
        handleSubmit: scenarioForm.handleSubmit,
        onSubmit,
        errors: scenarioForm.formState.errors,
      }}
      runState={{
        isPending: runMutation.isPending,
        latestRun: runMutation.data,
      }}
      history={{
        isLoading: historyQuery.isLoading,
        isError: historyQuery.isError,
        items: historyQuery.data,
      }}
      observabilityLinks={observabilityLinks}
    />
  );
}
