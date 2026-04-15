import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ObservabilityService } from './observability.service';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly observability: ObservabilityService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      finalize(() => {
        this.observability.recordHttpRequest({
          method: request.method,
          path: this.normalizePathLabel(request),
          statusCode: response.statusCode,
        });
      }),
    );
  }

  private normalizePathLabel(request: Request) {
    const route = request.route as { path?: unknown } | undefined;
    const routePath = typeof route?.path === 'string' ? route.path : undefined;
    if (typeof routePath === 'string') {
      const baseUrl = request.baseUrl ?? '';
      return `${baseUrl}${routePath}`;
    }

    return request.path
      .split('/')
      .map((segment) => {
        if (segment.length === 0) {
          return segment;
        }

        if (/^\d+$/.test(segment)) {
          return ':id';
        }
        if (
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            segment,
          )
        ) {
          return ':uuid';
        }

        return segment;
      })
      .join('/');
  }
}
