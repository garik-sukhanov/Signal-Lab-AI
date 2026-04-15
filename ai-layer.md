# Signal Lab AI Layer

Документ фиксирует AI-слой репозитория для PRD 003 и объясняет, как новый чат Cursor должен продолжать работу без ручного онбординга.

## Rules

- `.cursor/rules/stack-constraints.mdc` — фиксирует разрешённый стек и запрещённые альтернативы.
- `.cursor/rules/observability-conventions.mdc` — правила по метрикам, логам и Sentry.
- `.cursor/rules/prisma-patterns.mdc` — практики работы с Prisma и ограничения по raw SQL/ORM.
- `.cursor/rules/frontend-patterns.mdc` — frontend-конвенции (TanStack Query, RHF, shadcn).
- `.cursor/rules/error-handling.mdc` — единые правила error handling backend/frontend.

## Custom skills

- `.cursor/skills/signal-lab-observability/SKILL.md`  
  Использовать для добавления/проверки observability в backend endpoint.
- `.cursor/skills/signal-lab-nest-endpoint/SKILL.md`  
  Использовать для создания endpoint по шаблону controller-service-dto.
- `.cursor/skills/signal-lab-prisma-change/SKILL.md`  
  Использовать при schema/migration изменениях Prisma.

## Marketplace skills

Подключено 8 релевантных навыков:

1. `.cursor/skills/next-best-practices/SKILL.md`
2. `.cursor/skills/lb-shadcn-ui-skill/SKILL.md`
3. `.cursor/skills/tailwind-v4-shadcn/SKILL.md`
4. `.cursor/skills/feature-sliced-design/SKILL.md`
5. `.cursor/skills/nestjs/SKILL.md`
6. `.cursor/skills/prisma-orm/SKILL.md`
7. `.cursor/skills/docker-expert/SKILL.md`
8. `.cursor/skills/design-postgres-tables/SKILL.md`

### Почему этот набор
- Frontend слой закрывают Next.js + shadcn + Tailwind + архитектурная декомпозиция.
- Backend слой закрывают NestJS + Prisma + PostgreSQL design patterns.
- Инфраструктуру и локальную эксплуатацию закрывает Docker skill.
- Custom skills покрывают project-specific workflow, которого обычно нет в marketplace (observability-ready endpoint, локальные conventions Signal Lab).

## Commands

- `.cursor/commands/add-endpoint.md` — scaffold endpoint + observability.
- `.cursor/commands/check-obs.md` — проверка observability-ready состояния.
- `.cursor/commands/run-prd.md` — выполнение PRD через orchestrator-style pipeline.

## Hooks

Конфигурация: `.cursor/hooks.json`

- `.cursor/hooks/post-write-prisma-reminder.sh`  
  Проблема: после изменения `prisma/schema.prisma` легко забыть миграцию/генерацию клиента.  
  Что делает: добавляет контекст-напоминание после изменения.
- `.cursor/hooks/post-write-endpoint-obs-check.sh`  
  Проблема: при изменении endpoint/service легко пропустить метрики и structured logging.  
  Что делает: добавляет контекст-проверку observability после изменения backend endpoint-файлов.

## Как использовать в новом чате

1. Дай агенту задачу (например, "Добавь endpoint ...").
2. При необходимости запускай команды (`/add-endpoint`, `/check-obs`, `/run-prd`).
3. Агент автоматически учитывает rules и применяет skills по trigger-сценариям.
4. Hooks добавляют guardrails после изменений.

## Acceptance checklist PRD 003

- [x] Минимум 5 rules файлов с чётким scope.
- [x] Минимум 3 custom skills с frontmatter и "When to Use".
- [x] Минимум 3 commands.
- [x] Минимум 2 hooks с описанием решаемой проблемы.
- [x] Минимум 6 marketplace skills с обоснованием.
- [x] Новый чат Cursor может продолжить работу по PRD без ручного контекста.
