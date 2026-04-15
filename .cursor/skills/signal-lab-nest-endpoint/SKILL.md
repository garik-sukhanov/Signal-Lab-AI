---
name: signal-lab-nest-endpoint
description: Create or extend a NestJS endpoint in Signal Lab following project conventions. Use when users request a new API route, DTO, service method, or controller action.
---

# Signal Lab Nest Endpoint

## When to Use
- User asks to add a new backend endpoint.
- Existing route needs new input/output contract.
- Endpoint should follow service-controller-prisma structure.

## Implementation Steps
1. Define or update DTO in `apps/backend/src/**/dto`.
2. Add controller handler with explicit route and response typing.
3. Implement business logic in service; keep controller thin.
4. Access DB only via `PrismaService`.
5. Add observability points (metrics + logs).
6. Validate API behavior with existing health/scenario style.

## Conventions
- DTOs own validation constraints.
- Controllers orchestrate and return service result.
- Services handle domain logic and integration boundaries.
- Error mapping must remain compatible with global exception filter.

## Done Criteria
- [ ] DTO, controller, and service are consistent.
- [ ] No raw SQL or extra ORM introduced.
- [ ] Endpoint has observability instrumentation.
- [ ] Types stay strict and readable.
