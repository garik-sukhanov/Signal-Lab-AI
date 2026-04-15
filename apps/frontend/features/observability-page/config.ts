const DEFAULT_OBSERVABILITY_LINKS = {
  grafanaUrl: "http://localhost:3100",
  sentryUrl: "https://sentry.io",
  lokiQuery: '{app="signal-lab"}',
} as const;

export interface ObservabilityLinksConfig {
  grafanaUrl: string;
  sentryUrl: string;
  lokiExploreUrl?: string;
  lokiQuery: string;
}

export function getObservabilityLinksConfig(): ObservabilityLinksConfig {
  return {
    grafanaUrl:
      process.env.NEXT_PUBLIC_GRAFANA_URL ?? DEFAULT_OBSERVABILITY_LINKS.grafanaUrl,
    sentryUrl:
      process.env.NEXT_PUBLIC_SENTRY_URL ?? DEFAULT_OBSERVABILITY_LINKS.sentryUrl,
    lokiExploreUrl: process.env.NEXT_PUBLIC_LOKI_EXPLORE_URL,
    lokiQuery: process.env.NEXT_PUBLIC_LOKI_QUERY ?? DEFAULT_OBSERVABILITY_LINKS.lokiQuery,
  };
}
