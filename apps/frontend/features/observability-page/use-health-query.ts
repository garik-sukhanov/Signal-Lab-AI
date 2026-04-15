import { useQuery } from "@tanstack/react-query";
import { fetchHealth } from "@/lib/api";

export const healthQueryKey = ["health"] as const;

const HEALTH_REFETCH_INTERVAL_MS = 15_000;

export function useHealthQuery() {
  return useQuery({
    queryKey: healthQueryKey,
    queryFn: fetchHealth,
    refetchInterval: HEALTH_REFETCH_INTERVAL_MS,
  });
}

export function useHealthActions() {
  const healthQuery = useHealthQuery();

  return {
    ...healthQuery,
    refresh: healthQuery.refetch,
  };
}
