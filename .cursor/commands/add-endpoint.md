# /add-endpoint

Создай новый backend endpoint в стиле Signal Lab.

## Вход
- Domain/module name.
- Route and HTTP method.
- Input DTO fields.
- Expected success/error response.

## Что сделать
1. Добавь DTO в `apps/backend/src/<module>/dto`.
2. Добавь endpoint в controller.
3. Добавь бизнес-логику в service через `PrismaService` при необходимости.
4. Добавь observability: структурированный лог + метрику.
5. Проверь совместимость с глобальным error filter.

## Ограничения
- Следуй rules в `.cursor/rules/*`.
- Не добавляй новые state/ORM библиотеки.
- Не используй raw SQL в сервисах.

## Результат
- Перечень изменённых файлов.
- Краткий отчёт по observability.
- Что протестировать вручную (curl/UI).
