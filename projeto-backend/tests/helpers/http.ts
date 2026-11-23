// Dublês simples de req/res/next do Express para testar middlewares e handlers
// sem servidor, sem banco e sem rede.
import type { NextFunction, Request, Response } from 'express';

export interface ResFalsa {
  statusCode: number;
  body: unknown;
  status(codigo: number): ResFalsa;
  json(corpo: unknown): ResFalsa;
  end(): ResFalsa;
}

export function criarReq(parcial: Record<string, unknown> = {}) {
  return { headers: {}, method: 'GET', body: {}, query: {}, params: {}, ...parcial } as unknown as Request &
    Record<string, any>;
}

export function criarRes() {
  const res: ResFalsa = {
    statusCode: 200,
    body: undefined,
    status(codigo) {
      res.statusCode = codigo;
      return res;
    },
    json(corpo) {
      res.body = corpo;
      return res;
    },
    end() {
      return res;
    },
  };
  return res;
}

export function asResponse(res: ResFalsa) {
  return res as unknown as Response;
}

// "next" que registra com o que foi chamado
export function criarNext() {
  const chamadas: unknown[][] = [];
  const next = ((...args: unknown[]) => {
    chamadas.push(args);
  }) as NextFunction;
  return { next, chamadas };
}
