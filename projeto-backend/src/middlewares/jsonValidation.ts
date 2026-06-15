import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/HttpError.ts';

export function exigirJson(req: Request, res: Response, next: NextFunction) {
  if (['POST', 'PUT'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      throw new HttpError(400, "O cabeçalho Content-Type deve ser 'application/json'");
    }
  }
  next();
}
