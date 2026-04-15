import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runScenario, type ScenarioRunResponse } from "@/shared/lib/api";
import { scenarioRunsQueryKey } from "./use-scenario-runs-query";

interface UseRunScenarioMutationParams {
  onSuccess?: (result: ScenarioRunResponse) => void;
  onError?: (error: Error) => void;
}

export function useRunScenarioMutation({
  onSuccess,
  onError,
}: UseRunScenarioMutationParams = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: runScenario,
    onSuccess: (result) => {
      onSuccess?.(result);
      void queryClient.invalidateQueries({ queryKey: scenarioRunsQueryKey });
    },
    onError: (error) => {
      onError?.(error);
      void queryClient.invalidateQueries({ queryKey: scenarioRunsQueryKey });
    },
  });
}
