# Coordination Prompts

This file defines phase-specific templates for orchestrator subagent delegation.

## Shared Prompt Envelope
Use this structure for every subagent call:

```text
Role: <phase-role>
Execution ID: <executionId>
PRD Source: <prdPath or prdText>
Current Phase: <phase>
Input Context: <relevant context.json excerpts>
Deliverables:
1) ...
2) ...
Constraints:
- Follow Signal Lab rules in `.cursor/rules/*`
- Keep output concise and structured
- Do not modify unrelated files
Return format:
{
  "status": "completed|failed",
  "summary": "...",
  "artifacts": [...],
  "risks": [...]
}
```

## Phase 1: `analysis`
- **Subagent type**: `generalPurpose`
- **Model**: `fast`
- **Goal**: extract requirements, features, constraints, acceptance criteria.
- **Expected output**:
  - Functional requirements list.
  - Non-functional constraints.
  - Acceptance checklist.
  - Open risks/assumptions.

## Phase 2: `codebase`
- **Subagent type**: `explore`
- **Model**: `fast`
- **Goal**: map affected modules, boundaries, and existing patterns.
- **Expected output**:
  - Relevant files/directories.
  - Reusable existing implementations.
  - Gap analysis against PRD requirements.

## Phase 3: `planning`
- **Subagent type**: `generalPurpose`
- **Model**: `default`
- **Goal**: produce high-level implementation strategy with minimal risk.
- **Expected output**:
  - Ordered milestones.
  - Integration points.
  - Validation checkpoints.

## Phase 4: `decomposition`
- **Subagent type**: `generalPurpose`
- **Model**: `default`
- **Goal**: split scope into atomic dependency-aware tasks.
- **Expected output**:
  - Tasks with `id`, `title`, `type`, `dependencies`.
  - `complexity` and recommended `model`.
  - Suggested `skill` per task.

### Decomposition Quality Gates
- Task is 5-10 minutes.
- Task description is 1-3 sentences.
- Task has explicit done condition.
- Low-complexity tasks are routed to `fast`.

## Phase 5: `implementation`
- **Subagent type**: `generalPurpose` (or `shell` for command-only tasks)
- **Model**: mixed, per task (`fast` for most, `default` for complex tasks)
- **Goal**: execute tasks in dependency groups.
- **Expected output per task**:
  - Status (`completed|failed`).
  - Changed files.
  - Validation evidence.
  - Retry note if needed.

### Implementation Grouping
1. Build DAG from `dependencies`.
2. Execute tasks level-by-level.
3. Parallelize independent low-risk tasks where practical.

## Phase 6: `review`
- **Subagent type**: `generalPurpose`
- **Model**: `fast`
- **Readonly**: `true` for reviewer.
- **Goal**: domain review loop with max 3 attempts.

### Review Loop Prompt
For each domain:
1. Reviewer checks correctness, regressions, and acceptance alignment.
2. If failed, create actionable feedback.
3. Implementer re-runs only needed task subset.
4. Re-review until pass or attempts exhausted.

### Review Result Shape
```json
{
  "domain": "backend",
  "status": "passed|failed",
  "attempts": 2,
  "findings": ["..."],
  "remainingRisks": ["..."]
}
```

## Phase 7: `report`
- **Subagent type**: `generalPurpose`
- **Model**: `fast`
- **Goal**: produce final run report from `context.json`.
- **Expected output**:
  - Run verdict.
  - Task and retry metrics.
  - Model usage distribution.
  - Completed/failed task highlights.
  - Next steps.

## Context Update Rules
After each phase:
1. Set phase status to `in_progress` before delegation.
2. Write result payload on success/failure.
3. Set phase status to `completed` or `failed`.
4. Update `currentPhase` to next pending phase.
5. Persist file immediately.

## Failure Handling
- If subagent fails unexpectedly, capture error in phase `result` and retry once.
- If second failure persists, mark phase `failed` and return control to user with actionable options.
- During implementation, failed tasks remain in task list with reason and attempts count.
