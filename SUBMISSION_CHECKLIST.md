# Signal Lab — Submission Checklist

Заполни этот файл перед сдачей. Он поможет интервьюеру быстро проверить решение.

---

## Репозиторий

- **URL**: `https://github.com/garik-sukhanov/Signal-Lab-AI`
- **Ветка**: `dev`
- **Время работы** (приблизительно): `~8` часов

---

## Запуск

```bash
# Команда запуска:
docker compose up -d

# Команда проверки:
docker compose ps
curl localhost:3001/api/health
curl localhost:3001/metrics | rg "scenario_runs_total|http_requests_total"

# Команда остановки:
docker compose down

```

**Предусловия**: (Docker version, Node version, что ещё нужно)
- Docker `28.5.1` (Compose v2)
- Node.js `v22.20.0`
- npm `10.9.3`
- Перед запуском: `cp .env.example .env`

---

## Стек — подтверждение использования

| Технология | Используется? | Где посмотреть |
|-----------|:------------:|----------------|
| Next.js (App Router) | ☑ | `apps/frontend/app/(home)/page.tsx`, `apps/frontend/package.json` |
| shadcn/ui | ☑ | `apps/frontend/shared/components/ui/*`, `apps/frontend/features/observability-page/view-sections.tsx` |
| Tailwind CSS | ☑ | `apps/frontend/app/globals.css`, `apps/frontend/postcss.config.mjs` |
| TanStack Query | ☑ | `apps/frontend/app/providers.tsx`, `apps/frontend/features/observability-page/use-run-scenario-mutation.ts` |
| React Hook Form | ☑ | `apps/frontend/features/observability-page/controller.tsx`, `apps/frontend/features/observability-page/view-sections.tsx` |
| NestJS | ☑ | `apps/backend/src/app.module.ts`, `apps/backend/src/scenarios/scenarios.controller.ts` |
| PostgreSQL | ☑ | `docker-compose.yml` (service `postgres`), `prisma/schema.prisma` |
| Prisma | ☑ | `apps/backend/src/prisma/prisma.service.ts`, `prisma/schema.prisma` |
| Sentry | ☑ | `apps/backend/src/instrument.ts`, `apps/backend/src/scenarios/scenarios.service.ts` |
| Prometheus | ☑ | `docker-compose.yml` (service `prometheus`), `infra/prometheus/prometheus.yml` |
| Grafana | ☑ | `docker-compose.yml` (service `grafana`), `infra/grafana/dashboards/` |
| Loki | ☑ | `docker-compose.yml` (services `loki` + `promtail`), `infra/loki/config.yml` |

---

## Observability Verification

Опиши, как интервьюер может проверить каждый сигнал:

| Сигнал | Как воспроизвести | Где посмотреть результат |
|--------|-------------------|------------------------|
| Prometheus metric | В UI выбрать сценарий и нажать «Запустить» (или `curl -X POST localhost:3001/api/scenarios/run -H "Content-Type: application/json" -d '{"type":"success"}'`) | `http://localhost:3001/metrics`, метрики `scenario_runs_total`, `scenario_run_duration_seconds`, `http_requests_total` |
| Grafana dashboard | Сгенерировать 2-3 запуска сценариев (`success`, `slow_request`, `validation_error`) | `http://localhost:3100` (дашборд из `infra/grafana/dashboards/`) |
| Loki log | Запустить `slow_request` или `validation_error`/`system_error` (в backend пишутся structured logs) | `http://localhost:3100/explore` с query `{app="signal-lab"}` |
| Sentry exception | Выполнить `system_error` (`curl -X POST localhost:3001/api/scenarios/run -H "Content-Type: application/json" -d '{"type":"system_error"}'`) при заполненном `SENTRY_DSN` | Проект в Sentry (ошибка `Synthetic system failure`), ссылка есть в UI (`Observability Links`) |

---

## Cursor AI Layer

### Custom Skills

