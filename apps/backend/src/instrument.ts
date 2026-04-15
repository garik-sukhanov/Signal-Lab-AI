import * as Sentry from '@sentry/nestjs';

const dsn = process.env.SENTRY_DSN;
const environment =
  process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? 'development';
const release = process.env.SENTRY_RELEASE;
const tracesSampleRate = parseSampleRate(process.env.SENTRY_TRACES_SAMPLE_RATE);

if (dsn) {
  Sentry.init({
    dsn,
    environment,
    release,
    tracesSampleRate,
  });
}

function parseSampleRate(value: string | undefined) {
  if (!value) {
    return 0;
  }

  const normalized = Number(value);
  if (Number.isNaN(normalized) || normalized < 0 || normalized > 1) {
    return 0;
  }

  return normalized;
}
