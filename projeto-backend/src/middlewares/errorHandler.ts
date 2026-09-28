import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../errors/HttpError.js';

export function manipuladorDeErros(err: Error, req: Request, res: Response, next: NextFunction) {
  // 1. Tratamento de Erros do Zod
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Dados de entrada inválidos.',
      issues: err.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    });
    return;
  }

  // 2. Erros HTTP customizados
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // 3. Erros internos
  console.error(err);
  res.status(500).json({ erro: 'Ocorreu um erro interno no servidor.' });
}
