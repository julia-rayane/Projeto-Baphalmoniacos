import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../errors/HttpError.js';

export function manipuladorDeErros(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Dados de entrada inválidos.',
      issues: err.errors.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ erro: 'Ocorreu um erro interno no servidor.' });
}
