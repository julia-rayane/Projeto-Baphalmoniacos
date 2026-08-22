import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SEGREDO_JWT = process.env.JWT_SECRET || 'secreta_super_segura';

interface PayloadToken {
  id: number;
  email: string;
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
    const dadosDecodificados = jwt.verify(token, SEGREDO_JWT) as PayloadToken;
    
    // Anexa o ID do usuário à requisição
    (req as any).usuarioId = dadosDecodificados.id;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}
