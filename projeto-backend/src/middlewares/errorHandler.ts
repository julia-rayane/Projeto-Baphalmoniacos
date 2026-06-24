import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/HttpError.js';

export function manipuladorDeErros(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  
  console.error(err);
  res.status(500).json({ erro: 'Ocorreu um erro interno no servidor.' });
}
