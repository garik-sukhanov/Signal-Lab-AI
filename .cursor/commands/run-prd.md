# /run-prd

Запусти реализацию PRD через skill `signal-lab-orchestrator`.

## Вход
- Путь к PRD файлу (например `docs/prds/004_prd-orchestrator.md`).
- Опциональные ограничения: срок, приоритеты, исключённый scope.

## Обязательное поведение
1. Активируй `.cursor/skills/signal-lab-orchestrator/SKILL.md` как главный workflow.
2. Создай `.execution/<executionId>/context.json` для нового запуска или подними существующий контекст для resume.
3. Пройди фазы строго по порядку: `analysis -> codebase -> planning -> decomposition -> implementation -> review -> report`.
4. Для каждой фазы:
   - читай актуальный `context.json`;
   - делегируй подзадачи subagent-ам;
   - сохраняй результат и статус фазы в контекст.
5. Выполняй atomic задачи dependency-группами и распределяй модели:
   - `fast` для low-complexity задач (целевой объём >= 80%);
   - `default` для сложной архитектуры и интеграций.
6. На фазе review используй цикл reviewer/implementer до 3 попыток по доменам (`database`, `backend`, `frontend`).
7. На фазе report верни итог с метриками выполнения, списком completed/failed задач и next steps.

## Resume / Retry правила
- При повторном запуске продолжай с `currentPhase`, не перевыполняй `completed` фазы.
- Failed задачи фиксируй в контексте и продолжай независимые задачи.
- Ошибки review loop после 3 попыток не должны блокировать финальный отчёт.

## Требования к качеству
- Держи основной чат компактным, тяжёлую работу делегируй в subagents.
- Следуй `.cursor/rules/*` и существующим custom/marketplace skills.
- Финальный отчёт должен явно показывать соответствие acceptance criteria PRD.
