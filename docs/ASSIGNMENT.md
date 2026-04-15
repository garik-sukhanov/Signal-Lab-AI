# Signal Lab — тестовое задание AI Engineer

> Построй observability playground и AI-слой, который позволит Cursor продолжать работу без тебя.

## Зачем это задание

Мы не проверяем, умеешь ли ты писать CRUD. Мы проверяем три вещи одновременно:

1. **Инженерия** — собрать рабочее приложение на заданном стеке с реальной observability.
2. **AI-архитектура** — превратить репозиторий в среду, где Cursor работает предсказуемо: `skills`, `rules`, `commands`, `hooks`, marketplace skills.
3. **Context economy** — спроектировать orchestrator skill, который делит работу на атомарные задачи, экономит контекст и позволяет малым моделям делать большую часть работы.

## Что ты строишь

**Signal Lab** — маленькое приложение, через которое можно запускать сценарии, генерирующие метрики, логи и ошибки. Интервьюер нажимает кнопку в UI, видит результат в Grafana, Loki и Sentry.

```
┌─────────────────────────────────────────────────────┐
│                    Signal Lab UI                     │
│              (Next.js + shadcn/ui + TW)              │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ Run Scenario│  │  Run History │  │  Obs Links │  │
│  │  (RHF form) │  │ (TanStack Q) │  │  Grafana…  │  │
│  └──────┬──────┘  └──────────────┘  └────────────┘  │
└─────────┼───────────────────────────────────────────┘
          │ POST /api/scenarios
          ▼
┌─────────────────────────────────────────────────────┐
│                   NestJS API                         │
│                                                     │
│  scenario.controller → scenario.service              │
│       │          │           │          │             │
│   Prisma/PG   Prometheus  Sentry    Structured       │
│   (persist)   (metrics)   (errors)  Logs → Loki      │
└─────────────────────────────────────────────────────┘
          │                    │
          ▼                    ▼
┌──────────────┐    ┌─────────────────────┐
│  PostgreSQL  │    │      Grafana        │
│   (Prisma)   │    │  dashboards:        │
└──────────────┘    │  metrics + logs     │
                    └─────────────────────┘
```

## Обязательный стек

| Слой | Технологии |
|------|-----------|
| Frontend | Next.js, shadcn/ui, Tailwind CSS, TanStack Query, React Hook Form |
| Backend | NestJS |
| Data | PostgreSQL, Prisma |
| Observability | Sentry, Prometheus, Grafana, Loki |
| Infra | Docker Compose (всё поднимается одной командой) |

Замена любого элемента стека — автоматический штраф, если нет сильной аргументации.

## Что ты сдаёшь

### Код + инфра
- Рабочее приложение Signal Lab.
- `docker-compose.yml`, который поднимает всё: app + PG + Prometheus + Grafana + Loki.
- Prisma schema и миграции.
- Grafana dashboard (provisioned или импортируемый).

### Cursor AI layer
- `.cursor/rules/` — ограничения стека, conventions, guardrails.
- `.cursor/skills/` — минимум **3 custom skills**, включая 1 observability-skill.
- `.cursor/commands/` — минимум **3 команды** для типовых workflows.
- Hooks — минимум **2 hook** с реальной пользой.
- Marketplace skills — минимум **6 подключённых**, каждый объяснён.
- **1 orchestrator skill** — по мотивам multi-agent PRD executor (см. PRD 004).

### Документация
- `README` с запуском, проверкой, остановкой.
- Описание AI-слоя: что, зачем, как использовать.
- Инструкция демонстрации: "нажми тут, посмотри там".

## Как мы проверяем

```
git clone <repo>
docker compose up -d        # всё поднялось?
open http://localhost:3000   # UI работает?
# нажимаем "Run Scenario: system_error"
open http://localhost:3001/metrics   # метрика выросла?
open http://localhost:3100           # лог появился в Loki?
open http://localhost:3000/grafana   # dashboard показывает сигнал?
# открываем Sentry — ошибка зафиксирована?
# открываем .cursor/ — skills, rules, commands, hooks на месте?
# запускаем orchestrator skill в новом чате — он работает?
```

Целевое время проверки: **15 минут**.

## Состав пакета PRD

| # | Файл | Про что |
|---|------|---------|
| 1 | `prds/001_prd-platform-foundation.md` | Каркас: Next.js + NestJS + Prisma + Docker |
| 2 | `prds/002_prd-observability-demo.md` | Сценарии, метрики, логи, dashboards |
| 3 | `prds/003_prd-cursor-ai-layer.md` | Skills, rules, commands, hooks, marketplace |
| 4 | `prds/004_prd-orchestrator.md` | Small-model orchestrator skill |

## Таймбокс

- Целевой объём: **6–8 часов**.
- Максимум: **12 часов**.

Если не успеваешь всё — приоритезируй. Лучше показать глубокую декомпозицию и работающий core, чем поверхностно закрыть все пункты.

## Что мы ценим

- Приложение стартует одной командой и работает.
- Observability проверяема руками, а не только описана в README.
- Cursor-артефакты полезны в новом чате без ручных пояснений.
- Skills scoped, commands удобны, hooks ловят реальные ошибки.
- Orchestrator экономит контекст и делегирует атомарные задачи малым моделям.
- Внимание к деталям. Мы читаем PRD целиком — и тебе советуем.

## Оценка

- `RUBRIC.md` — критерии и баллы.
- `SUBMISSION_CHECKLIST.md` — шаблон, который заполняешь при сдаче.
