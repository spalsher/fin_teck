import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const correlationId = request.correlationId || 'unknown';

    // Only audit authenticated requests
    if (!user) {
      return next.handle();
    }

    const method = request.method;
    const url = request.url;
    const body = request.body;

    // Determine action and entity from the request
    const action = this.getActionFromMethod(method);
    const entity = this.getEntityFromUrl(url);

    // Skip auditing for read operations (GET requests)
    if (method === 'GET') {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: async (response) => {
          try {
            await this.prisma.auditLog.create({
              data: {
                userId: user.id,
                action,
                entity,
                entityId: response?.id || null,
                changes: this.sanitizeBody(body),
                ipAddress: request.ip,
                userAgent: request.headers['user-agent'],
                correlationId,
              },
            });
          } catch (error) {
            this.logger.error('Failed to create audit log', error);
          }
        },
        error: (error) => {
          this.logger.warn(`Audit log skipped due to error: ${error.message}`);
        },
      }),
    );
  }

  private getActionFromMethod(method: string): string {
    const actionMap: Record<string, string> = {
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    };
    return actionMap[method] || method;
  }

  private getEntityFromUrl(url: string): string {
    // Extract entity from URL (e.g., /api/customers/123 -> customers)
    const parts = url.split('/').filter(Boolean);
    return parts[1] || 'unknown';
  }

  private sanitizeBody(body: any): any {
    if (!body) return null;

    // Remove sensitive fields
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'passwordHash', 'token', 'secret', 'credentials'];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
