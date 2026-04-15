---
name: signal-lab-observability
description: Add observability to new or updated backend endpoints in Signal Lab. Use when creating NestJS endpoints, changing backend flows, or validating metrics, structured logs, and Sentry coverage.
---

# Signal Lab Observability

## When to Use
- New NestJS endpoint is added.
- Existing backend flow is changed and may affect telemetry.
- User asks to verify "observability-ready" status.

## Goal
Ensure endpoint changes include consistent metrics, structured logs, and Sentry behavior.

## Workflow
1. Identify endpoint contract (route, method, expected status codes).
2. Add or update metric emission in telemetry service/interceptor.
3. Add structured logs with operation context (route, scenario type, status).
4. Ensure unexpected exceptions are captured once in Sentry boundary.
5. Verify no secrets or high-cardinality values are logged.

## Checklist
- [ ] Metric name uses stable `snake_case`.
- [ ] Labels are low-cardinality and bounded.
- [ ] Success and error branches produce useful logs.
- [ ] Unexpected errors are captured in Sentry exactly once.
- [ ] Frontend receives stable error format from backend filter.

## Output format
When finishing, provide:
1. What was instrumented.
2. Which metrics/log fields were added or updated.
3. Any remaining observability gaps.
