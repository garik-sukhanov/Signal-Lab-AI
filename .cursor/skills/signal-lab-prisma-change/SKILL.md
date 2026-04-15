---
name: signal-lab-prisma-change
description: Apply Prisma schema changes safely in Signal Lab. Use when adding models or fields, updating relations, creating migrations, or adjusting backend code after schema updates.
---

# Signal Lab Prisma Change

## When to Use
- Prisma model/field/relation is added or changed.
- Backend feature requires schema evolution.
- User asks to review database layer consistency.

## Workflow
1. Update `prisma/schema.prisma` with the minimal required change.
2. Create migration and regenerate Prisma client.
3. Update backend types/services impacted by schema change.
4. Verify API and domain logic still respect constraints.
5. Confirm observability and error handling still work for new DB paths.

## Guardrails
- Keep migration atomic and easy to review.
- Prefer nullable + backward-compatible transitions when possible.
- Avoid destructive schema edits without explicit user request.
- Do not use raw SQL in app services for routine operations.

## Verification
- [ ] Migration file exists and is coherent.
- [ ] Prisma client types match service usage.
- [ ] No broken imports after model changes.
- [ ] New DB paths are covered by logs/metrics where relevant.
