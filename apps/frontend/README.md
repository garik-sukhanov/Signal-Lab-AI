# Frontend (Signal Lab)

Frontend приложение на Next.js (App Router), React, TanStack Query и React Hook Form.

## Запуск

```bash
npm install
npm run dev
```

Приложение будет доступно на [http://localhost:3000](http://localhost:3000).

## Основная структура

- `app/` — роутинг и композиция страницы (входная страница: `app/(home)/page.tsx`)
- `features/` — feature-модули (сейчас `observability-page`)
- `shared/` — общие UI-примитивы и библиотечные утилиты

## Скрипты

- `npm run dev` — запуск в режиме разработки
- `npm run build` — production сборка
- `npm run start` — запуск production сервера
- `npm run lint` — проверка ESLint

## Переменные окружения

Для observability UI используются следующие переменные:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_GRAFANA_URL`
- `NEXT_PUBLIC_SENTRY_URL`
- `NEXT_PUBLIC_LOKI_EXPLORE_URL`
- `NEXT_PUBLIC_LOKI_QUERY`
