import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { Prisma } from '@prisma/client';
import { ObservabilityService } from '../telemetry/observability.service';
import { PrismaService } from '../prisma/prisma.service';
import { RunScenarioDto, ScenarioType } from './dto/run-scenario.dto';

type ScenarioRunStatus =
  | 'completed'
  | 'validation_error'
  | 'system_error'
  | 'teapot';

type ScenarioLogLevel = 'log' | 'warn' | 'error';

type ScenarioContext = {
  type: ScenarioType;
  startedAt: number;
  metadata?: Prisma.InputJsonValue;
  name?: string;
};

type PersistedScenarioRun = {
  id: string;
  status: string;
  duration: number;
  createdAt: string;
};

type ScenarioFailureParams = {
  status: Exclude<ScenarioRunStatus, 'completed'>;
  errorMessage: string;
  logLevel: Extract<ScenarioLogLevel, 'warn' | 'error'>;
};

@Injectable()
export class ScenariosService {
  private readonly logger = new Logger(ScenariosService.name);
  private readonly scenarioHandlers: Record<
    ScenarioType,
    (context: ScenarioContext) => Promise<PersistedScenarioRun>
  > = {
    success: async (context) => this.handleSuccess(context),
    slow_request: async (context) => this.handleSlowRequest(context),
    validation_error: async (context) =>
      this.handleFailure(context, {
        status: 'validation_error',
        errorMessage: 'Scenario input is invalid',
        logLevel: 'warn',
      }),
    system_error: async (context) => this.handleSystemError(context),
    teapot: async (context) => this.handleTeapot(context),
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly observability: ObservabilityService,
  ) {}

  async runScenario(input: RunScenarioDto) {
    const context = this.createScenarioContext(input);
    const handler = this.scenarioHandlers[input.type];
    if (!handler) {
      throw new BadRequestException('Unsupported scenario type');
    }

    return handler(context);
  }

  async getRecentRuns() {
    const runs = await this.prisma.scenarioRun.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return runs.map((run) => ({
      id: run.id,
      type: run.type,
      status: run.status,
      duration: run.duration,
      error: run.error,
      createdAt: run.createdAt.toISOString(),
    }));
  }

  private createScenarioContext(input: RunScenarioDto): ScenarioContext {
    return {
      type: input.type,
      startedAt: Date.now(),
      metadata: this.buildMetadata(input.name),
      name: input.name,
    };
  }

  private buildMetadata(name?: string): Prisma.InputJsonValue | undefined {
    if (!name) {
      return undefined;
    }

    return { name } as Prisma.InputJsonValue;
  }

  private async handleSuccess(
    context: ScenarioContext,
  ): Promise<PersistedScenarioRun> {
    return this.persistScenarioRun({
      context,
      status: 'completed',
      metricStatus: 'completed',
      logLevel: 'log',
      logMessage: 'scenario completed',
      errorMessage: null,
      metadata: context.metadata,
    });
  }

  private async handleSlowRequest(
    context: ScenarioContext,
  ): Promise<PersistedScenarioRun> {
    await this.sleep(this.randomInt(2000, 5000));
    const result = await this.persistScenarioRun({
      context,
      status: 'completed',
      metricStatus: 'completed',
      logLevel: 'log',
      logMessage: 'scenario completed',
      errorMessage: null,
      metadata: context.metadata,
    });

    this.logStructured(
      'warn',
      'slow request scenario exceeded expected latency',
      {
        scenarioType: context.type,
        scenarioId: result.id,
        duration: result.duration,
        error: null,
      },
    );

    return result;
  }

  private async handleFailure(
    context: ScenarioContext,
    params: ScenarioFailureParams,
  ): Promise<never> {
    this.addValidationBreadcrumbIfNeeded(context.type, context.name);
    await this.persistScenarioRun({
      context,
      status: params.status,
      metricStatus: params.status,
      logLevel: params.logLevel,
      logMessage: 'scenario failed',
      errorMessage: params.errorMessage,
      metadata: context.metadata,
    });

    if (params.status === 'validation_error') {
      throw new BadRequestException(params.errorMessage);
    }

    throw new InternalServerErrorException(params.errorMessage);
  }

