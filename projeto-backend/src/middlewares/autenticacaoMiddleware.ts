import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/auth.js';

interface PayloadToken {
  id: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export function autenticacaoMiddleware(req: Request, res: Response, next: NextFunction) {
  const cabecalhoAuth = req.headers.authorization;

  if (!cabecalhoAuth) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const partes = cabecalhoAuth.split(' ');

  if (partes.length !== 2) {
    return res.status(401).json({ error: 'Erro no formato do token.' });
  }

  const [esquema, token] = partes;

  if (!/^Bearer$/i.test(esquema)) {
    return res.status(401).json({ error: 'Token malformatado.' });
  }

  try {
    const dadosDecodificados = jwt.verify(token, JWT_SECRET) as PayloadToken;

    // Anexa o ID e o tipo (role) do usuário à requisição
    (req as any).usuarioId = dadosDecodificados.id;
    (req as any).usuarioRole = dadosDecodificados.role;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}
