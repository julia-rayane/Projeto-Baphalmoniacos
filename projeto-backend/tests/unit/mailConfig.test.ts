import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import nodemailer from 'nodemailer';
import mailConfig from '../../src/config/mail.js';

const CHAVES = [
  'EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_SECURE',
  'MAIL_HOST', 'MAIL_PORT', 'MAIL_USER', 'MAIL_PASS', 'MAIL_SECURE',
];

let original: Record<string, string | undefined>;

// Cada teste começa com as variáveis de e-mail limpas e devolve o ambiente no final
beforeEach(() => {
  original = {};
  for (const chave of CHAVES) {
    original[chave] = process.env[chave];
    delete process.env[chave];
  }
});

afterEach(() => {
  for (const chave of CHAVES) {
    if (original[chave] === undefined) delete process.env[chave];
    else process.env[chave] = original[chave];
  }
  mock.restoreAll();
});

describe('config/mail (escolha do servidor SMTP)', () => {
  it('usa o SMTP do .env quando host, usuário e senha existem', async () => {
    Object.assign(process.env, {
      EMAIL_HOST: 'smtp.exemplo.com',
      EMAIL_PORT: '2525',
      EMAIL_SECURE: 'true',
      EMAIL_USER: 'usuario',
      EMAIL_PASS: 'segredo',
    });
    const criarConta = mock.method(nodemailer, 'createTestAccount', async () => {
      throw new Error('não deveria criar conta de teste');
    });

    const config = await mailConfig();

    assert.deepEqual(config, {
      host: 'smtp.exemplo.com',
      port: 2525,
      secure: true,
      auth: { user: 'usuario', pass: 'segredo' },
    });
    assert.equal(criarConta.mock.callCount(), 0);
  });

  it('aceita o prefixo alternativo MAIL_* quando EMAIL_* não existe', async () => {
    Object.assign(process.env, { MAIL_HOST: 'h', MAIL_USER: 'u', MAIL_PASS: 'p' });

    const config = await mailConfig();

    assert.equal(config.host, 'h');
    assert.deepEqual(config.auth, { user: 'u', pass: 'p' });
  });

  it('usa a porta 587 e secure=false quando a porta é inválida ou ausente', async () => {
    Object.assign(process.env, {
      EMAIL_HOST: 'h', EMAIL_USER: 'u', EMAIL_PASS: 'p', EMAIL_PORT: 'abc',
    });

    const config = await mailConfig();

    assert.equal(config.port, 587);
    assert.equal(config.secure, false);
  });

  it('cai na conta de testes do Ethereal quando faltam credenciais (sem rede: criação é simulada)', async () => {
    process.env.EMAIL_HOST = 'smtp.exemplo.com'; // sem usuário/senha
    const criarConta = mock.method(nodemailer, 'createTestAccount', async () => ({
      user: 'conta-teste',
      pass: 'senha-teste',
    }));

    const config = await mailConfig();

    assert.equal(criarConta.mock.callCount(), 1);
    assert.deepEqual(config, {
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: 'conta-teste', pass: 'senha-teste' },
    });
  });
});
