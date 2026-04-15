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
- PostgreSQL: `localhost:5432`

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
