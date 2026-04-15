import { useQuery } from "@tanstack/react-query";
import { fetchScenarioRuns } from "@/lib/api";

export const scenarioRunsQueryKey = ["scenario-runs"] as const;

const RUNS_REFETCH_INTERVAL_MS = 10_000;

export function useScenarioRunsQuery() {
  return useQuery({
    queryKey: scenarioRunsQueryKey,
    queryFn: fetchScenarioRuns,
    refetchInterval: RUNS_REFETCH_INTERVAL_MS,
  });
}

export function useScenarioRunsState() {
  const runsQuery = useScenarioRunsQuery();

  return {
    ...runsQuery,
    hasData: Boolean(runsQuery.data && runsQuery.data.length > 0),
  };
}
