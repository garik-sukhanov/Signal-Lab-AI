import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ScenariosController } from './scenarios/scenarios.controller';
import { ScenariosService } from './scenarios/scenarios.service';
import { HttpMetricsInterceptor } from './telemetry/http-metrics.interceptor';
import { MetricsController } from './telemetry/metrics.controller';
import { ObservabilityService } from './telemetry/observability.service';

@Module({
  imports: [PrismaModule],
  controllers: [HealthController, ScenariosController, MetricsController],
  providers: [
    ScenariosService,
    ObservabilityService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor,
    },
  ],
})
export class AppModule {}
