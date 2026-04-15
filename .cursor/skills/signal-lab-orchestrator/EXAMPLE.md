# Usage Examples

## Example 1: Start New Execution

```text
Run orchestrator for PRD:
docs/prds/004_prd-orchestrator.md
Priority: close all acceptance criteria first.
```

Expected orchestrator behavior:
1. Creates `.execution/<executionId>/`.
2. Initializes `context.json`.
3. Runs phases sequentially from `analysis` to `report`.
4. Returns final report.

## Example 2: Resume After Interruption

```text
Resume orchestrator for:
docs/prds/004_prd-orchestrator.md
Continue from saved context.
```

Expected orchestrator behavior:
1. Finds existing `.execution/*/context.json` for PRD.
2. Reads `currentPhase`.
3. Skips `completed` phases.
4. Continues from first `pending` or `in_progress` phase.

## Example 3: Failure in Review Loop

Scenario:
- Backend review fails due to missing metrics label guard.

Expected orchestrator behavior:
1. Records reviewer findings under `phases.review.result`.
2. Runs implementer task subset with feedback.
3. Re-runs reviewer.
4. Stops after 3 failed attempts and marks domain `failed`.
5. Continues to final report with explicit failure section.

## Minimal `context.json` bootstrap

```json
{
  "executionId": "2026-04-15-18-20",
  "prdPath": "docs/prds/004_prd-orchestrator.md",
  "status": "in_progress",
  "currentPhase": "analysis",
  "phases": {
    "analysis": { "status": "pending", "result": "" },
    "codebase": { "status": "pending", "result": "" },
    "planning": { "status": "pending", "result": "" },
    "decomposition": { "status": "pending", "result": "" },
    "implementation": {
      "status": "pending",
      "completedTasks": 0,
      "totalTasks": 0,
      "result": ""
    },
    "review": { "status": "pending", "result": "" },
    "report": { "status": "pending", "result": "" }
  },
  "signal": 0,
  "tasks": []
}
```