  private async handleSystemError(
    context: ScenarioContext,
  ): Promise<PersistedScenarioRun> {
    this.captureSystemError({
      type: context.type,
      startedAt: context.startedAt,
      name: context.name,
    });

    return this.handleFailure(context, {
      status: 'system_error',
      errorMessage: 'Synthetic system failure',
      logLevel: 'error',
    });
  }

  private async handleTeapot(
    context: ScenarioContext,
  ): Promise<PersistedScenarioRun> {
    await this.persistScenarioRun({
      context,
      status: 'teapot',
      metricStatus: 'teapot',
      logLevel: 'warn',
      logMessage: 'teapot scenario returned 418',
      errorMessage: null,
      metadata: this.buildTeapotMetadata(context.metadata),
    });

    throw new HttpException(
      { signal: 42, message: "I'm a teapot" },
      HttpStatus.I_AM_A_TEAPOT,
    );
  }

  private buildTeapotMetadata(
    metadata?: Prisma.InputJsonValue,
  ): Prisma.InputJsonValue {
    return {
      ...(typeof metadata === 'object' && metadata ? metadata : {}),
      easter: true,
    } as Prisma.InputJsonValue;
  }

  private addValidationBreadcrumbIfNeeded(type: ScenarioType, name?: string) {
    if (type !== 'validation_error') {
      return;
    }
    Sentry.addBreadcrumb({
      category: 'scenario',
      level: 'warning',
      message: 'validation_error scenario triggered',
      data: {
        scenarioType: type,
        name: name ?? null,
      },
    });
  }

  private async persistScenarioRun(params: {
    context: ScenarioContext;
    status: ScenarioRunStatus;
    metricStatus: ScenarioRunStatus;
    logLevel: ScenarioLogLevel;
    logMessage: string;
    errorMessage: string | null;
    metadata?: Prisma.InputJsonValue;
  }): Promise<PersistedScenarioRun> {
    const duration = this.getDurationMs(params.context.startedAt);
    const scenarioRun = await this.prisma.scenarioRun.create({
      data: {
        type: params.context.type,
        status: params.status,
        duration,
        error: params.errorMessage ?? undefined,
        metadata: params.metadata,
      },
    });

    this.observability.recordScenarioRun({
      type: params.context.type,
      status: params.metricStatus,
      durationMs: duration,
    });
    this.logStructured(params.logLevel, params.logMessage, {
      scenarioType: params.context.type,
      scenarioId: scenarioRun.id,
      duration,
      error: params.errorMessage,
    });

    return {
      id: scenarioRun.id,
      status: scenarioRun.status,
      duration,
      createdAt: scenarioRun.createdAt.toISOString(),
    };
  }

  private getDurationMs(startedAt: number) {
    return Date.now() - startedAt;
  }

  private randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private captureSystemError(params: {
    type: ScenarioType;
    startedAt: number;
    name?: string;
  }) {
    const error = new Error('Synthetic system failure');
    Sentry.withScope(
      (scope: {
        setTag: (key: string, value: string) => void;
        setExtra: (key: string, value: unknown) => void;
      }) => {
        scope.setTag('scenario.type', params.type);
        scope.setTag('scenario.synthetic', 'true');
        scope.setExtra('scenario.name', params.name ?? null);
        scope.setExtra('scenario.startedAt', params.startedAt);
        Sentry.captureException(error);
      },
    );
  }

  private logStructured(
    level: 'log' | 'warn' | 'error',
    message: string,
    context: {
      scenarioType: ScenarioType;
      scenarioId: string;
      duration: number;
      error: string | null;
    },
  ) {
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    if (level === 'error') {
      this.logger.error(JSON.stringify(payload));
      return;
    }
    if (level === 'warn') {
      this.logger.warn(JSON.stringify(payload));
      return;
    }
    this.logger.log(JSON.stringify(payload));
  }
}
