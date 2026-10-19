import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import multer from 'multer';
import { HttpError } from '../errors/HttpError.js';

export function manipuladorDeErros(err: Error, req: Request, res: Response, next: NextFunction) {
  // 1. Tratamento de Erros do Multer (Upload de Arquivos)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'Arquivo excede o limite máximo de 2MB.' });
      return;
    }
    res.status(400).json({ error: err.message });
    return;
  }

  if (err && err.message === 'INVALID_FILE_TYPE') {
    res.status(400).json({ error: 'Tipo de arquivo não permitido. Apenas JPEG, PNG e GIF.' });
    return;
  }

  // 2. Tratamento de Erros do Zod (Validação)
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Dados de entrada inválidos.',
      issues: err.issues.map(issue => ({
        path: issue.path.filter(p => p !== 'body').join('.'),
        message: issue.message
      }))
    });
    return;
  }

  // 3. Erros HTTP customizados (ex: HttpError)
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // 4. Erros não tratados/internos do servidor
  console.error(err);
  res.status(500).json({ erro: 'Ocorreu um erro interno no servidor.' });
}
