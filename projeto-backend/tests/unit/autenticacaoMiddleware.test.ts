import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { asResponse, criarNext, criarReq, criarRes } from '../helpers/http.js';

// O módulo de config lê JWT_SECRET ao ser importado; garantimos o valor antes do import.
process.env.JWT_SECRET ??= 'segredo-somente-para-testes-automatizados';
const { autenticacaoMiddleware } = await import('../../src/middlewares/autenticacaoMiddleware.js');
const { JWT_SECRET } = await import('../../src/config/auth.js');

const payload = { id: 42, email: 'ana@exemplo.com', role: 'cliente' };

function executar(authorization?: string) {
  const req = criarReq({ headers: authorization === undefined ? {} : { authorization } });
  const res = criarRes();
  const { next, chamadas } = criarNext();
  autenticacaoMiddleware(req, asResponse(res), next);
  return { req, res, chamadas };
}

describe('autenticacaoMiddleware (JWT)', () => {
  describe('token válido', () => {
    it('chama next() e anexa id e role do usuário à requisição', () => {
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '5m' });

      const { req, res, chamadas } = executar(`Bearer ${token}`);

      assert.equal(chamadas.length, 1);
      assert.equal(res.body, undefined);
      assert.equal(req.usuarioId, 42);
      assert.equal(req.usuarioRole, 'cliente');
    });

    it('aceita o esquema "bearer" em minúsculas', () => {
      const token = jwt.sign(payload, JWT_SECRET);
      const { chamadas } = executar(`bearer ${token}`);
      assert.equal(chamadas.length, 1);
    });
  });

  describe('requisições sem credencial válida (401)', () => {
    it('sem cabeçalho Authorization', () => {
      const { res, chamadas } = executar();
      assert.equal(res.statusCode, 401);
      assert.deepEqual(res.body, { error: 'Token não fornecido.' });
      assert.equal(chamadas.length, 0);
    });

    it('com cabeçalho vazio (string vazia)', () => {
      const { res } = executar('');
      assert.equal(res.statusCode, 401);
      assert.deepEqual(res.body, { error: 'Token não fornecido.' });
    });

    it('só com o esquema, sem o token', () => {
      const { res } = executar('Bearer');
      assert.equal(res.statusCode, 401);
      assert.deepEqual(res.body, { error: 'Erro no formato do token.' });
    });

    it('com partes demais no cabeçalho', () => {
      const { res } = executar('Bearer abc def');
      assert.equal(res.statusCode, 401);
      assert.deepEqual(res.body, { error: 'Erro no formato do token.' });
    });

    it('com esquema diferente de Bearer', () => {
      const { res } = executar('Basic dXN1YXJpbzpzZW5oYQ==');
      assert.equal(res.statusCode, 401);
      assert.deepEqual(res.body, { error: 'Token malformatado.' });
    });

    it('com token que não é um JWT', () => {
      const { res, chamadas } = executar('Bearer isto-nao-e-um-jwt');
      assert.equal(res.statusCode, 401);
      assert.deepEqual(res.body, { error: 'Token inválido ou expirado.' });
      assert.equal(chamadas.length, 0);
    });

    it('com token assinado por outro segredo', () => {
      const token = jwt.sign(payload, 'outro-segredo-qualquer');
      const { res } = executar(`Bearer ${token}`);
      assert.equal(res.statusCode, 401);
      assert.deepEqual(res.body, { error: 'Token inválido ou expirado.' });
    });

    it('com token expirado', () => {
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: -10 });
      const { res } = executar(`Bearer ${token}`);
      assert.equal(res.statusCode, 401);
      assert.deepEqual(res.body, { error: 'Token inválido ou expirado.' });
    });
  });
});
