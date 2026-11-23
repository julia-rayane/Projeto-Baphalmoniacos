import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import multer from 'multer';
import { manipuladorDeErros } from '../../src/middlewares/errorHandler.js';
import { HttpError } from '../../src/errors/HttpError.js';
import { usuarioSchema } from '../../src/schemas/usuarioSchema.js';
import { asResponse, criarNext, criarReq, criarRes } from '../helpers/http.js';

function tratar(erro: Error) {
  const res = criarRes();
  const { next, chamadas } = criarNext();
  manipuladorDeErros(erro, criarReq(), asResponse(res), next);
  return { res, chamadas };
}

describe('manipuladorDeErros (tratamento centralizado de erros)', () => {
  describe('erros de validação (Zod)', () => {
    it('responde 400 e lista os campos inválidos sem o prefixo "body"', () => {
      const resultado = usuarioSchema.safeParse({ body: { nome: '', email: 'x', senha: '1' } });
      assert.equal(resultado.success, false);
      if (resultado.success) return;

      const { res } = tratar(resultado.error);

      assert.equal(res.statusCode, 400);
      const corpo = res.body as { error: string; issues: { path: string; message: string }[] };
      assert.equal(corpo.error, 'Dados de entrada inválidos.');
      assert.deepEqual(corpo.issues.map((i) => i.path).sort(), ['email', 'nome', 'senha']);
    });
  });

  describe('erros de upload (Multer)', () => {
    it('arquivo acima do limite → 400 com mensagem de 2MB', () => {
      const { res } = tratar(new multer.MulterError('LIMIT_FILE_SIZE'));
      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { error: 'Arquivo excede o limite máximo de 2MB.' });
    });

    it('campo de arquivo errado → 400 explicando o nome do campo', () => {
      const { res } = tratar(new multer.MulterError('LIMIT_UNEXPECTED_FILE'));
      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, {
        error: 'Campo de arquivo inválido. Envie o arquivo no campo "image".',
      });
    });

    it('outros erros do Multer → 400 com a mensagem original', () => {
      const erro = new multer.MulterError('LIMIT_FILE_COUNT');
      const { res } = tratar(erro);
      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { error: erro.message });
    });

    it('tipo de arquivo fora da lista permitida → 400', () => {
      const { res } = tratar(new Error('INVALID_FILE_TYPE'));
      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { error: 'Tipo de arquivo não permitido. Apenas JPEG, PNG e GIF.' });
    });
  });

  describe('erros HTTP customizados', () => {
    it('usa o statusCode e a mensagem do HttpError', () => {
      const { res } = tratar(new HttpError(404, 'Recurso não encontrado'));
      assert.equal(res.statusCode, 404);
      assert.deepEqual(res.body, { error: 'Recurso não encontrado' });
    });
  });

  describe('erros inesperados', () => {
    it('responde 500 genérico, sem vazar a mensagem interna', () => {
      const registro = mock.method(console, 'error', () => {});
      try {
        const { res } = tratar(new Error('senha do banco: 123 (detalhe interno)'));

        assert.equal(res.statusCode, 500);
        assert.deepEqual(res.body, { error: 'Ocorreu um erro interno no servidor.' });
        assert.equal(registro.mock.callCount(), 1, 'o erro real deve ir só para o log do servidor');
      } finally {
        registro.mock.restore();
      }
    });
  });
});
