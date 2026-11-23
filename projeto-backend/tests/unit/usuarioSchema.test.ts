import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { usuarioSchema } from '../../src/schemas/usuarioSchema.js';

const valido = { nome: 'Maria Isabely', email: 'maria@ifpb.edu.br', senha: 'senha123' };

const validar = (body: unknown) => usuarioSchema.safeParse({ body });

function mensagens(resultado: ReturnType<typeof validar>) {
  return resultado.success ? [] : resultado.error.issues.map((i) => i.message);
}

describe('usuarioSchema (validação do cadastro)', () => {
  describe('caminho válido', () => {
    it('aceita nome, e-mail e senha corretos', () => {
      assert.equal(validar(valido).success, true);
    });

    it('aceita senha com exatamente 6 caracteres (limite mínimo)', () => {
      assert.equal(validar({ ...valido, senha: '123456' }).success, true);
    });

    it('aceita nome com acentos e emoji', () => {
      assert.equal(validar({ ...valido, nome: 'José da Conceição 🍜' }).success, true);
    });

    it('descarta campos extras (ex.: "role") em vez de repassá-los', () => {
      const resultado = validar({ ...valido, role: 'admin' });
      assert.equal(resultado.success, true);
      if (resultado.success) {
        assert.equal('role' in resultado.data.body, false);
      }
    });
  });

  describe('entradas inválidas', () => {
    it('rejeita e-mail sem arroba', () => {
      const resultado = validar({ ...valido, email: 'email-invalido-sem-arroba' });
      assert.equal(resultado.success, false);
      assert.deepEqual(mensagens(resultado), ['E-mail inválido']);
    });

    it('rejeita e-mail sem domínio', () => {
      assert.equal(validar({ ...valido, email: 'maria@' }).success, false);
    });

    it('rejeita e-mail com espaço no meio', () => {
      assert.equal(validar({ ...valido, email: 'maria silva@ifpb.edu.br' }).success, false);
    });

    it('rejeita senha com 5 caracteres (logo abaixo do limite)', () => {
      const resultado = validar({ ...valido, senha: '12345' });
      assert.equal(resultado.success, false);
      assert.deepEqual(mensagens(resultado), ['A senha deve ter pelo menos 6 caracteres']);
    });

    it('rejeita tipos errados (nome numérico, senha nula)', () => {
      assert.equal(validar({ ...valido, nome: 123 }).success, false);
      assert.equal(validar({ ...valido, senha: null }).success, false);
    });
  });

  describe('casos de borda', () => {
    it('rejeita nome vazio com a mensagem de campo obrigatório', () => {
      const resultado = validar({ ...valido, nome: '' });
      assert.equal(resultado.success, false);
      assert.deepEqual(mensagens(resultado), ['O nome é obrigatório']);
    });

    it('rejeita senha vazia', () => {
      assert.equal(validar({ ...valido, senha: '' }).success, false);
    });

    it('rejeita campos ausentes e aponta cada um deles', () => {
      const resultado = validar({});
      assert.equal(resultado.success, false);
      if (!resultado.success) {
        const caminhos = resultado.error.issues.map((i) => i.path.join('.')).sort();
        assert.deepEqual(caminhos, ['body.email', 'body.nome', 'body.senha']);
      }
    });

    it('rejeita corpo ausente (undefined) e corpo nulo', () => {
      assert.equal(validar(undefined).success, false);
      assert.equal(validar(null).success, false);
    });

    it('rejeita e-mail com caracteres fora do padrão ASCII (encoding inesperado)', () => {
      assert.equal(validar({ ...valido, email: 'josé@exemplo.com' }).success, false);
    });
  });
});
