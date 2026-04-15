import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RunScenarioDto } from './dto/run-scenario.dto';

@Injectable()
export class ScenariosService {
  constructor(private readonly prisma: PrismaService) {}

  async runScenario(input: RunScenarioDto) {
    const scenarioRun = await this.prisma.scenarioRun.create({
      data: {
        type: input.type,
        status: 'queued',
        metadata: input.payload
          ? (input.payload as Prisma.InputJsonValue)
          : undefined,
      },
    });

    return {
      id: scenarioRun.id,
      status: 'accepted',
      createdAt: scenarioRun.createdAt.toISOString(),
    };
  }
}
