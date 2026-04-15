---
name: signal-lab-orchestrator
description: Orchestrates PRD execution through phased subagent pipeline with context persistence, retry/resume, and final delivery report for Signal Lab.
---

# Signal Lab PRD Orchestrator

## When to Use
- User asks to implement a PRD end-to-end via staged execution.
- Need to keep main chat context lightweight and delegate heavy work to subagents.
- Execution must survive interruptions and continue from saved state.

## Input
- `prdPath` (preferred): path to PRD file in repository.
- `prdText` (fallback): raw PRD content when file path is unavailable.
- Optional constraints: deadlines, excluded scope, priority focus.

## Output
1. Updated execution state in `.execution/<executionId>/context.json`.
2. Phase-by-phase results saved in the context.
3. Final human-readable report with completed/failed tasks and next actions.

## Non-Goals
- Do not build a universal framework for all repositories.
- Do not fully replace human validation.
- Do not copy generic executor prompts without Signal Lab adaptation.

## Execution Contract
1. **Orchestrator delegates**: do not implement feature code directly when a subagent can do it.
2. **State first**: read and update `context.json` before and after each phase.
3. **Atomicity**: decompose work into tasks doable in 5-10 minutes.
4. **Model routing**: assign `fast` to low-complexity tasks (target >= 80%) and `default` to higher-complexity tasks.
5. **Resumability**: restart from `currentPhase`; do not rerun completed phases.
6. **Fault tolerance**: failed tasks are recorded and do not block unrelated tasks.

## Phase Pipeline
Follow strict order:
1. `analysis`
2. `codebase`
3. `planning`
4. `decomposition`
5. `implementation`
6. `review`
7. `report`

If a phase is `completed`, skip it on resume.

## Execution Workspace
- Create `.execution/<executionId>/` once per run.
- `executionId` format: `YYYY-MM-DD-HH-mm`.
- Store full run state in `.execution/<executionId>/context.json`.
- Keep optional supporting notes in `.execution/<executionId>/notes/`.

## Context Schema
Use this structure as canonical contract:

```json
{
  "executionId": "2026-04-15-18-20",
  "prdPath": "docs/prds/004_prd-orchestrator.md",
  "status": "in_progress",
  "currentPhase": "implementation",
  "phases": {
    "analysis": {
      "status": "completed",
      "result": "requirements, constraints, acceptance criteria"
    },
    "codebase": {
      "status": "completed",
      "result": "relevant modules, integration points, gaps"
    },
    "planning": {
      "status": "completed",
      "result": "high-level implementation plan"
    },
    "decomposition": {
      "status": "completed",
      "result": "atomic tasks + dependencies + model routing"
    },
    "implementation": {
      "status": "in_progress",
      "completedTasks": 0,
      "totalTasks": 0,
      "result": ""
    },
    "review": {
      "status": "pending",
      "result": ""
    },
    "report": {
      "status": "pending",
      "result": ""
    }
  },
  "signal": 0,
  "tasks": []
}
```

## Task Contract
Every task must include:
- `id`: stable identifier like `task-001`.
- `title`: concise action title.
- `type`: domain (`database`, `backend`, `frontend`, `infra`, `docs`).
- `description`: 1-3 sentences with expected outcome.
- `dependencies`: list of upstream task ids.
- `complexity`: `low | medium | high`.
- `model`: `fast | default`.
- `skill`: suggested skill to invoke.
- `status`: `pending | in_progress | completed | failed`.
- `attempts`: integer retry count.
- `result`: short execution outcome.

## Retry and Resume Rules
- If the run stops unexpectedly, read latest `.execution/*/context.json` for this PRD and resume from `currentPhase`.
- Never rerun a `completed` phase unless user explicitly requests re-execution.
- For task-level retries, cap at 3 attempts for review corrections.
- Mark unrecoverable task as `failed` and continue with independent tasks.

## Review Loop Rules
For each domain in `database`, `backend`, `frontend`:
1. Run reviewer subagent in readonly mode.
2. If reviewer fails, run implementer subagent with reviewer feedback.
3. Repeat until pass or max 3 attempts.
4. Record pass/fail and attempts in `context.json`.

## Report Contract
Final phase must output:
- Run status and duration.
- Task stats: completed, failed, retries.
- Model usage split: fast vs default.
- Completed items list.
- Failed items list (with reason).
- Explicit next steps.

Use this format:

```text
Signal Lab PRD Execution — Complete

Tasks: 12 completed, 1 failed, 2 retries
Duration: ~25 min
Model usage: 10 fast, 3 default

Completed:
  ✓ ...

Failed:
  ✗ ...

Next steps:
  - ...
```

## Skill Routing Guidance
Prefer these existing skills where applicable:
- `signal-lab-prisma-change` for Prisma/schema tasks.
- `signal-lab-nest-endpoint` for endpoint and service/controller tasks.
- `signal-lab-observability` for metrics/logging/Sentry completion.
- `next-best-practices`, `tailwind-v4-shadcn`, `lb-shadcn-ui-skill` for frontend tasks.

Detailed phase prompts are defined in `COORDINATION.md`.
