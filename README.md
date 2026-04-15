# Signal Lab — Platform Foundation

Каркас full-stack приложения с `Next.js` frontend, `NestJS` backend, `PostgreSQL 16` и `Prisma`.

## Структура

```text
signal-lab/
├── apps/
│   ├── frontend/          # Next.js (App Router, Tailwind, shadcn/ui, React Hook Form, TanStack Query)
│   └── backend/           # NestJS (strict TS, Swagger, Exception Filter)
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docker-compose.yml
├── .env.example
└── README.md
```

## Предусловия

- Docker Desktop (или Docker Engine + Compose v2)
- Node.js 22+ (для локального запуска без контейнеров)
- npm 10+

## Быстрый старт

1. Подготовить переменные окружения:

```bash
cp .env.example .env
```

> По умолчанию проект использует `POSTGRES_PORT=5433`, чтобы не конфликтовать с локальным Postgres на `5432`.

2. Поднять все сервисы:

```bash
docker compose up -d
```

3. Проверить health backend:

```bash
curl localhost:3001/api/health
```

Ожидаемый ответ:

```json
{ "status": "ok", "timestamp": "..." }
```

## Сервисы и URL

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:3001](http://localhost:3001)
- Swagger: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- PostgreSQL: `localhost:5433`

## Подключение Sentry

1. Создайте проект в Sentry (Node / NestJS) и скопируйте DSN.
2. В `.env` заполните:

```bash
SENTRY_DSN=https://<public_key>@o<org_id>.ingest.sentry.io/<project_id>
SENTRY_ENVIRONMENT=local
SENTRY_RELEASE=signal-lab@dev
SENTRY_TRACES_SAMPLE_RATE=0
```

3. Перезапустите backend:

```bash
docker compose up -d --build backend
```

4. Проверьте отправку события:

```bash
curl -X POST http://localhost:3001/api/scenarios/run \
  -H "Content-Type: application/json" \
  -d '{"type":"system_error"}'
```

После этого в Sentry должен появиться exception `Synthetic system failure`.

## Остановка окружения

```bash
docker compose down
```

## Что реализовано

- `GET /api/health` — базовый health-check.
- `POST /api/scenarios/run` — заглушка запуска сценария (создаёт запись `ScenarioRun` в БД).
- Global exception filter с единым форматом HTTP ошибок.
- Prisma schema + миграция для модели `ScenarioRun`.
- UI-страница с:
  - формой на React Hook Form,
  - запросом к API через TanStack Query,
  - компонентами `Button`, `Card`, `Input` в стиле shadcn/ui.

## Полезные команды (локально)

```bash
npm run frontend:dev
npm run backend:dev
npm run prisma:generate
npm run prisma:migrate
```

> Prisma команды из root автоматически подхватывают переменные из файла `.env`.

## AI Layer (PRD 003)

Для работы Cursor без ручного онбординга добавлен AI-слой проекта:

- rules: `.cursor/rules/`
- skills: `.cursor/skills/`
- commands: `.cursor/commands/`
- hooks: `.cursor/hooks.json` и `.cursor/hooks/`

Подробная документация и чеклист приёмки: [docs/ai-layer.md](docs/ai-layer.md)
