"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getObservabilityLinksConfig } from "./config";
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

  const observabilityLinks = getObservabilityLinksConfig();

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
