import { Injectable } from '@nestjs/common';

const durationBuckets = [0.1, 0.25, 0.5, 1, 2.5, 5, 10];

@Injectable()
export class ObservabilityService {
  private readonly scenarioRunsTotal = new Map<string, number>();
  private readonly httpRequestsTotal = new Map<string, number>();
  private readonly scenarioRunDurationBucket = new Map<string, number>();
  private readonly scenarioRunDurationSum = new Map<string, number>();
  private readonly scenarioRunDurationCount = new Map<string, number>();

  recordScenarioRun(params: {
    type: string;
    status: string;
    durationMs: number;
  }) {
    this.incrementCounter(this.scenarioRunsTotal, {
      type: params.type,
      status: params.status,
    });

    const durationSeconds = params.durationMs / 1000;
    this.observeDuration(params.type, durationSeconds);
  }

  recordHttpRequest(params: {
    method: string;
    path: string;
    statusCode: number;
  }) {
    this.incrementCounter(this.httpRequestsTotal, {
      method: params.method,
      path: params.path,
      status_code: String(params.statusCode),
    });
  }

  renderPrometheusMetrics() {
    const lines: string[] = [];

    lines.push(
      '# HELP scenario_runs_total Total number of scenario runs by type and status',
      '# TYPE scenario_runs_total counter',
    );
    lines.push(
      ...this.renderCounterSamples(
        'scenario_runs_total',
        this.scenarioRunsTotal,
      ),
    );

    lines.push(
      '# HELP scenario_run_duration_seconds Scenario run duration histogram in seconds',
      '# TYPE scenario_run_duration_seconds histogram',
    );
    lines.push(
      ...this.renderHistogramSamples({
        metricName: 'scenario_run_duration_seconds',
        bucketStore: this.scenarioRunDurationBucket,
        sumStore: this.scenarioRunDurationSum,
        countStore: this.scenarioRunDurationCount,
      }),
    );

    lines.push(
      '# HELP http_requests_total Total number of HTTP requests',
      '# TYPE http_requests_total counter',
    );
    lines.push(
      ...this.renderCounterSamples(
        'http_requests_total',
        this.httpRequestsTotal,
      ),
    );

    return `${lines.join('\n')}\n`;
  }

  private observeDuration(type: string, valueSeconds: number) {
    this.incrementSample(this.scenarioRunDurationSum, { type }, valueSeconds);
    this.incrementSample(this.scenarioRunDurationCount, { type }, 1);

    for (const bucket of durationBuckets) {
      if (valueSeconds <= bucket) {
        this.incrementSample(
          this.scenarioRunDurationBucket,
          { type, le: String(bucket) },
          1,
        );
      }
    }
    this.incrementSample(
      this.scenarioRunDurationBucket,
      { type, le: '+Inf' },
      1,
    );
  }

  private incrementCounter(
    store: Map<string, number>,
    labels: Record<string, string>,
  ) {
    this.incrementSample(store, labels, 1);
  }

  private incrementSample(
    store: Map<string, number>,
    labels: Record<string, string>,
    by: number,
  ) {
    const key = this.toKey(labels);
    const current = store.get(key) ?? 0;
    store.set(key, current + by);
  }

  private renderCounterSamples(metricName: string, store: Map<string, number>) {
    if (!store.size) {
      return [`${metricName} 0`];
    }

    return [...store.entries()].map(([key, value]) => {
      const labels = this.keyToPromLabels(key);
      return `${metricName}{${labels}} ${value}`;
    });
  }

  private renderHistogramSamples(params: {
    metricName: string;
    bucketStore: Map<string, number>;
    sumStore: Map<string, number>;
    countStore: Map<string, number>;
  }) {
    const lines: string[] = [];
    const typeKeys = new Set<string>();
    for (const key of params.countStore.keys()) {
      const labels = this.fromKey(key);
      if (labels.type) {
        typeKeys.add(labels.type);
      }
    }

    if (!typeKeys.size) {
      lines.push(
        `${params.metricName}_bucket{type="none",le="+Inf"} 0`,
        `${params.metricName}_sum{type="none"} 0`,
        `${params.metricName}_count{type="none"} 0`,
      );
      return lines;
    }

    for (const type of typeKeys) {
      for (const bucket of [...durationBuckets.map(String), '+Inf']) {
        const bucketKey = this.toKey({ type, le: bucket });
        const bucketValue = params.bucketStore.get(bucketKey) ?? 0;
        lines.push(
          `${params.metricName}_bucket{type="${type}",le="${bucket}"} ${bucketValue}`,
        );
      }

      const sum = params.sumStore.get(this.toKey({ type })) ?? 0;
      const count = params.countStore.get(this.toKey({ type })) ?? 0;
      lines.push(`${params.metricName}_sum{type="${type}"} ${sum}`);
      lines.push(`${params.metricName}_count{type="${type}"} ${count}`);
    }

    return lines;
  }

  private toKey(labels: Record<string, string>) {
    return Object.keys(labels)
      .sort()
      .map((key) => `${key}:${labels[key]}`)
      .join('|');
  }

  private fromKey(key: string) {
    const labels: Record<string, string> = {};
    for (const item of key.split('|')) {
      const [label, ...rest] = item.split(':');
      if (!label || rest.length === 0) {
        continue;
      }
      labels[label] = rest.join(':');
    }
    return labels;
  }

  private keyToPromLabels(key: string) {
    const labels = this.fromKey(key);
    return Object.entries(labels)
      .map(([name, value]) => `${name}="${this.escapeLabel(value)}"`)
      .join(',');
  }

  private escapeLabel(value: string) {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }
}
