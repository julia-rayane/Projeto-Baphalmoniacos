import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../errors/HttpError.js';

export function manipuladorDeErros(err: Error, req: Request, res: Response, next: NextFunction) {
  // 1. Tratamento de Erros do Zod (Validação)
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Dados de entrada inválidos.',
      issues: err.issues.map(issue => ({
        // Remove 'body' do caminho para exibir diretamente o nome do campo (ex: "email" em vez de "body.email")
        path: issue.path.filter(p => p !== 'body').join('.'),
        message: issue.message
      }))
    });
    return;
  }

  // 2. Erros HTTP customizados (ex: HttpError)
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // 3. Erros não tratados/internos do servidor
  console.error(err);
  res.status(500).json({ erro: 'Ocorreu um erro interno no servidor.' });
}
