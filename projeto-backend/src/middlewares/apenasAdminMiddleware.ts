import { Request, Response, NextFunction } from 'express';

// Deve ser usado SEMPRE depois do autenticacaoMiddleware,
// pois depende de (req as any).usuarioRole já ter sido preenchido pelo token.
export function apenasAdminMiddleware(req: Request, res: Response, next: NextFunction) {
  const role = (req as any).usuarioRole;

  if (role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores.' });
  }

  return next();
}
