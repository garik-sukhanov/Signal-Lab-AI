import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ObservabilityService } from '../telemetry/observability.service';
import { PrismaService } from '../prisma/prisma.service';
import { RunScenarioDto, ScenarioType } from './dto/run-scenario.dto';

@Injectable()
export class ScenariosService {
  private readonly logger = new Logger(ScenariosService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly observability: ObservabilityService,
  ) {}

  async runScenario(input: RunScenarioDto) {
    const startedAt = Date.now();
    const metadata = input.name
      ? ({ name: input.name } as Prisma.InputJsonValue)
      : undefined;

    switch (input.type) {
      case 'success':
        return this.completeScenario(input.type, startedAt, metadata);
      case 'slow_request':
        await this.sleep(this.randomInt(2000, 5000));
        return this.completeScenario(input.type, startedAt, metadata);
      case 'validation_error':
        await this.failScenario({
          type: input.type,
          startedAt,
          status: 'validation_error',
          errorMessage: 'Scenario input is invalid',
          metadata,
        });
        throw new BadRequestException('Scenario input is invalid');
      case 'system_error':
        await this.failScenario({
          type: input.type,
          startedAt,
          status: 'system_error',
          errorMessage: 'Synthetic system failure',
          metadata,
        });
        throw new InternalServerErrorException('Synthetic system failure');
      case 'teapot': {
        const duration = this.getDurationMs(startedAt);
        const scenarioRun = await this.prisma.scenarioRun.create({
          data: {
            type: input.type,
            status: 'teapot',
            duration,
            metadata: {
              ...(typeof metadata === 'object' && metadata ? metadata : {}),
              easter: true,
            } as Prisma.InputJsonValue,
          },
        });
        this.observability.recordScenarioRun({
          type: input.type,
          status: 'teapot',
          durationMs: duration,
        });
        this.logStructured('warn', 'teapot scenario returned 418', {
          scenarioType: input.type,
          scenarioId: scenarioRun.id,
          duration,
          error: null,
        });
        throw new HttpException(
          { signal: 42, message: "I'm a teapot" },
          HttpStatus.I_AM_A_TEAPOT,
        );
      }
      default:
        throw new BadRequestException('Unsupported scenario type');
    }
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

  private async completeScenario(
    type: ScenarioType,
    startedAt: number,
    metadata?: Prisma.InputJsonValue,
  ) {
    const duration = this.getDurationMs(startedAt);
    const scenarioRun = await this.prisma.scenarioRun.create({
      data: {
        type,
        status: 'completed',
        duration,
        metadata,
      },
    });

    this.observability.recordScenarioRun({
      type,
      status: 'completed',
      durationMs: duration,
    });
    this.logStructured('log', 'scenario completed', {
      scenarioType: type,
      scenarioId: scenarioRun.id,
      duration,
      error: null,
    });

    return {
      id: scenarioRun.id,
      status: scenarioRun.status,
      duration,
      createdAt: scenarioRun.createdAt.toISOString(),
    };
  }

  private async failScenario(params: {
    type: ScenarioType;
    startedAt: number;
    status: string;
    errorMessage: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    const duration = this.getDurationMs(params.startedAt);
    const scenarioRun = await this.prisma.scenarioRun.create({
      data: {
        type: params.type,
        status: params.status,
        duration,
        error: params.errorMessage,
        metadata: params.metadata,
      },
    });

    this.observability.recordScenarioRun({
      type: params.type,
      status: 'error',
      durationMs: duration,
    });
    this.logStructured('warn', 'scenario failed', {
      scenarioType: params.type,
      scenarioId: scenarioRun.id,
      duration,
      error: params.errorMessage,
    });
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
