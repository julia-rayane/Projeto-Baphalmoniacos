import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { exigirJson } from '../../src/middlewares/jsonValidation.js';
import { HttpError } from '../../src/errors/HttpError.js';
import { asResponse, criarNext, criarReq, criarRes } from '../helpers/http.js';

function executar(method: string, contentType?: string) {
  const headers = contentType === undefined ? {} : { 'content-type': contentType };
  const { next, chamadas } = criarNext();
  const acao = () => exigirJson(criarReq({ method, headers }), asResponse(criarRes()), next);
  return { acao, chamadas };
}

const ehErro400 = (erro: unknown) => erro instanceof HttpError && erro.statusCode === 400;

describe('exigirJson (middleware de Content-Type)', () => {
  it('aceita POST com application/json', () => {
    const { acao, chamadas } = executar('POST', 'application/json');
    acao();
    assert.equal(chamadas.length, 1);
  });

  it('aceita application/json com charset', () => {
    const { acao, chamadas } = executar('PUT', 'application/json; charset=utf-8');
    acao();
    assert.equal(chamadas.length, 1);
  });

  it('lança HttpError 400 em POST sem Content-Type (valor ausente)', () => {
    const { acao, chamadas } = executar('POST');
    assert.throws(acao, ehErro400);
    assert.equal(chamadas.length, 0);
  });

  it('lança HttpError 400 em PUT com Content-Type diferente de JSON', () => {
    const { acao } = executar('PUT', 'text/plain');
    assert.throws(acao, ehErro400);
  });

  it('lança HttpError 400 com Content-Type vazio (string vazia)', () => {
    const { acao } = executar('POST', '');
    assert.throws(acao, ehErro400);
  });

  it('não exige JSON em GET nem em DELETE', () => {
    for (const metodo of ['GET', 'DELETE']) {
      const { acao, chamadas } = executar(metodo);
      acao();
      assert.equal(chamadas.length, 1, `${metodo} deveria passar`);
    }
  });
});