| # | Skill name | Назначение |
|---|-----------|-----------|
| 1 | `signal-lab-observability` | Чеклист observability для backend endpoint: метрики, structured logs, Sentry |
| 2 | `signal-lab-nest-endpoint` | Шаблон добавления endpoint (controller + service + dto) по конвенциям проекта |
| 3 | `signal-lab-prisma-change` | Безопасные изменения Prisma schema/migrations и синхронизация backend-кода |

### Commands

| # | Command | Что делает |
|---|---------|-----------|
| 1 | `/add-endpoint` | Добавляет новый backend endpoint c observability и проверками по rules |
| 2 | `/check-obs` | Проверяет observability-ready состояние backend-изменений |
| 3 | `/run-prd` | Запускает orchestrator workflow для пофазной реализации PRD |

### Hooks

| # | Hook | Какую проблему решает |
|---|------|----------------------|
| 1 | `post-write-prisma-reminder.sh` | После изменений `prisma/schema.prisma` напоминает про миграцию и `prisma generate` |
| 2 | `post-write-endpoint-obs-check.sh` | После изменения backend endpoint/service напоминает проверить метрики и structured logs |

### Rules

| # | Rule file | Что фиксирует |
|---|----------|---------------|
| 1 | `.cursor/rules/stack-constraints.mdc` | Фиксирует обязательный стек и запрещает альтернативы (Redux/SWR/raw SQL и т.д.) |
| 2 | `.cursor/rules/observability-conventions.mdc` | Правила по неймингу метрик, structured logging и использованию Sentry |
| 3 | `.cursor/rules/error-handling.mdc` | Единый подход к expected/unexpected ошибкам на frontend/backend |

### Marketplace Skills

| # | Skill | Зачем подключён |
|---|-------|----------------|
| 1 | `next-best-practices` | Best practices Next.js App Router, RSC boundaries, data patterns |
| 2 | `lb-shadcn-ui-skill` | Быстрая и корректная работа с shadcn/ui компонентами |
| 3 | `tailwind-v4-shadcn` | Устойчивый setup Tailwind v4 + shadcn, тема/переменные и типовые gotchas |
| 4 | `nestjs` | Паттерны NestJS модулей, DI, контроллеров и сервисов |
| 5 | `prisma-orm` | Рекомендации по Prisma ORM (schema, migrations, relation/query patterns) |
| 6 | `docker-expert` | Практики Docker/Compose для локального окружения и DX |

**Что закрыли custom skills, чего нет в marketplace:**
- Проектно-специфичный workflow Signal Lab: observability-чеклист для endpoint, шаблон `/add-endpoint`, guardrails под локальные rules и PRD-процесс.

---

## Orchestrator

- **Путь к skill**: `.cursor/skills/signal-lab-orchestrator/SKILL.md`
- **Путь к context file** (пример): `.execution/<executionId>/context.json`
- **Сколько фаз**: `7` (`analysis -> codebase -> planning -> decomposition -> implementation -> review -> report`)
- **Какие задачи для fast model**: low-complexity/atomic задачи (целевой объём `>= 80%`), сложные интеграции — для default
- **Поддерживает resume**: да

---

## Скриншоты / видео

- [x] UI приложения (`screenshots/app_ui.png`)
- [x] Grafana dashboard с данными (`screenshots/grafana.png`)
- [x] Loki logs (`screenshots/loki.png`)
- [x] Sentry error (`screenshots/sentry.png`)

(Приложи файлы или ссылки ниже)

---

## Что не успел и что сделал бы первым при +4 часах

Успел закрыть обязательный core (stack + observability + AI-layer + orchestrator).  
При +4 часах первым делом добавил бы:

1. Автоматизированный e2e smoke test всего verification walkthrough (run scenario -> metrics/logs/error).
2. Более детальный Grafana dashboard (разрезы по типам сценариев и latency перцентили).
3. Полный demo-пакет артефактов (видео + Sentry screenshot + короткий script-runbook).

---

## Вопросы для защиты (подготовься)

1. Почему именно такая декомпозиция skills?
2. Какие задачи подходят для малой модели и почему?
3. Какие marketplace skills подключил, а какие заменил custom — и почему?
4. Какие hooks реально снижают ошибки в повседневной работе?
5. Как orchestrator экономит контекст по сравнению с одним большим промптом?
