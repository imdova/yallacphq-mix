import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';

const HEADER = 'x-request-id';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const existing = req.headers[HEADER];
    const fromHeader = Array.isArray(existing) ? existing[0] : existing;
    const id =
      (typeof fromHeader === 'string' && fromHeader.trim()) || randomUUID();

    req.id = id;
    res.setHeader('X-Request-Id', id);
    next();
  }
}
