import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { z, ZodError } from 'zod';
import { validate } from '../../src/middlewares/validate.js';
import { usuarioSchema } from '../../src/schemas/usuarioSchema.js';
import { asResponse, criarNext, criarReq, criarRes } from '../helpers/http.js';

describe('validate (middleware de validação com Zod)', () => {
  it('chama next() sem argumentos quando o corpo é válido', async () => {
    const { next, chamadas } = criarNext();
    const req = criarReq({ body: { nome: 'Ana', email: 'ana@exemplo.com', senha: 'abcdef' } });

    await validate(usuarioSchema)(req, asResponse(criarRes()), next);

    assert.deepEqual(chamadas, [[]]);
  });

  it('encaminha o ZodError para o next() quando o corpo é inválido', async () => {
    const { next, chamadas } = criarNext();
    const req = criarReq({ body: { nome: '', email: 'x', senha: '1' } });

    await validate(usuarioSchema)(req, asResponse(criarRes()), next);

    assert.equal(chamadas.length, 1);
    assert.ok(chamadas[0][0] instanceof ZodError);
  });

  it('entrega body, query e params ao schema', async () => {
    const schema = z.object({
      body: z.object({ a: z.number() }),
      query: z.object({ q: z.string() }),
      params: z.object({ id: z.string() }),
    });
    const { next, chamadas } = criarNext();
    const req = criarReq({ body: { a: 1 }, query: { q: 'busca' }, params: { id: '7' } });

    await validate(schema)(req, asResponse(criarRes()), next);

    assert.deepEqual(chamadas, [[]]);
  });

  it('trata corpo ausente (undefined) como erro de validação, sem lançar exceção', async () => {
    const { next, chamadas } = criarNext();
    const req = criarReq({ body: undefined });

    await validate(usuarioSchema)(req, asResponse(criarRes()), next);

    assert.ok(chamadas[0][0] instanceof ZodError);
  });
});
