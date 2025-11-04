import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RequestMetadata = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return {
      ip: request.ip || request.connection?.remoteAddress,
      userAgent: request.headers['user-agent'],
    };
  },
);