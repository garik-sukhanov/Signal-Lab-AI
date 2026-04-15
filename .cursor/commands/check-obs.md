# /check-obs

Проверь, что backend change observability-ready.

## Что проверять
1. Для новых/обновлённых endpoint есть метрика и structured log.
2. Метрики имеют стабильное имя и low-cardinality labels.
3. Unexpected errors отправляются в Sentry один раз.
4. Ошибки возвращаются в унифицированном формате.
5. В логах нет секретов и чувствительных данных.

## Формат ответа
- `status`: pass | fail
- `findings`: список конкретных проблем по файлам
- `fixes`: короткий план исправления (если fail)
- `residual_risk`: что ещё стоит проверить вручную
